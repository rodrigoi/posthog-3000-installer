// Installing screen

import { advanceFromInstalling } from '../main.js'

const FAKE_FILES = [
  'posthog-core.dll',
  'analytics-engine.exe',
  'event-processor.sys',
  'session-replay.ocx',
  'replay-player.dll',
  'feature-flags.exe',
  'flag-evaluator.dll',
  'ab-testing.dll',
  'experiment-engine.sys',
  'data-pipeline.exe',
  'transformer.dll',
  'exporter.ocx',
  'notebooks.exe',
  'notebook-renderer.dll',
  'hedgehog-icon.ico',
  'posthog3000.exe',
  'uninstall.exe',
  'readme.txt',
  'license.txt'
]

export const installingScreen = {
  render(state) {
    const screen = document.createElement('div')
    screen.className = 'screen installing-screen'
    screen.innerHTML = `
      <h2>Installing PostHog 3000</h2>

      <p>Please wait while Setup installs PostHog 3000 on your computer.</p>

      <div class="progress-container">
        <div class="progress-label">Installation Progress:</div>
        <progress id="install-progress" max="100" value="0"></progress>
      </div>

      <div class="file-list" id="file-list">
        <div style="color: #808080;">Preparing installation...</div>
      </div>

      <div class="status-text" id="status-text">
        Initializing setup routines...
      </div>
    `
    return screen
  },

  setupListeners(state, updateNav) {
    // Start the fake installation process
    setTimeout(() => {
      startFakeInstallation(state)
    }, 500)
  },

  canProceed(state) {
    return state.installComplete
  }
}

function startFakeInstallation(state) {
  const progressBar = document.getElementById('install-progress')
  const fileList = document.getElementById('file-list')
  const statusText = document.getElementById('status-text')

  let currentFile = 0
  let progress = 0

  const statuses = [
    'Extracting files...',
    'Copying files to destination...',
    'Registering COM components...',
    'Creating program shortcuts...',
    'Updating system registry...',
    'Configuring PostHog 3000...',
    'Finalizing installation...'
  ]

  let statusIndex = 0

  fileList.innerHTML = ''

  const interval = setInterval(() => {
    if (currentFile < FAKE_FILES.length) {
      // Add file to list
      const fileItem = document.createElement('div')
      fileItem.className = 'file-item'

      const actions = ['Extracting:', 'Copying:', 'Installing:', 'Registering:']
      const action = actions[Math.floor(Math.random() * actions.length)]

      fileItem.textContent = `${action} ${state.installPath}\\${FAKE_FILES[currentFile]}`
      fileList.appendChild(fileItem)

      // Scroll to bottom
      fileList.scrollTop = fileList.scrollHeight

      // Update progress
      progress = Math.floor(((currentFile + 1) / FAKE_FILES.length) * 100)
      progressBar.value = progress

      // Update status occasionally
      if (currentFile % 3 === 0 && statusIndex < statuses.length) {
        statusText.textContent = statuses[statusIndex]
        statusIndex++
      }

      currentFile++
    } else {
      // Installation complete
      clearInterval(interval)

      statusText.textContent = 'Installation complete!'

      const completeItem = document.createElement('div')
      completeItem.className = 'file-item'
      completeItem.style.color = '#008000'
      completeItem.style.fontWeight = 'bold'
      completeItem.textContent = 'Setup completed successfully.'
      fileList.appendChild(completeItem)

      fileList.scrollTop = fileList.scrollHeight

      state.installComplete = true

      // Auto-advance to finish screen after a short delay
      setTimeout(() => {
        advanceFromInstalling()
      }, 1500)
    }
  }, 200) // Install a file every 200ms
}
