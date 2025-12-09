// Main installer logic and state management

import { welcomeScreen } from './screens/welcome.js'
import { licenseScreen } from './screens/license.js'
import { directoryScreen } from './screens/directory.js'
import { componentsScreen } from './screens/components.js'
import { configurationScreen } from './screens/configuration.js'
import { installingScreen } from './screens/installing.js'
import { finishScreen } from './screens/finish.js'

// Global state
const state = {
  currentScreen: 0,
  licenseAccepted: false,
  installPath: 'C:\\Program Files\\PostHog3000',
  selectedComponents: ['analytics'], // Analytics is required
  configData: {
    projectName: '',
    instanceType: 'cloud',
    apiKey: ''
  },
  installComplete: false,
  logoClickCount: 0
}

// Screen definitions
const screens = [
  welcomeScreen,
  licenseScreen,
  directoryScreen,
  componentsScreen,
  configurationScreen,
  installingScreen,
  finishScreen
]

// DOM elements
let screenContainer
let backBtn
let nextBtn
let cancelBtn
let cancelDialog
let dialogYes
let dialogNo
let closeBtn
let logo

// Initialize the app
function init() {
  // Get DOM elements
  screenContainer = document.getElementById('screen-container')
  backBtn = document.getElementById('back-btn')
  nextBtn = document.getElementById('next-btn')
  cancelBtn = document.getElementById('cancel-btn')
  cancelDialog = document.getElementById('cancel-dialog')
  dialogYes = document.getElementById('dialog-yes')
  dialogNo = document.getElementById('dialog-no')
  closeBtn = document.getElementById('close-btn')
  logo = document.getElementById('logo')

  // Set up event listeners
  backBtn.addEventListener('click', goBack)
  nextBtn.addEventListener('click', goNext)
  cancelBtn.addEventListener('click', showCancelDialog)
  closeBtn.addEventListener('click', showCancelDialog)
  dialogYes.addEventListener('click', exitApp)
  dialogNo.addEventListener('click', hideCancelDialog)

  // Logo easter egg
  logo.addEventListener('click', handleLogoClick)

  // Render first screen
  renderScreen()
}

// Render the current screen
function renderScreen() {
  const screen = screens[state.currentScreen]

  if (screen) {
    const screenElement = screen.render(state)
    screenContainer.innerHTML = ''
    screenContainer.appendChild(screenElement)

    // Set up screen-specific event listeners
    if (screen.setupListeners) {
      screen.setupListeners(state, updateNavigation, goNext)
    }

    updateNavigation()
  }
}

// Update navigation button states
function updateNavigation() {
  const screen = screens[state.currentScreen]

  // Back button
  backBtn.disabled = state.currentScreen === 0 || state.currentScreen === 5 || state.currentScreen === 6

  // Next button - check if screen allows proceeding
  if (screen.canProceed) {
    nextBtn.disabled = !screen.canProceed(state)
  } else {
    nextBtn.disabled = false
  }

  // Update button text for last screens
  if (state.currentScreen === screens.length - 1) {
    nextBtn.textContent = 'Finish'
  } else if (state.currentScreen === screens.length - 2) {
    nextBtn.textContent = 'Next >'
    nextBtn.style.display = 'none' // Hide during installation
  } else {
    nextBtn.textContent = 'Next >'
    nextBtn.style.display = ''
  }

  // Hide cancel button on finish screen
  if (state.currentScreen === screens.length - 1) {
    cancelBtn.style.display = 'none'
  } else {
    cancelBtn.style.display = ''
  }
}

// Go to next screen
function goNext() {
  const screen = screens[state.currentScreen]

  // Run screen's onNext handler if it exists
  if (screen.onNext) {
    screen.onNext(state)
  }

  // Special handling for installing screen
  if (state.currentScreen === 5) {
    // Installing screen will advance automatically
    return
  }

  // Special handling for finish screen
  if (state.currentScreen === screens.length - 1) {
    exitApp()
    return
  }

  // Move to next screen
  if (state.currentScreen < screens.length - 1) {
    state.currentScreen++
    renderScreen()
  }
}

// Go to previous screen
function goBack() {
  if (state.currentScreen > 0) {
    state.currentScreen--
    renderScreen()
  }
}

// Show cancel confirmation dialog
function showCancelDialog() {
  // Don't show dialog on finish screen
  if (state.currentScreen === screens.length - 1) {
    exitApp()
    return
  }

  cancelDialog.style.display = 'flex'
}

// Hide cancel dialog
function hideCancelDialog() {
  cancelDialog.style.display = 'none'
}

// Exit the application
function exitApp() {
  if (window.electronAPI) {
    // In Electron, close the window
    window.close()
  } else {
    // In browser, just show a message
    alert('Thanks for trying PostHog 3000 Setup!')
  }
}

// Logo easter egg - click 10 times
function handleLogoClick() {
  state.logoClickCount++

  if (state.logoClickCount === 10) {
    showEasterEgg()
    state.logoClickCount = 0
  }
}

// Show easter egg dialog
function showEasterEgg() {
  const easterEggDialog = document.createElement('div')
  easterEggDialog.className = 'dialog-overlay'
  easterEggDialog.innerHTML = `
    <div class="window dialog-window">
      <div class="title-bar">
        <div class="title-bar-text">About PostHog 3000</div>
      </div>
      <div class="window-body">
        <div class="dialog-content">
          <p><strong>PostHog 3000</strong></p>
          <p>Version 98.0.1998</p>
          <p>Copyright © 1998 PostHog Corp.</p>
          <p style="margin-top: 15px; font-size: 10px;">
            This product is licensed to:<br>
            <strong>A True Analytics Enthusiast</strong>
          </p>
          <p style="margin-top: 15px; font-size: 9px; color: #808080;">
            "The future is now! Well, actually it was 1998, but you get the idea."
          </p>
        </div>
        <div class="dialog-buttons">
          <button id="easter-egg-ok">OK</button>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(easterEggDialog)

  document.getElementById('easter-egg-ok').addEventListener('click', () => {
    document.body.removeChild(easterEggDialog)
  })
}

// Auto-advance from installing to finish screen
export function advanceFromInstalling() {
  state.currentScreen++
  renderScreen()
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
