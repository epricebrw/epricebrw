import {
  addDays,
  dayLabelTiny,
  formatWeekRange,
  isFuture,
  isToday,
  sameDay,
  startOfWeek,
  toKey,
  weekDays,
} from '../utils/dates.js'

export default function CalendarStrip({ selected, entries, onSelect }) {
  const anchor = startOfWeek(selected)
  const days = weekDays(anchor)

  return (
    <div className="calstrip">
      <div className="calstrip-head">
        <button
          className="calstrip-nav"
          onClick={() => onSelect(addDays(anchor, -7))}
          aria-label="Previous week"
        >
          ‹
        </button>
        <div className="calstrip-range">{formatWeekRange(anchor)}</div>
        <button
          className="calstrip-nav"
          onClick={() => onSelect(addDays(anchor, 7))}
          aria-label="Next week"
        >
          ›
        </button>
      </div>
      <div className="calstrip-row">
        {days.map((d) => {
          const key = toKey(d)
          const has = !!(entries[key] && entries[key].text && entries[key].text.trim())
          const isSel = sameDay(d, selected)
          const weekend = d.getDay() === 0 || d.getDay() === 6
          const future = isFuture(d)
          return (
            <button
              key={key}
              className={`calday ${isSel ? 'sel' : ''} ${weekend ? 'weekend' : ''} ${future ? 'future' : ''}`}
              onClick={() => onSelect(d)}
              aria-pressed={isSel}
              aria-label={`${dayLabelTiny(d)} ${d.getDate()}${has ? ', has entry' : ''}`}
            >
              <span className="calday-dow">{dayLabelTiny(d)}</span>
              <span className="calday-num">{d.getDate()}</span>
              <span className={`calday-dot ${has ? 'on' : ''} ${isToday(d) ? 'today' : ''}`} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
