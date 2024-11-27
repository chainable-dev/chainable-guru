import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react'
import { SettingsProvider, useSettings, defaultSettingsValue } from '@/components/providers/settings-provider'

describe('SettingsProvider', () => {
  it('provides default settings', () => {
    const TestComponent = () => {
      const { settings } = useSettings()
      return <div data-testid="settings">{JSON.stringify(settings)}</div>
    }

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    )

    const settingsElement = screen.getByTestId('settings')
    expect(JSON.parse(settingsElement.textContent!)).toEqual(defaultSettingsValue)
  })

  it('accepts initial settings', () => {
    const initialSettings = {
      theme: 'dark' as const,
      fontSize: 'large' as const,
    }

    const TestComponent = () => {
      const { settings } = useSettings()
      return <div data-testid="settings">{JSON.stringify(settings)}</div>
    }

    render(
      <SettingsProvider initialSettings={initialSettings}>
        <TestComponent />
      </SettingsProvider>
    )

    const settingsElement = screen.getByTestId('settings')
    const currentSettings = JSON.parse(settingsElement.textContent!)
    expect(currentSettings.theme).toBe(initialSettings.theme)
    expect(currentSettings.fontSize).toBe(initialSettings.fontSize)
  })

  it('updates settings correctly', () => {
    const TestComponent = () => {
      const { settings, updateSettings } = useSettings()
      return (
        <div>
          <div data-testid="settings">{JSON.stringify(settings)}</div>
          <button
            onClick={() => updateSettings({ theme: 'dark' })}
            data-testid="update-button"
          >
            Update Theme
          </button>
        </div>
      )
    }

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    )

    const updateButton = screen.getByTestId('update-button')
    fireEvent.click(updateButton)

    const settingsElement = screen.getByTestId('settings')
    const currentSettings = JSON.parse(settingsElement.textContent!)
    expect(currentSettings.theme).toBe('dark')
  })

  it('throws error when useSettings is used outside provider', () => {
    const TestComponent = () => {
      useSettings()
      return null
    }

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestComponent />)).toThrow('useSettings must be used within a SettingsProvider')
    consoleError.mockRestore()
  })

  it('preserves other settings when updating partially', () => {
    const TestComponent = () => {
      const { settings, updateSettings } = useSettings()
      return (
        <div>
          <div data-testid="settings">{JSON.stringify(settings)}</div>
          <button
            onClick={() => updateSettings({ fontSize: 'small' })}
            data-testid="update-button"
          >
            Update Font Size
          </button>
        </div>
      )
    }

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    )

    const initialSettingsElement = screen.getByTestId('settings')
    const initialSettings = JSON.parse(initialSettingsElement.textContent!)
    const initialTheme = initialSettings.theme

    const updateButton = screen.getByTestId('update-button')
    fireEvent.click(updateButton)

    const updatedSettingsElement = screen.getByTestId('settings')
    const updatedSettings = JSON.parse(updatedSettingsElement.textContent!)
    expect(updatedSettings.fontSize).toBe('small')
    expect(updatedSettings.theme).toBe(initialTheme)
  })
}) 