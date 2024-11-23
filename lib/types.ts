export interface Location {
  latitude: number
  longitude: number
  name: string
}

export interface NavigationStep {
  instruction: string
  distance: string
  duration: string
  maneuver?: string
}

export interface NavigationRoute {
  start: Location
  end: Location
  steps: NavigationStep[]
  totalDistance: string
  totalDuration: string
} 