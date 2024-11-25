'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  isOpen: boolean
  defaultWidth: number
  width: number
  isResizing: boolean
  setWidth: (width: number) => void
  setIsResizing: (isResizing: boolean) => void
  toggle: () => void
  setIsOpen: (isOpen: boolean) => void
}

export const useSidebar = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: true,
      defaultWidth: 260,
      width: 260,
      isResizing: false,
      setWidth: (width) => set({ width }),
      setIsResizing: (isResizing) => set({ isResizing }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setIsOpen: (isOpen) => set({ isOpen })
    }),
    {
      name: 'sidebar-storage',
      skipHydration: true,
    }
  )
)

// Helper hook for responsive behavior
export function useResponsiveSidebar() {
  const { isOpen, toggle, setIsOpen, width, defaultWidth } = useSidebar()

  // Close sidebar on mobile when clicking outside
  const handleOutsideClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false)
    }
  }

  // Reset width to default
  const resetWidth = () => {
    useSidebar.setState({ width: defaultWidth })
  }

  return {
    isOpen,
    toggle,
    setIsOpen,
    width,
    defaultWidth,
    handleOutsideClick,
    resetWidth
  }
} 