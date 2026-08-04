// Sends the newest changelog entry to the Buttondown mailing list.
//
// Reads the top `## ` section of en/changelog.mdx, converts the MDX to plain
// Markdown, and creates the email with status `about_to_send` — Buttondown
// delivers it to every confirmed subscriber within a few minutes.
//
// Guard: if the newest heading is identical to the one in the previous commit,
// nothing is sent. That way editing an existing entry (a typo, a broken link)
// does not re-blast the list; only a brand new `## ` heading does.
//
// Env:
//   BUTTONDOWN_API_KEY  required, repo secret
//   DOCS_BASE_URL       required, e.g. https://docs.fire.rest — used to turn
//                       /en/... links into absolute ones
//   DRY_RUN             optional, "true" prints the email instead of sending
//   DRAFT_ONLY          optional, "true" creates the email in Buttondown but
//                       leaves it unsent, for a dress rehearsal against the real
//                       newsletter without reaching a single subscriber

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const CHANGELOG = 'en/changelog.mdx'
const API = 'https://api.buttondown.com/v1/emails'
const API_VERSION = '2026-04-01'

const apiKey = process.env.BUTTONDOWN_API_KEY
const baseUrl = (process.env.DOCS_BASE_URL || '').replace(/\/$/, '')
const dryRun = process.env.DRY_RUN === 'true'
const draftOnly = process.env.DRAFT_ONLY === 'true'

if (!apiKey && !dryRun) fail('BUTTONDOWN_API_KEY is not set.')
if (!baseUrl) fail('DOCS_BASE_URL is not set.')

function fail(message) {
  console.error(`✗ ${message}`)
  process.exit(1)
}

/** Everything from the first `## ` heading up to the next one. */
function latestEntry(source) {
  const withoutFrontmatter = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
  const match = withoutFrontmatter.match(/^## .*(?:\r?\n(?!## ).*)*/m)
  return match ? match[0].trim() : null
}

/**
 * First line of an entry, minus the `## `, used as the email subject.
 *
 * Markdown is stripped: a subject line is plain text in every mail client, so
 * `order.opened` would arrive with the backticks showing.
 */
function heading(entry) {
  if (!entry) return null
  return entry
    .split('\n')[0]
    .replace(/^##\s*/, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .trim()
}

/** The same file as it was one commit ago, or null if it did not exist. */
function previousVersion() {
  try {
    return execFileSync('git', ['show', `HEAD^:${CHANGELOG}`], {
      encoding: 'utf8',
    })
  } catch {
    return null
  }
}

/**
 * MDX → Markdown. Buttondown renders Markdown, not JSX, so Mintlify components
 * have to go. Callouts keep their text as a blockquote; every other tag is
 * dropped but its children are preserved.
 */
function toMarkdown(entry) {
  return entry
    .replace(
      /<(Note|Warning|Info|Tip|Check)>([\s\S]*?)<\/\1>/g,
      (_, tag, inner) =>
        `\n\n> **${tag}**\n` +
        inner
          .trim()
          .split('\n')
          .map((line) => `> ${line.trim()}`)
          .join('\n'),
    )
    .replace(/<\/?[A-Z][A-Za-z]*[^>]*>/g, '')
    .replace(/\]\((\/(?:en|es|pt)\/[^)]*)\)/g, `](${baseUrl}$1)`)
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const current = latestEntry(readFileSync(CHANGELOG, 'utf8'))
if (!current) fail(`No \`## \` entry found in ${CHANGELOG}.`)

const previousFile = previousVersion()
const previousHeading = previousFile ? heading(latestEntry(previousFile)) : null
const subject = heading(current)

const isEdit = previousHeading === subject

// The guard only protects the automatic path. A preview or a draft is asked for
// by hand, and by then the newest entry always looks like an edit — it is
// already on main — so the guard would make both impossible to ever use.
if (isEdit && !dryRun && !draftOnly) {
  console.log(`• Newest entry is still "${subject}" — edit only, nothing sent.`)
  process.exit(0)
}

const body = `${toMarkdown(current)}\n\n---\n\n[Read the full changelog](${baseUrl}/en/changelog)`

if (dryRun) {
  if (isEdit) {
    console.log('• Preview only — a real run would send nothing (entry unchanged).\n')
  }
  console.log(`Subject: ${subject}\n\n${body}`)
  process.exit(0)
}

const headers = {
  Authorization: `Token ${apiKey}`,
  'Content-Type': 'application/json',
  'X-API-Version': API_VERSION,
}

// Buttondown requires this confirmation to create an email that sends
// immediately. A draft needs no such guard — it goes nowhere until a human
// presses send in the dashboard.
if (!draftOnly) headers['X-Buttondown-Live-Dangerously'] = 'true'

const response = await fetch(API, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    subject,
    body,
    status: draftOnly ? 'draft' : 'about_to_send',
  }),
})

if (!response.ok) {
  fail(`Buttondown returned ${response.status}: ${await response.text()}`)
}

console.log(
  draftOnly
    ? `✓ Created "${subject}" as a draft — nothing was sent. Review it at https://buttondown.com/emails`
    : `✓ Queued "${subject}" for delivery.`,
)
