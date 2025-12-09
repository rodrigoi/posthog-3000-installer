// Directory Selection screen

import type { Screen, InstallerState } from '../../types'

export const directoryScreen: Screen = {
  render(state: InstallerState): HTMLElement {
    const screen = document.createElement('div')
    screen.className = 'screen directory-screen'
    screen.innerHTML = `
      <h2>Select Installation Directory</h2>

      <p>Setup will install PostHog 3000 in the following folder.</p>

      <p>To install in a different folder, click Browse and select another folder.</p>

      <div class="directory-input-group">
        <input type="text" id="install-path" value="${state.installPath}" style="flex: 1;">
        <button id="browse-btn" style="min-width: 80px;">Browse...</button>
      </div>

      <div class="space-info">
        <div class="space-info-row">
          <span>Destination Drive:</span>
          <span><strong>C:\\</strong></span>
        </div>
        <div class="space-info-row">
          <span>Space Required:</span>
          <span>42.0 MB</span>
        </div>
        <div class="space-info-row">
          <span>Space Available:</span>
          <span>420.0 MB</span>
        </div>
      </div>

      <p style="margin-top: 20px; font-size: 11px; color: #000080;">
        Note: PostHog 3000 requires at least 16MB of RAM and a 486DX processor.
        Pentium processor recommended for optimal hedgehog rendering.
      </p>
    `
    return screen
  },

  setupListeners(state: InstallerState, updateNav: () => void): void {
    const pathInput = document.getElementById('install-path') as HTMLInputElement
    const browseBtn = document.getElementById('browse-btn')!

    pathInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      state.installPath = target.value
    })

    browseBtn.addEventListener('click', () => {
      // Show a fake browse dialog
      showFakeBrowseDialog(state, pathInput)
    })
  },

  canProceed(state: InstallerState): boolean {
    return state.installPath && state.installPath.length > 0
  }
}

function showFakeBrowseDialog(state: InstallerState, pathInput: HTMLInputElement): void {
  const dialog = document.createElement('div')
  dialog.className = 'dialog-overlay'
  dialog.innerHTML = `
    <div class="window dialog-window" style="width: 500px;">
      <div class="title-bar">
        <div class="title-bar-text">Browse For Folder</div>
      </div>
      <div class="window-body">
        <p>Select the folder where you want to install PostHog 3000:</p>
        <div style="margin: 15px 0; padding: 10px; background: white; border: 2px inset #808080; height: 200px; overflow-y: auto;">
          <ul class="tree-view" style="list-style: none; padding-left: 0;">
            <li>🖥️ My Computer</li>
            <li style="padding-left: 20px;">💾 (C:) Local Disk
              <ul style="list-style: none; padding-left: 20px;">
                <li>📁 Program Files</li>
                <li>📁 Windows</li>
                <li>📁 My Documents</li>
                <li style="background: #000080; color: white;">📁 PostHog3000</li>
              </ul>
            </li>
            <li style="padding-left: 20px;">💿 (D:) CD-ROM</li>
          </ul>
        </div>
        <div class="dialog-buttons">
          <button id="fake-browse-ok">OK</button>
          <button id="fake-browse-cancel">Cancel</button>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(dialog)

  document.getElementById('fake-browse-ok')!.addEventListener('click', () => {
    // Keep the path as is
    document.body.removeChild(dialog)
  })

  document.getElementById('fake-browse-cancel')!.addEventListener('click', () => {
    document.body.removeChild(dialog)
  })
}
