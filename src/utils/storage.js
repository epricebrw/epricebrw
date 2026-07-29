const KEYS = {
  entries: 'tj.entries',
  rules: 'tj.rules',
  apiKey: 'tj.groqKey',
  debriefs: 'tj.debriefs',
  onboarded: 'tj.onboarded',
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
  }
}

export const storage = {
  loadEntries: () => read(KEYS.entries, {}),
  saveEntries: (entries) => write(KEYS.entries, entries),

  loadRules: () => read(KEYS.rules, []),
  saveRules: (rules) => write(KEYS.rules, rules),

  loadApiKey: () => read(KEYS.apiKey, ''),
  saveApiKey: (key) => write(KEYS.apiKey, key),

  loadDebriefs: () => read(KEYS.debriefs, {}),
  saveDebriefs: (briefs) => write(KEYS.debriefs, briefs),

  loadOnboarded: () => read(KEYS.onboarded, false),
  saveOnboarded: (v) => write(KEYS.onboarded, v),
}

export const STORAGE_KEYS = KEYS
