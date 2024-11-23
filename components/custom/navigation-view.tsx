'use client';

import { MapPin, Navigation2 } from 'lucide-react'
import type { NavigationRoute } from '@/lib/types'

interface NavigationViewProps {
  route: NavigationRoute
}

export function NavigationView({ route }: NavigationViewProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl p-4 bg-gradient-to-br from-blue-500 to-purple-600 max-w-[500px]">
      <div className="flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          <span>{route.start.name}</span>
        </div>
        <div className="text-blue-100">→</div>
        <div className="flex items-center gap-2">
          <span>{route.end.name}</span>
          <MapPin className="h-5 w-5" />
        </div>
      </div>

      <div className="flex justify-between text-sm text-blue-100 bg-white/10 rounded-lg p-2">
        <span>Total Distance: {route.totalDistance}</span>
        <span>Duration: {route.totalDuration}</span>
      </div>

      <div className="flex flex-col gap-2">
        {route.steps.map((step, index) => (
          <div 
            key={index}
            className="flex items-start gap-3 bg-white/10 rounded-lg p-3"
          >
            <Navigation2 className="h-5 w-5 text-blue-100 mt-1" />
            <div className="flex flex-col">
              <span className="text-white">{step.instruction}</span>
              <span className="text-sm text-blue-100">
                {step.distance} • {step.duration}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 