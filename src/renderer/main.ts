// Main installer logic and state management

import { welcomeScreen } from './screens/welcome'
import { licenseScreen } from './screens/license'
import { directoryScreen } from './screens/directory'
import { componentsScreen } from './screens/components'
import { configurationScreen } from './screens/configuration'
import { installingScreen } from './screens/installing'
import { finishScreen } from './screens/finish'
import type { InstallerState, Screen } from '../types'

// Global state
const state: InstallerState = {
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
const screens: Screen[] = [
  welcomeScreen,
  licenseScreen,
  directoryScreen,
  componentsScreen,
  configurationScreen,
  installingScreen,
  finishScreen
]

// DOM elements
let screenContainer: HTMLElement
let backBtn: HTMLButtonElement
let nextBtn: HTMLButtonElement
let cancelBtn: HTMLButtonElement
let cancelDialog: HTMLElement
let dialogYes: HTMLButtonElement
let dialogNo: HTMLButtonElement
let closeBtn: HTMLButtonElement
let logo: HTMLElement

// Initialize the app
function init(): void {
  // Get DOM elements
  screenContainer = document.getElementById('screen-container')!
  backBtn = document.getElementById('back-btn') as HTMLButtonElement
  nextBtn = document.getElementById('next-btn') as HTMLButtonElement
  cancelBtn = document.getElementById('cancel-btn') as HTMLButtonElement
  cancelDialog = document.getElementById('cancel-dialog')!
  dialogYes = document.getElementById('dialog-yes') as HTMLButtonElement
  dialogNo = document.getElementById('dialog-no') as HTMLButtonElement
  closeBtn = document.getElementById('close-btn') as HTMLButtonElement
  logo = document.getElementById('logo')!

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
function renderScreen(): void {
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
function updateNavigation(): void {
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
function goNext(): void {
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
function goBack(): void {
  if (state.currentScreen > 0) {
    state.currentScreen--
    renderScreen()
  }
}

// Show cancel confirmation dialog
function showCancelDialog(): void {
  // Don't show dialog on finish screen
  if (state.currentScreen === screens.length - 1) {
    exitApp()
    return
  }

  cancelDialog.style.display = 'flex'
}

// Hide cancel dialog
function hideCancelDialog(): void {
  cancelDialog.style.display = 'none'
}

// Exit the application
function exitApp(): void {
  if (window.electronAPI) {
    // In Electron, close the window
    window.close()
  } else {
    // In browser, just show a message
    alert('Thanks for trying PostHog 3000 Setup!')
  }
}

// Logo easter egg - click 10 times
function handleLogoClick(): void {
  state.logoClickCount++

  if (state.logoClickCount === 10) {
    showEasterEgg()
    state.logoClickCount = 0
  }
}

// Show easter egg dialog
function showEasterEgg(): void {
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

  const okButton = document.getElementById('easter-egg-ok')
  if (okButton) {
    okButton.addEventListener('click', () => {
      document.body.removeChild(easterEggDialog)
    })
  }
}

// Auto-advance from installing to finish screen
export function advanceFromInstalling(): void {
  state.currentScreen++
  renderScreen()
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
