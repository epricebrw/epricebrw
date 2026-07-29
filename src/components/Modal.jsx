import { useEffect } from 'react'

export default function Modal({ title, subtitle, onClose, children, size = 'md' }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && onClose) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`modal ${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || subtitle) && (
          <header className="modal-head">
            <div>
              {title && <h2>{title}</h2>}
              {subtitle && <p className="modal-sub">{subtitle}</p>}
            </div>
            {onClose && (
              <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
            )}
          </header>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
