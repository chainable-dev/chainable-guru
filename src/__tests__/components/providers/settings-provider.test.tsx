import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react-hooks'
import { SettingsProvider, useSettings, defaultSettingsValue } from '@/components/providers/settings-provider'

describe('SettingsProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useSettings Hook', () => {
    it('returns default settings when no initial settings provided', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider>{children}</SettingsProvider>
      )

      const { result } = renderHook(() => useSettings(), { wrapper })
      expect(result.current.settings).toEqual(defaultSettingsValue)
    })

    it('throws error when used outside provider', () => {
      const { result } = renderHook(() => useSettings())
      expect(result.error).toEqual(Error('useSettings must be used within a SettingsProvider'))
    })

    it('updates settings through hook', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider>{children}</SettingsProvider>
      )

      const { result } = renderHook(() => useSettings(), { wrapper })

      act(() => {
        result.current.updateSettings({ theme: 'dark' })
      })

      expect(result.current.settings.theme).toBe('dark')
    })

    it('merges partial updates correctly', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider>{children}</SettingsProvider>
      )

      const { result } = renderHook(() => useSettings(), { wrapper })
      const initialTheme = result.current.settings.theme

      act(() => {
        result.current.updateSettings({ fontSize: 'large' })
      })

      expect(result.current.settings.theme).toBe(initialTheme)
      expect(result.current.settings.fontSize).toBe('large')
    })
  })

  describe('SettingsProvider Component', () => {
    it('accepts and merges initial settings', () => {
      const initialSettings = {
        theme: 'dark' as const,
        fontSize: 'large' as const,
      }

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider initialSettings={initialSettings}>{children}</SettingsProvider>
      )

      const { result } = renderHook(() => useSettings(), { wrapper })
      expect(result.current.settings.theme).toBe(initialSettings.theme)
      expect(result.current.settings.fontSize).toBe(initialSettings.fontSize)
      expect(result.current.settings.notifications).toBe(defaultSettingsValue.notifications)
    })

    it('handles invalid settings gracefully', () => {
      const invalidSettings = {
        theme: 'invalid-theme' as any,
        fontSize: 'invalid-size' as any,
      }

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider initialSettings={invalidSettings}>{children}</SettingsProvider>
      )

      const { result } = renderHook(() => useSettings(), { wrapper })
      expect(result.current.settings.theme).toBe(invalidSettings.theme)
      expect(result.current.settings.fontSize).toBe(invalidSettings.fontSize)
    })

    it('updates multiple settings at once', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider>{children}</SettingsProvider>
      )

      const { result } = renderHook(() => useSettings(), { wrapper })

      act(() => {
        result.current.updateSettings({
          theme: 'dark',
          fontSize: 'small',
          notifications: false,
        })
      })

      expect(result.current.settings).toEqual({
        theme: 'dark',
        fontSize: 'small',
        notifications: false,
      })
    })

    it('preserves existing settings when updating with empty object', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider>{children}</SettingsProvider>
      )

      const { result } = renderHook(() => useSettings(), { wrapper })
      const initialSettings = { ...result.current.settings }

      act(() => {
        result.current.updateSettings({})
      })

      expect(result.current.settings).toEqual(initialSettings)
    })
  })

  describe('Integration Tests', () => {
    it('updates settings across multiple components', () => {
      const SettingsDisplay = () => {
        const { settings } = useSettings()
        return <div data-testid="display">{JSON.stringify(settings)}</div>
      }

      const SettingsUpdater = () => {
        const { updateSettings } = useSettings()
        return (
          <button
            data-testid="updater"
            onClick={() => updateSettings({ theme: 'dark' })}
          >
            Update
          </button>
        )
      }

      render(
        <SettingsProvider>
          <SettingsDisplay />
          <SettingsUpdater />
        </SettingsProvider>
      )

      const display = screen.getByTestId('display')
      const updater = screen.getByTestId('updater')

      const initialSettings = JSON.parse(display.textContent!)
      expect(initialSettings.theme).toBe('light')

      fireEvent.click(updater)

      const updatedSettings = JSON.parse(display.textContent!)
      expect(updatedSettings.theme).toBe('dark')
    })

    it('maintains settings consistency across rerenders', () => {
      const SettingsUser = () => {
        const { settings, updateSettings } = useSettings()
        const [count, setCount] = React.useState(0)

        return (
          <div>
            <div data-testid="settings">{JSON.stringify(settings)}</div>
            <button data-testid="update-count" onClick={() => setCount(c => c + 1)}>
              Count: {count}
            </button>
            <button
              data-testid="update-settings"
              onClick={() => updateSettings({ theme: 'dark' })}
            >
              Update Settings
            </button>
          </div>
        )
      }

      render(
        <SettingsProvider>
          <SettingsUser />
        </SettingsProvider>
      )

      // Initial state
      const settingsDisplay = screen.getByTestId('settings')
      const initialSettings = JSON.parse(settingsDisplay.textContent!)
      expect(initialSettings.theme).toBe('light')

      // Update settings
      fireEvent.click(screen.getByTestId('update-settings'))
      const updatedSettings = JSON.parse(settingsDisplay.textContent!)
      expect(updatedSettings.theme).toBe('dark')

      // Trigger rerender
      fireEvent.click(screen.getByTestId('update-count'))
      const settingsAfterRerender = JSON.parse(settingsDisplay.textContent!)
      expect(settingsAfterRerender.theme).toBe('dark')
    })
  })
}) 