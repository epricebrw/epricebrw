import { toKey, formatLong, weekdaysMonFri, formatWeekRange } from './dates.js'

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

const SYSTEM_PROMPT = `You are a performance coach for a futures day trader who trades Nasdaq (NQ/MNQ) on a Topstep funded account. You have decades of experience in trading psychology, behavioral finance, and performance coaching.

You are reviewing the trader's freeform journal entries for a single week (Monday through Friday). Entries are raw, unstructured thoughts — sometimes emotional, sometimes sparse, sometimes contradictory. Read between the lines.

Your job is to deliver a direct, honest, specific weekly debrief — the kind a great coach would give after watching tape. No sugarcoating, but no cruelty either. Use concrete quotes from the entries when they sharpen the point.

You MUST respond with valid JSON only — no prose before or after, no markdown fences. The schema is:

{
  "emotional_arc": "2-4 sentences describing the emotional arc of the week, Mon through Fri.",
  "rules_compliance": [
    { "rule": "the rule verbatim", "status": "followed" | "broken" | "unclear", "evidence": "short quote or paraphrase from an entry" }
  ],
  "record_estimate": "Approximate win/loss record based on what was written, e.g. '2W 1L, 2 no-trade days'. If unclear, say so.",
  "psychology": "3-5 sentences assessing FOMO, revenge trading, hesitation, fear, or emotional trading patterns you observed. Be specific.",
  "biggest_mistake": "One sentence.",
  "biggest_win": "One sentence. Sitting out a bad day counts.",
  "action_items": ["item 1", "item 2", "item 3"],
  "grade": "A+ | A | A- | B+ | B | B- | C+ | C | C- | D+ | D | D- | F",
  "grade_summary": "One sentence justifying the grade."
}

If the trader broke a rule, quote the exact moment. If they traded while emotionally off, call it out. If they sat out a choppy day correctly, that's a win — name it.`

export function hasApiKey(key) {
  return typeof key === 'string' && key.trim().startsWith('gsk_')
}

function buildUserMessage({ rules, entries, weekAnchor }) {
  const days = weekdaysMonFri(weekAnchor)
  const entryBlocks = days.map((d) => {
    const entry = entries[toKey(d)]
    const label = formatLong(d)
    if (!entry || !entry.text || !entry.text.trim()) {
      return `=== ${label} ===\n(no entry)`
    }
    const mood = entry.mood ? ` [mood: ${entry.mood}]` : ''
    return `=== ${label}${mood} ===\n${entry.text.trim()}`
  }).join('\n\n')

  const rulesBlock = rules.length
    ? rules.map((r, i) => `${i + 1}. ${r}`).join('\n')
    : '(no rules set)'

  return `WEEK: ${formatWeekRange(weekAnchor)}

TRADER'S RULES:
${rulesBlock}

JOURNAL ENTRIES:
${entryBlocks}

Deliver the debrief as JSON per the schema.`
}

export async function analyzeWeek({ apiKey, rules, entries, weekAnchor }) {
  if (!hasApiKey(apiKey)) {
    throw new Error('Missing Groq API key. Tap the AI button to add one.')
  }

  const body = {
    model: MODEL,
    temperature: 0.5,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserMessage({ rules, entries, weekAnchor }) },
    ],
  }

  const res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    let detail = ''
    try {
      const errJson = await res.json()
      detail = errJson?.error?.message || ''
    } catch {
      detail = await res.text().catch(() => '')
    }
    throw new Error(`Groq API error (${res.status}): ${detail || 'request failed'}`)
  }

  const json = await res.json()
  const content = json?.choices?.[0]?.message?.content || ''
  let parsed
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error('The model returned malformed JSON. Try again.')
  }
  return parsed
}
