// Sends the newest changelog entry to the Buttondown mailing list, in all three
// languages, as a single email.
//
// One email, not three. Segmenting by language would mean tagging subscribers,
// which is a paid Buttondown add-on and would tie the list to one provider's
// feature set. Everybody gets every language and reads the one they want.
//
// English drives the send: the run only does anything when the top `## ` heading
// of en/changelog.mdx is new. Spanish and Portuguese ride along, and each is
// included only if its own top heading also changed in this commit — that way a
// stale translation is never passed off as the new entry.
//
// Guard: if the newest English heading is identical to the one in the previous
// commit, nothing is sent. Editing an existing entry (a typo, a broken link)
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

const API = 'https://api.buttondown.com/v1/emails'
const API_VERSION = '2026-04-01'

// English first — it is the one that decides whether the email goes out at all.
const LANGUAGES = [
  { code: 'en', file: 'en/changelog.mdx', label: 'English', readMore: 'Read the full changelog' },
  { code: 'es', file: 'es/changelog.mdx', label: 'Español', readMore: 'Ver el registro completo' },
  { code: 'pt', file: 'pt/changelog.mdx', label: 'Português', readMore: 'Ver o registro completo' },
]

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
 * First line of an entry, minus the `## `.
 *
 * Markdown is stripped because this becomes the email subject, and a subject
 * line is plain text in every mail client — `order.opened` would otherwise
 * arrive with the backticks showing.
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

/** Everything below the `## ` line. */
function withoutHeading(entry) {
  return entry.split('\n').slice(1).join('\n').trim()
}

/** A file as it was one commit ago, or null if it did not exist. */
function previousVersion(file) {
  try {
    return execFileSync('git', ['show', `HEAD^:${file}`], { encoding: 'utf8' })
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

/** Reads one language and works out whether its top entry is new. */
function readLanguage(language) {
  const entry = latestEntry(readFileSync(language.file, 'utf8'))
  if (!entry) return null

  const previousFile = previousVersion(language.file)
  const previousHeading = previousFile ? heading(latestEntry(previousFile)) : null
  const currentHeading = heading(entry)

  return {
    ...language,
    heading: currentHeading,
    markdown: toMarkdown(withoutHeading(entry)),
    isNew: previousHeading !== currentHeading,
  }
}

const [english, ...translations] = LANGUAGES.map(readLanguage)

if (!english) fail('No `## ` entry found in en/changelog.mdx.')

const subject = english.heading

// The guard only protects the automatic path. A preview or a draft is asked for
// by hand, and by then the newest entry always looks like an edit — it is
// already on main — so the guard would make both impossible to ever use.
if (!english.isNew && !dryRun && !draftOnly) {
  console.log(`• Newest entry is still "${subject}" — edit only, nothing sent.`)
  process.exit(0)
}

// A translation that did not move in this commit is last month's entry, so
// including it would put the wrong text under a "Español" heading. Skip it and
// say so out loud — a silently monolingual email looks like a bug.
//
// Manual runs keep every language, for the same reason the English guard is
// relaxed there: by the time an entry is on main nothing looks new, and a
// preview that drops two thirds of the email is useless for checking it.
const manualRun = dryRun || draftOnly

const included = translations.filter((language) => {
  if (language.isNew || manualRun) return true
  console.log(`• ${language.label} has no new entry in this commit — leaving it out.`)
  return false
})

const sections = [
  english.markdown,
  ...included.map((l) => `---\n\n## ${l.label}\n\n### ${l.heading}\n\n${l.markdown}`),
]

const readMoreLinks = [english, ...included]
  .map((l) => `[${l.readMore}](${baseUrl}/${l.code}/changelog)`)
  .join(' · ')

const body = `${sections.join('\n\n')}\n\n---\n\n${readMoreLinks}`

if (dryRun) {
  if (!english.isNew) {
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

const languages = [english, ...included].map((l) => l.code.toUpperCase()).join(' / ')

console.log(
  draftOnly
    ? `✓ Created "${subject}" (${languages}) as a draft — nothing was sent. Review it at https://buttondown.com/emails`
    : `✓ Queued "${subject}" (${languages}) for delivery.`,
)
