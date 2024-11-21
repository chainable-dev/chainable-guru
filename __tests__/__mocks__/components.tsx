import { vi } from 'vitest'

export const MockSidebar = vi.fn().mockImplementation(({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
))

export const MockMultimodalInput = vi.fn().mockImplementation(() => (
  <div data-testid="mock-multimodal-input" />
))

export const MockPreviewAttachment = vi.fn().mockImplementation(() => (
  <div data-testid="mock-preview-attachment" />
))

export const MockSuggestion = vi.fn().mockImplementation(() => (
  <div data-testid="mock-suggestion" />
)) 