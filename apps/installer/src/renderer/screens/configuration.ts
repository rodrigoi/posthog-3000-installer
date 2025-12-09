// Configuration screen

import type { Screen, InstallerState } from '../../types'

export const configurationScreen: Screen = {
  render(state: InstallerState): HTMLElement {
    const screen = document.createElement('div')
    screen.className = 'screen configuration-screen'
    screen.innerHTML = `
      <h2>Configure PostHog 3000</h2>

      <p>Please provide the following information to configure your PostHog installation.</p>

      <div class="config-form">
        <div class="form-group">
          <label for="project-name">Project Name:</label>
          <input
            type="text"
            id="project-name"
            value="${state.configData.projectName}"
            placeholder="My Awesome Project"
          >
        </div>

        <div class="form-group">
          <label for="instance-type">Instance Type:</label>
          <select id="instance-type">
            <option value="cloud" ${state.configData.instanceType === 'cloud' ? 'selected' : ''}>
              PostHog Cloud (Recommended)
            </option>
            <option value="self-hosted" ${state.configData.instanceType === 'self-hosted' ? 'selected' : ''}>
              Self-Hosted
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="api-key">API Key:</label>
          <div class="input-with-button">
            <input
              type="text"
              id="api-key"
              value="${state.configData.apiKey}"
              placeholder="phc_..."
            >
            <button id="api-key-btn">...</button>
          </div>
          <div style="font-size: 10px; margin-top: 5px; color: #808080;">
            Optional: Get your API key from app.posthog.com
          </div>
        </div>

        <details class="advanced-section">
          <summary>Advanced Settings</summary>
          <div style="margin-top: 10px;">
            <div class="form-group">
              <label>
                <input type="checkbox" id="enable-autocapture">
                Enable Autocapture
              </label>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" id="capture-pageview">
                Capture Page Views
              </label>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" id="enable-turbo" style="margin-right: 5px;">
                Enable Turbo Mode (Y2K Compatible)
              </label>
            </div>
          </div>
        </details>
      </div>

      <p style="margin-top: 20px; font-size: 11px; color: #000080;">
        Note: You can change these settings later in the PostHog 3000 Control Panel.
      </p>
    `
    return screen
  },

  setupListeners(state: InstallerState, updateNav: () => void): void {
    const projectName = document.getElementById('project-name') as HTMLInputElement
    const instanceType = document.getElementById('instance-type') as HTMLSelectElement
    const apiKey = document.getElementById('api-key') as HTMLInputElement
    const apiKeyBtn = document.getElementById('api-key-btn')!

    projectName.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      state.configData.projectName = target.value
      updateNav()
    })

    instanceType.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement
      state.configData.instanceType = target.value as 'cloud' | 'self-hosted'
    })

    apiKey.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      state.configData.apiKey = target.value
    })

    apiKeyBtn.addEventListener('click', () => {
      showApiKeyDialog()
    })

    // Set default values for checkboxes
    const autocapture = document.getElementById('enable-autocapture') as HTMLInputElement
    const pageview = document.getElementById('capture-pageview') as HTMLInputElement
    autocapture.checked = true
    pageview.checked = true
  },

  canProceed(state: InstallerState): boolean {
    // Project name is optional, so we can always proceed
    return true
  }
}

function showApiKeyDialog(): void {
  const dialog = document.createElement('div')
  dialog.className = 'dialog-overlay'
  dialog.innerHTML = `
    <div class="window dialog-window" style="width: 450px;">
      <div class="title-bar">
        <div class="title-bar-text">API Key Help</div>
      </div>
      <div class="window-body">
        <div class="dialog-content">
          <p><strong>Where to find your API Key:</strong></p>
          <ol style="margin: 10px 0; padding-left: 25px;">
            <li>Visit <strong>app.posthog.com</strong></li>
            <li>Click on your project settings</li>
            <li>Navigate to "Project API Key"</li>
            <li>Copy the key (starts with "phc_")</li>
          </ol>
          <p style="margin-top: 15px; font-size: 10px; color: #808080;">
            Note: API key is optional for this demo installer.
            In a real installation, you would connect to your PostHog instance.
          </p>
        </div>
        <div class="dialog-buttons">
          <button id="api-help-ok">OK</button>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(dialog)

  document.getElementById('api-help-ok')!.addEventListener('click', () => {
    document.body.removeChild(dialog)
  })
}
