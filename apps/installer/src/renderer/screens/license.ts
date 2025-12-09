// License Agreement screen

import type { Screen, InstallerState } from '../../types'

export const licenseScreen: Screen = {
  render(state: InstallerState): HTMLElement {
    const screen = document.createElement('div')
    screen.className = 'screen license-screen'
    screen.innerHTML = `
      <h2>License Agreement</h2>

      <p>Please read the following license agreement carefully.</p>

      <textarea class="license-text" readonly>
PostHog 3000 - MIT License

Copyright (c) 1998 PostHog Corp.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

ADDITIONAL TERMS:
- This software is best viewed on a CRT monitor at 800x600 resolution
- Dial-up internet connection recommended but not required
- Y2K compliant (we think)
- No hedgehogs were harmed in the making of this software
      </textarea>

      <div class="license-options">
        <label>
          <input type="radio" name="license" value="accept" id="license-accept">
          I <strong>accept</strong> the terms in the license agreement
        </label>
        <label>
          <input type="radio" name="license" value="decline" id="license-decline">
          I <strong>do not accept</strong> the terms in the license agreement
        </label>
      </div>

      <p style="margin-top: 15px; font-size: 11px;">
        You must accept the agreement to install PostHog 3000.
      </p>
    `
    return screen
  },

  setupListeners(state: InstallerState, updateNav: () => void): void {
    const acceptRadio = document.getElementById('license-accept') as HTMLInputElement
    const declineRadio = document.getElementById('license-decline') as HTMLInputElement

    const handleChange = (): void => {
      state.licenseAccepted = acceptRadio.checked
      updateNav()
    }

    acceptRadio.addEventListener('change', handleChange)
    declineRadio.addEventListener('change', handleChange)

    // Set initial state
    if (state.licenseAccepted) {
      acceptRadio.checked = true
    }
  },

  canProceed(state: InstallerState): boolean {
    return state.licenseAccepted
  }
}
