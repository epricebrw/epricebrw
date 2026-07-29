import { useEffect, useMemo, useRef, useState } from 'react'
import Modal from './Modal.jsx'
import { formatLong, fromKey } from '../utils/dates.js'

export default function SearchModal({ entries, onPick, onClose }) {
  const [q, setQ] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const all = useMemo(() => {
    return Object.keys(entries)
      .filter((k) => entries[k]?.text?.trim())
      .sort((a, b) => (a < b ? 1 : -1))
      .map((k) => ({ key: k, ...entries[k] }))
  }, [entries])

  const results = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return all.slice(0, 30)
    return all
      .map((e) => {
        const hay = (e.text || '').toLowerCase()
        const idx = hay.indexOf(query)
        if (idx === -1) return null
        const start = Math.max(0, idx - 40)
        const end = Math.min(e.text.length, idx + query.length + 80)
        const snippet = (start > 0 ? '…' : '') + e.text.slice(start, end) + (end < e.text.length ? '…' : '')
        return { ...e, snippet, idx }
      })
      .filter(Boolean)
      .slice(0, 50)
  }, [q, all])

  return (
    <Modal title="Search entries" onClose={onClose} size="lg">
      <input
        ref={inputRef}
        className="search-input"
        placeholder="Search your journal…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="search-results">
        {results.length === 0 ? (
          <p className="dim">{q ? 'No matches.' : 'No entries yet.'}</p>
        ) : (
          results.map((r) => (
            <button
              key={r.key}
              className="search-result"
              onClick={() => onPick(r.key)}
            >
              <div className="search-date">{formatLong(fromKey(r.key))}</div>
              <div className="search-snippet">
                {r.snippet ? highlight(r.snippet, q) : truncate(r.text, 160)}
              </div>
            </button>
          ))
        )}
      </div>
    </Modal>
  )
}

function truncate(s, n) {
  if (!s) return ''
  return s.length > n ? s.slice(0, n) + '…' : s
}

function highlight(text, q) {
  if (!q) return text
  const lower = text.toLowerCase()
  const needle = q.toLowerCase()
  const i = lower.indexOf(needle)
  if (i === -1) return text
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  )
}
