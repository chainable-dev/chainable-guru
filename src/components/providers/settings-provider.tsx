import React, { createContext, useContext, useState } from 'react'

interface Settings {
  theme: 'light' | 'dark'
  fontSize: 'small' | 'medium' | 'large'
  notifications: boolean
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
}

const defaultSettings: Settings = {
  theme: 'light',
  fontSize: 'medium',
  notifications: true,
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

interface SettingsProviderProps {
  children: React.ReactNode
  initialSettings?: Partial<Settings>
}

export function SettingsProvider({ children, initialSettings = {} }: SettingsProviderProps) {
  const [settings, setSettings] = useState<Settings>({
    ...defaultSettings,
    ...initialSettings,
  })

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }))
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const defaultSettingsValue = defaultSettings
