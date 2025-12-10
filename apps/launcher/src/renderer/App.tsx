import React from 'react'
import Window98 from './components/Window98'
import TitleBar from './components/TitleBar'
import AboutContent from './components/AboutContent'

const App: React.FC = () => {
  const handleClose = () => {
    window.close()
  }

  return (
    <div className="about-container">
      <Window98>
        <TitleBar onClose={handleClose} />
        <AboutContent onOk={handleClose} />
      </Window98>
    </div>
  )
}

export default App
