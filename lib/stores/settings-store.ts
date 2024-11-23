import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FEATURES } from '@/lib/features'

interface SettingsState {
  webSearch: boolean
  attachments: boolean
  setWebSearch: (enabled: boolean) => void
  setAttachments: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      webSearch: FEATURES.WEB_SEARCH,
      attachments: FEATURES.ATTACHMENTS,
      setWebSearch: (enabled) => set({ webSearch: enabled }),
      setAttachments: (enabled) => set({ attachments: enabled }),
    }),
    {
      name: 'settings-storage',
    }
  )
) 