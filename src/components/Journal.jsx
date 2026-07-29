import { useEffect, useMemo, useRef, useState } from 'react'
import { formatLong, fromKey, isToday, toKey } from '../utils/dates.js'
import CalendarStrip from './CalendarStrip.jsx'

const PLACEHOLDER = `How did today feel?

What did you see on the chart — the setup, the bias, the confluence (or lack of it)?

What did you take? What did you skip? What did you chase?

What did you do right? What did you do wrong? Any rules broken — or followed when it mattered?

Lesson for tomorrow.`

const MOODS = [
  { key: 'calm', label: 'Calm', icon: '◐' },
  { key: 'focused', label: 'Focused', icon: '◉' },
  { key: 'fomo', label: 'FOMO', icon: '◎' },
  { key: 'revenge', label: 'Revenge', icon: '◈' },
  { key: 'hesitant', label: 'Hesitant', icon: '◌' },
  { key: 'off', label: 'Off', icon: '◍' },
]

export default function Journal({ entries, rules, onSave, onOpenRules }) {
  const [selected, setSelected] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  const key = toKey(selected)
  const existing = entries[key] || { text: '', mood: '' }
  const [text, setText] = useState(existing.text)
  const [mood, setMood] = useState(existing.mood)
  const [justSaved, setJustSaved] = useState(false)

  const taRef = useRef(null)

  useEffect(() => {
    const e = entries[key] || { text: '', mood: '' }
    setText(e.text || '')
    setMood(e.mood || '')
    setJustSaved(false)
    requestAnimationFrame(() => autosize(taRef.current))
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onGoto(e) {
      const k = e.detail
      if (typeof k === 'string') setSelected(fromKey(k))
    }
    window.addEventListener('journal:goto', onGoto)
    return () => window.removeEventListener('journal:goto', onGoto)
  }, [])

  const wordCount = useMemo(() => {
    const t = text.trim()
    if (!t) return 0
    return t.split(/\s+/).length
  }, [text])

  const dirty = (text || '') !== (existing.text || '') || (mood || '') !== (existing.mood || '')

  function handleSave() {
    onSave(key, { text: text.trim(), mood })
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 1400)
  }

  function onKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
  }

  return (
    <div className="journal">
      <CalendarStrip selected={selected} entries={entries} onSelect={setSelected} />

      <div className="day-head">
        <div className="day-title">
          <span className={`day-badge ${isToday(selected) ? 'today' : ''}`}>
            {isToday(selected) ? 'Today' : 'Entry'}
          </span>
          <h1 className="day-date">{formatLong(selected)}</h1>
        </div>
        <div className="mood-row" aria-label="Mood">
          {MOODS.map((m) => (
            <button
              key={m.key}
              className={`mood ${mood === m.key ? 'on' : ''}`}
              onClick={() => setMood(mood === m.key ? '' : m.key)}
              title={m.label}
              type="button"
            >
              <span className="mood-icon" aria-hidden>{m.icon}</span>
              <span className="mood-label">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="writer">
        <textarea
          ref={taRef}
          className="writer-area"
          placeholder={PLACEHOLDER}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            autosize(e.target)
          }}
          onKeyDown={onKeyDown}
          spellCheck
        />

        <div className="writer-foot">
          <div className="writer-meta">
            <span>{wordCount} word{wordCount === 1 ? '' : 's'}</span>
            {existing.updatedAt ? (
              <span className="dim">· saved {relativeTime(existing.updatedAt)}</span>
            ) : null}
          </div>
          <div className="writer-actions">
            <span className={`save-hint ${justSaved ? 'show' : ''}`}>saved</span>
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={!dirty}
            >
              {dirty ? 'Save' : 'Saved'}
              <span className="kbd">⌘↵</span>
            </button>
          </div>
        </div>
      </div>

      <RulesFooter rules={rules} onOpenRules={onOpenRules} />
    </div>
  )
}

function RulesFooter({ rules, onOpenRules }) {
  if (!rules || rules.length === 0) {
    return (
      <aside className="rules-foot empty">
        <span>No rules yet.</span>
        <button className="link" onClick={onOpenRules}>Set your rules →</button>
      </aside>
    )
  }
  return (
    <aside className="rules-foot">
      <header>
        <span className="rules-title">My Rules</span>
        <button className="link" onClick={onOpenRules}>edit</button>
      </header>
      <ol>
        {rules.map((r, i) => <li key={i}>{r}</li>)}
      </ol>
    </aside>
  )
}

function autosize(el) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.max(el.scrollHeight, 360) + 'px'
}

function relativeTime(ts) {
  const diff = Math.max(0, Date.now() - ts)
  const s = Math.floor(diff / 1000)
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}
