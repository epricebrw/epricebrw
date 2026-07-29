import { toKey, fromKey, formatLong } from './dates.js'

function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

function sortedKeys(entries) {
  return Object.keys(entries)
    .filter((k) => entries[k] && entries[k].text && entries[k].text.trim())
    .sort()
}

export function exportAsText(entries) {
  const keys = sortedKeys(entries)
  if (!keys.length) return false
  const body = keys.map((k) => {
    const e = entries[k]
    const mood = e.mood ? ` [${e.mood}]` : ''
    return `${formatLong(fromKey(k))}${mood}\n${'-'.repeat(48)}\n${e.text.trim()}\n`
  }).join('\n')
  download(`trading-journal-${toKey(new Date())}.txt`, body, 'text/plain;charset=utf-8')
  return true
}

function csvEscape(v) {
  if (v == null) return ''
  const s = String(v)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function exportAsCSV(entries) {
  const keys = sortedKeys(entries)
  if (!keys.length) return false
  const rows = [['date', 'mood', 'entry']]
  for (const k of keys) {
    const e = entries[k]
    rows.push([k, e.mood || '', e.text.trim()])
  }
  const csv = rows.map((r) => r.map(csvEscape).join(',')).join('\n')
  download(`trading-journal-${toKey(new Date())}.csv`, csv, 'text/csv;charset=utf-8')
  return true
}
