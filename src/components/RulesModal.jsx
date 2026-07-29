import { useState } from 'react'
import Modal from './Modal.jsx'

const DEFAULT_RULES = `Only trade with a clear bias
Wait for 2-3 signals of confluence
Never move the stop loss
One trade per day max
Don't trade if emotionally off
If I miss it, it's gone
No trading on choppy/unclear days`

export default function RulesModal({ rules, firstRun, onSave, onClose }) {
  const [text, setText] = useState(
    rules && rules.length ? rules.join('\n') : (firstRun ? DEFAULT_RULES : '')
  )

  function handleSave() {
    const lines = text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
    onSave(lines)
  }

  return (
    <Modal
      title={firstRun ? 'Welcome — set your rules' : 'My rules'}
      subtitle={
        firstRun
          ? 'One rule per line. These stay visible while you journal, and the AI uses them when grading your week. You can edit anytime.'
          : 'One rule per line. Edit as your system evolves.'
      }
      onClose={firstRun ? undefined : onClose}
      size="md"
    >
      <textarea
        className="rules-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="One rule per line…"
        autoFocus
      />
      <div className="modal-actions">
        {!firstRun && <button className="btn-ghost" onClick={onClose}>Cancel</button>}
        <button className="btn-primary" onClick={handleSave}>
          {firstRun ? 'Save & start journaling' : 'Save'}
        </button>
      </div>
    </Modal>
  )
}
