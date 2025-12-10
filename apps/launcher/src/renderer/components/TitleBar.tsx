import React from 'react'

interface TitleBarProps {
  onClose: () => void
}

const TitleBar: React.FC<TitleBarProps> = ({ onClose }) => {
  return (
    <div className="title-bar" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      <div className="title-bar-text">About PostHog 3000</div>
      <div className="title-bar-controls">
        <button aria-label="Minimize" disabled></button>
        <button aria-label="Maximize" disabled></button>
        <button
          aria-label="Close"
          onClick={onClose}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        ></button>
      </div>
    </div>
  )
}

export default TitleBar
