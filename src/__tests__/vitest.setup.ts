import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'
import { afterEach } from 'vitest'

// Make React available in tests
global.React = React

afterEach(() => {
  cleanup()
}) 