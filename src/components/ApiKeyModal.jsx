import { useState } from 'react'
import Modal from './Modal.jsx'
import { hasApiKey } from '../utils/groq.js'

export default function ApiKeyModal({ apiKey, onSave, onClose }) {
  const [val, setVal] = useState(apiKey || '')
  const [show, setShow] = useState(false)
  const valid = hasApiKey(val)

  return (
    <Modal
      title="Groq API key"
      subtitle="Powers the weekly debrief. Stored locally in your browser — never sent anywhere except directly to Groq."
      onClose={onClose}
    >
      <ol className="api-steps">
        <li>Go to <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">console.groq.com/keys</a></li>
        <li>Sign in (free, no credit card)</li>
        <li>Create a new API key</li>
        <li>Paste it here</li>
      </ol>

      <div className="api-input-row">
        <input
          className="api-input"
          type={show ? 'text' : 'password'}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="gsk_…"
          autoFocus
          autoComplete="off"
          spellCheck={false}
        />
        <button className="btn-ghost small" onClick={() => setShow((s) => !s)} type="button">
          {show ? 'hide' : 'show'}
        </button>
      </div>
      {val && !valid && (
        <p className="api-warn">That doesn't look like a Groq key — they usually start with <code>gsk_</code>.</p>
      )}

      <div className="modal-actions">
        {apiKey && (
          <button
            className="btn-ghost"
            onClick={() => onSave('')}
            title="Remove stored key"
          >
            Remove key
          </button>
        )}
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={() => onSave(val.trim())} disabled={!val}>
          Save
        </button>
      </div>
    </Modal>
  )
}
