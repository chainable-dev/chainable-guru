'use client'

import { useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'

interface ChatScrollAnchorProps {
  trackVisibility?: boolean
}

export function ChatScrollAnchor({ trackVisibility }: ChatScrollAnchorProps) {
  const lastMessageRef = useRef<HTMLDivElement>(null)
  const { ref, inView } = useInView()

  useEffect(() => {
    if (trackVisibility && !inView) {
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [inView, trackVisibility])

  return <div ref={ref} className="h-px w-full" />
} 