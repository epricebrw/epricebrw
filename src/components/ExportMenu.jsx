import Modal from './Modal.jsx'
import { exportAsCSV, exportAsText } from '../utils/export.js'

export default function ExportMenu({ entries, onClose }) {
  const count = Object.values(entries).filter((e) => e?.text?.trim()).length

  return (
    <Modal
      title="Export"
      subtitle={count === 0 ? 'Nothing to export yet.' : `${count} entr${count === 1 ? 'y' : 'ies'} ready.`}
      onClose={onClose}
    >
      <div className="export-options">
        <button
          className="export-option"
          disabled={count === 0}
          onClick={() => { exportAsText(entries); onClose() }}
        >
          <div className="export-h">Text (.txt)</div>
          <div className="export-p">Readable file, one entry per section.</div>
        </button>
        <button
          className="export-option"
          disabled={count === 0}
          onClick={() => { exportAsCSV(entries); onClose() }}
        >
          <div className="export-h">Spreadsheet (.csv)</div>
          <div className="export-p">Date, mood, and entry as columns.</div>
        </button>
      </div>
    </Modal>
  )
}
