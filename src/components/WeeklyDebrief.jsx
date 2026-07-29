import { useMemo, useState } from 'react'
import {
  addDays,
  dayLabelShort,
  formatLong,
  formatWeekRange,
  startOfWeek,
  toKey,
  weekdaysMonFri,
} from '../utils/dates.js'
import { analyzeWeek, hasApiKey } from '../utils/groq.js'

export default function WeeklyDebrief({
  entries,
  rules,
  apiKey,
  debriefs,
  onSaveDebrief,
  onDeleteDebrief,
  onOpenApi,
}) {
  const [anchor, setAnchor] = useState(() => startOfWeek(new Date()))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const weekKey = toKey(anchor)
  const weekDaysArr = weekdaysMonFri(anchor)
  const saved = debriefs[weekKey]

  const summary = useMemo(() => {
    let withEntries = 0
    for (const d of weekDaysArr) {
      const e = entries[toKey(d)]
      if (e && e.text && e.text.trim()) withEntries += 1
    }
    return { withEntries, total: weekDaysArr.length }
  }, [entries, weekDaysArr])

  async function handleAnalyze() {
    setError('')
    if (!hasApiKey(apiKey)) {
      onOpenApi()
      return
    }
    if (summary.withEntries === 0) {
      setError('No entries this week — write something first.')
      return
    }
    setLoading(true)
    try {
      const result = await analyzeWeek({
        apiKey,
        rules,
        entries,
        weekAnchor: anchor,
      })
      onSaveDebrief(weekKey, { ...result, generatedAt: Date.now() })
    } catch (e) {
      setError(e.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="debrief">
      <div className="debrief-head">
        <button className="wk-nav" onClick={() => setAnchor(addDays(anchor, -7))} aria-label="Previous week">‹</button>
        <div className="wk-label">
          <span className="wk-eyebrow">Week of</span>
          <h1 className="wk-range">{formatWeekRange(anchor)}</h1>
          <span className="wk-sub">{summary.withEntries} of {summary.total} trading days journaled</span>
        </div>
        <button className="wk-nav" onClick={() => setAnchor(addDays(anchor, 7))} aria-label="Next week">›</button>
      </div>

      <div className="wk-days">
        {weekDaysArr.map((d) => {
          const e = entries[toKey(d)]
          const has = !!(e && e.text && e.text.trim())
          return (
            <div key={toKey(d)} className={`wk-day ${has ? 'has' : ''}`}>
              <span className="wk-day-dow">{dayLabelShort(d)}</span>
              <span className="wk-day-num">{d.getDate()}</span>
              <span className={`wk-day-dot ${has ? 'on' : ''}`} />
            </div>
          )
        })}
      </div>

      <div className="debrief-actions">
        <button
          className="btn-primary big"
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? 'Analyzing…' : saved ? 'Re-analyze This Week' : 'Analyze This Week'}
        </button>
        {saved && (
          <button className="btn-ghost" onClick={() => onDeleteDebrief(weekKey)} disabled={loading}>
            Clear
          </button>
        )}
        {!hasApiKey(apiKey) && (
          <span className="hint">Needs a Groq API key.</span>
        )}
      </div>

      {error && <div className="err">{error}</div>}

      {saved ? (
        <DebriefCard debrief={saved} />
      ) : (
        <div className="debrief-empty">
          <p>No analysis yet for this week.</p>
          <p className="dim">Click analyze once you're done trading on Friday.</p>
        </div>
      )}

      <section className="wk-entries">
        <h2 className="wk-entries-title">This week's entries</h2>
        {weekDaysArr.map((d) => {
          const k = toKey(d)
          const e = entries[k]
          return (
            <article key={k} className={`wk-entry ${e?.text?.trim() ? '' : 'empty'}`}>
              <header>
                <h3>{formatLong(d)}</h3>
                {e?.mood && <span className={`mood-chip ${e.mood}`}>{e.mood}</span>}
              </header>
              {e?.text?.trim() ? (
                <pre className="wk-entry-body">{e.text}</pre>
              ) : (
                <p className="dim">No entry.</p>
              )}
            </article>
          )
        })}
      </section>
    </div>
  )
}

function DebriefCard({ debrief }) {
  const {
    emotional_arc,
    rules_compliance,
    record_estimate,
    psychology,
    biggest_mistake,
    biggest_win,
    action_items,
    grade,
    grade_summary,
    generatedAt,
  } = debrief

  return (
    <div className="card-stack">
      <div className="card grade-card">
        <div className="grade-left">
          <span className="grade-eyebrow">Weekly grade</span>
          <div className={`grade-big ${gradeTone(grade)}`}>{grade || '—'}</div>
        </div>
        <div className="grade-right">
          <p className="grade-summary">{grade_summary}</p>
          {record_estimate && <p className="grade-record">{record_estimate}</p>}
          {generatedAt && <p className="dim micro">Generated {new Date(generatedAt).toLocaleString()}</p>}
        </div>
      </div>

      <div className="card">
        <h3 className="card-h">Emotional arc</h3>
        <p>{emotional_arc}</p>
      </div>

      <div className="card">
        <h3 className="card-h">Psychology</h3>
        <p>{psychology}</p>
      </div>

      {Array.isArray(rules_compliance) && rules_compliance.length > 0 && (
        <div className="card">
          <h3 className="card-h">Rules compliance</h3>
          <ul className="rules-list">
            {rules_compliance.map((r, i) => (
              <li key={i} className={`rule-item ${r.status}`}>
                <span className="rule-status">{r.status}</span>
                <div className="rule-body">
                  <div className="rule-text">{r.rule}</div>
                  {r.evidence && <div className="rule-evidence">“{r.evidence}”</div>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="two-col">
        <div className="card">
          <h3 className="card-h">Biggest win</h3>
          <p>{biggest_win}</p>
        </div>
        <div className="card">
          <h3 className="card-h">Biggest mistake</h3>
          <p>{biggest_mistake}</p>
        </div>
      </div>

      {Array.isArray(action_items) && action_items.length > 0 && (
        <div className="card">
          <h3 className="card-h">Next week — action items</h3>
          <ol className="action-items">
            {action_items.map((a, i) => <li key={i}>{a}</li>)}
          </ol>
        </div>
      )}
    </div>
  )
}

function gradeTone(grade) {
  if (!grade) return ''
  const g = grade[0]
  if (g === 'A') return 'tone-good'
  if (g === 'B') return 'tone-ok'
  if (g === 'C') return 'tone-warn'
  return 'tone-bad'
}
