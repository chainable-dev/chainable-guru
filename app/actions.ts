'use server'

import { StreamingTextResponse } from 'ai'
import { z } from 'zod'

// Define schemas for our data structures
const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  name: z.string()
})

const NavigationStepSchema = z.object({
  instruction: z.string(),
  distance: z.string(),
  duration: z.string(),
  maneuver: z.string().optional()
})

const NavigationRouteSchema = z.object({
  start: LocationSchema,
  end: LocationSchema,
  steps: z.array(NavigationStepSchema),
  totalDistance: z.string(),
  totalDuration: z.string()
})

// Input validation schema
const NavigationInputSchema = z.object({
  start: z.string(),
  end: z.string()
})

const SAMPLE_ROUTE = {
  start: {
    latitude: 37.7749,
    longitude: -122.4194,
    name: "San Francisco"
  },
  end: {
    latitude: 37.8044,
    longitude: -122.2712,
    name: "Oakland"
  },
  steps: [
    {
      instruction: "Head east on Market St",
      distance: "0.5 mi",
      duration: "2 mins",
      maneuver: "straight"
    },
    {
      instruction: "Take I-80 E towards Bay Bridge",
      distance: "2.1 mi",
      duration: "4 mins",
      maneuver: "merge"
    },
    {
      instruction: "Cross Bay Bridge",
      distance: "4.5 mi",
      duration: "6 mins",
      maneuver: "straight"
    }
  ],
  totalDistance: "7.1 mi",
  totalDuration: "12 mins"
} as const

export async function generateNavigationResponse(input: z.infer<typeof NavigationInputSchema>): Promise<Response> {
  try {
    // Validate input
    const { start, end } = NavigationInputSchema.parse(input)

    // Generate navigation data
    const navigationData = {
      ...SAMPLE_ROUTE,
      start: { ...SAMPLE_ROUTE.start, name: start },
      end: { ...SAMPLE_ROUTE.end, name: end }
    }

    // Validate output
    const validatedData = NavigationRouteSchema.parse(navigationData)

    return new Response(
      JSON.stringify({
        type: 'navigation',
        data: validatedData
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Navigation error:', error)
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input or data format',
          details: error.errors 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }
    return new Response(
      JSON.stringify({ error: 'Failed to generate navigation' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}