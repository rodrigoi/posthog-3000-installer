// Component Selection screen

import type { Screen, InstallerState, Component } from '../../types'

const COMPONENTS: Component[] = [
  {
    id: 'analytics',
    name: 'Analytics & Product Analytics',
    description: 'Core analytics engine. Track events, analyze user behavior, and visualize data.',
    size: '12.5 MB',
    required: true
  },
  {
    id: 'session-replay',
    name: 'Session Replay',
    description: 'Record and replay user sessions to understand how users interact with your product.',
    size: '8.2 MB',
    required: false
  },
  {
    id: 'feature-flags',
    name: 'Feature Flags',
    description: 'Roll out features gradually with powerful targeting and experimentation.',
    size: '5.1 MB',
    required: false
  },
  {
    id: 'ab-testing',
    name: 'A/B Testing',
    description: 'Run experiments to optimize your product decisions with statistical significance.',
    size: '6.8 MB',
    required: false
  },
  {
    id: 'data-pipeline',
    name: 'Data Pipeline',
    description: 'Transform and export data to your data warehouse or other tools.',
    size: '7.4 MB',
    required: false
  },
  {
    id: 'notebooks',
    name: 'Notebooks',
    description: 'Create beautiful, collaborative analysis notebooks with live data.',
    size: '4.2 MB',
    required: false
  }
]

export const componentsScreen: Screen = {
  render(state: InstallerState): HTMLElement {
    const screen = document.createElement('div')
    screen.className = 'screen components-screen'

    const totalSize = calculateTotalSize(state.selectedComponents)

    screen.innerHTML = `
      <h2>Select Components</h2>

      <p>Select the components you want to install. Clear the components you do not want to install.</p>

      <div class="components-list" id="components-list">
        ${COMPONENTS.map(component => `
          <div class="component-item">
            <div class="field-row">
              <input
                type="checkbox"
                id="component-${component.id}"
                value="${component.id}"
                ${state.selectedComponents.includes(component.id) ? 'checked' : ''}
                ${component.required ? 'disabled' : ''}
              >
              <label for="component-${component.id}"></label>
            </div>
            <div class="component-info">
              <div class="component-name">${component.name}${component.required ? ' (Required)' : ''}</div>
              <div class="component-description">${component.description}</div>
            </div>
            <div class="component-size">${component.size}</div>
          </div>
        `).join('')}
      </div>

      <fieldset style="margin-top: 20px; padding: 10px;">
        <legend>Space Requirements</legend>
        <div style="font-size: 11px;">
          <div><strong>Total Size:</strong> ${totalSize} MB</div>
          <div><strong>Available Space:</strong> 420.0 MB</div>
        </div>
      </fieldset>
    `
    return screen
  },

  setupListeners(state: InstallerState, updateNav: () => void): void {
    const checkboxes = document.querySelectorAll<HTMLInputElement>('#components-list input[type="checkbox"]')

    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement
        const componentId = target.value
        if (target.checked) {
          if (!state.selectedComponents.includes(componentId)) {
            state.selectedComponents.push(componentId)
          }
        } else {
          state.selectedComponents = state.selectedComponents.filter(id => id !== componentId)
        }

        // Update the total size display
        const totalSize = calculateTotalSize(state.selectedComponents)
        const sizeDisplay = document.querySelector('fieldset div strong')
        if (sizeDisplay && sizeDisplay.nextSibling) {
          sizeDisplay.nextSibling.textContent = ` ${totalSize} MB`
        }

        updateNav()
      })
    })
  },

  canProceed(state: InstallerState): boolean {
    return state.selectedComponents.length > 0
  }
}

function calculateTotalSize(selectedComponents: string[]): string {
  let total = 0
  COMPONENTS.forEach(component => {
    if (selectedComponents.includes(component.id)) {
      total += parseFloat(component.size)
    }
  })
  return total.toFixed(1)
}
