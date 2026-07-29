// All date helpers work on local time.

export function toKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function sameDay(a, b) {
  return toKey(a) === toKey(b)
}

export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export function startOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function weekDays(anchor) {
  const mon = startOfWeek(anchor)
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i))
}

export function weekdaysMonFri(anchor) {
  const mon = startOfWeek(anchor)
  return Array.from({ length: 5 }, (_, i) => addDays(mon, i))
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_TINY = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function formatLong(date) {
  return `${DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

export function formatShort(date) {
  return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`
}

export function formatWeekRange(anchor) {
  const mon = startOfWeek(anchor)
  const fri = addDays(mon, 4)
  const sameMonth = mon.getMonth() === fri.getMonth()
  if (sameMonth) {
    return `${MONTHS_SHORT[mon.getMonth()]} ${mon.getDate()}–${fri.getDate()}, ${fri.getFullYear()}`
  }
  return `${MONTHS_SHORT[mon.getMonth()]} ${mon.getDate()} – ${MONTHS_SHORT[fri.getMonth()]} ${fri.getDate()}, ${fri.getFullYear()}`
}

export function dayLabelShort(date) {
  return DAYS_SHORT[date.getDay()]
}

export function dayLabelTiny(date) {
  return DAYS_TINY[date.getDay()]
}

export function isToday(date) {
  return sameDay(date, new Date())
}

export function isFuture(date) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.getTime() > now.getTime()
}

export function computeStreak(entries) {
  const hasEntry = (d) => {
    const e = entries[toKey(d)]
    return !!(e && e.text && e.text.trim().length > 0)
  }
  let cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  let count = 0
  if (!hasEntry(cursor)) {
    cursor = addDays(cursor, -1)
  }
  while (hasEntry(cursor)) {
    count += 1
    cursor = addDays(cursor, -1)
  }
  return count
}
