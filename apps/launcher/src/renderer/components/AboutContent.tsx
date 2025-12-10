import React from 'react'

interface AboutContentProps {
  onOk: () => void
}

const AboutContent: React.FC<AboutContentProps> = ({ onOk }) => {
  return (
    <div className="window-body">
      <div className="about-content">
        <div className="about-logo">
          <div className="logo-text">PostHog</div>
          <div className="logo-version">3000</div>
        </div>

        <div className="about-info">
          <p><strong>PostHog 3000 Launcher</strong></p>
          <p>Version 98.0.1998</p>
          <p style={{ marginTop: '15px', fontSize: '10px' }}>
            Copyright © 1998 PostHog Corp.<br />
            All rights reserved.
          </p>
          <p style={{ marginTop: '15px', fontSize: '10px', color: '#808080' }}>
            "The Engineer's Analytics Platform<br />
            Now In Glorious 256 Colors!"
          </p>
        </div>

        <div className="about-footer">
          <button onClick={onOk} className="ok-button">OK</button>
        </div>
      </div>
    </div>
  )
}

export default AboutContent
