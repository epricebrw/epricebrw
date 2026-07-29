import { useEffect, useMemo, useState } from 'react'
import { storage } from './utils/storage.js'
import { computeStreak } from './utils/dates.js'
import Journal from './components/Journal.jsx'
import WeeklyDebrief from './components/WeeklyDebrief.jsx'
import RulesModal from './components/RulesModal.jsx'
import ApiKeyModal from './components/ApiKeyModal.jsx'
import SearchModal from './components/SearchModal.jsx'
import ExportMenu from './components/ExportMenu.jsx'

export default function App() {
  const [tab, setTab] = useState('journal')

  const [entries, setEntries] = useState(() => storage.loadEntries())
  const [rules, setRules] = useState(() => storage.loadRules())
  const [apiKey, setApiKey] = useState(() => storage.loadApiKey())
  const [debriefs, setDebriefs] = useState(() => storage.loadDebriefs())
  const [onboarded, setOnboarded] = useState(() => storage.loadOnboarded())

  const [rulesOpen, setRulesOpen] = useState(false)
  const [apiOpen, setApiOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

  useEffect(() => storage.saveEntries(entries), [entries])
  useEffect(() => storage.saveRules(rules), [rules])
  useEffect(() => storage.saveApiKey(apiKey), [apiKey])
  useEffect(() => storage.saveDebriefs(debriefs), [debriefs])
  useEffect(() => storage.saveOnboarded(onboarded), [onboarded])

  useEffect(() => {
    if (!onboarded) setRulesOpen(true)
  }, [onboarded])

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const streak = useMemo(() => computeStreak(entries), [entries])

  function saveEntry(key, updater) {
    setEntries((prev) => {
      const current = prev[key] || { text: '', mood: '', updatedAt: 0 }
      const next = typeof updater === 'function' ? updater(current) : updater
      if (!next || (!next.text && !next.mood)) {
        const copy = { ...prev }
        delete copy[key]
        return copy
      }
      return { ...prev, [key]: { ...next, updatedAt: Date.now() } }
    })
  }

  function saveRules(next) {
    setRules(next)
    setOnboarded(true)
  }

  function saveDebrief(weekKey, payload) {
    setDebriefs((prev) => ({ ...prev, [weekKey]: payload }))
  }

  function deleteDebrief(weekKey) {
    setDebriefs((prev) => {
      const copy = { ...prev }
      delete copy[weekKey]
      return copy
    })
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="brand-mark">◆</span>
          <span className="brand-name">Journal</span>
          <span className="brand-sub">NQ</span>
        </div>

        <nav className="tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'journal'}
            className={`tab ${tab === 'journal' ? 'active' : ''}`}
            onClick={() => setTab('journal')}
          >
            Journal
          </button>
          <button
            role="tab"
            aria-selected={tab === 'debrief'}
            className={`tab ${tab === 'debrief' ? 'active' : ''}`}
            onClick={() => setTab('debrief')}
          >
            Weekly Debrief
          </button>
        </nav>

        <div className="actions">
          {streak > 0 && (
            <div className="streak" title={`${streak} day streak`}>
              <span className="streak-icon">█</span>
              <span className="streak-count">{streak}</span>
            </div>
          )}
          <button className="icon-btn" title="Search (⌘K)" onClick={() => setSearchOpen(true)} aria-label="Search">
            <SearchIcon />
          </button>
          <button className="icon-btn" title="Export" onClick={() => setExportOpen(true)} aria-label="Export">
            <DownloadIcon />
          </button>
          <button className="icon-btn" title="My rules" onClick={() => setRulesOpen(true)} aria-label="Rules">
            <BookIcon />
          </button>
          <button className="icon-btn pill" title="AI key" onClick={() => setApiOpen(true)}>
            <span aria-hidden>🧠</span>
            <span className="pill-label">AI</span>
          </button>
        </div>
      </header>

      <main className="main">
        {tab === 'journal' ? (
          <Journal
            entries={entries}
            rules={rules}
            onSave={saveEntry}
            onOpenRules={() => setRulesOpen(true)}
          />
        ) : (
          <WeeklyDebrief
            entries={entries}
            rules={rules}
            apiKey={apiKey}
            debriefs={debriefs}
            onSaveDebrief={saveDebrief}
            onDeleteDebrief={deleteDebrief}
            onOpenApi={() => setApiOpen(true)}
          />
        )}
      </main>

      {rulesOpen && (
        <RulesModal
          rules={rules}
          firstRun={!onboarded}
          onSave={(next) => {
            saveRules(next)
            setRulesOpen(false)
          }}
          onClose={() => {
            if (onboarded) setRulesOpen(false)
          }}
        />
      )}

      {apiOpen && (
        <ApiKeyModal
          apiKey={apiKey}
          onSave={(k) => {
            setApiKey(k)
            setApiOpen(false)
          }}
          onClose={() => setApiOpen(false)}
        />
      )}

      {searchOpen && (
        <SearchModal
          entries={entries}
          onPick={(key) => {
            setSearchOpen(false)
            setTab('journal')
            window.dispatchEvent(new CustomEvent('journal:goto', { detail: key }))
          }}
          onClose={() => setSearchOpen(false)}
        />
      )}

      {exportOpen && (
        <ExportMenu
          entries={entries}
          onClose={() => setExportOpen(false)}
        />
      )}
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v12" />
      <path d="m6 12 6 6 6-6" />
      <path d="M4 20h16" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z" />
      <path d="M8 7h7" />
      <path d="M8 11h7" />
    </svg>
  )
}
