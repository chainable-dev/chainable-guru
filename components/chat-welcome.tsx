import React from 'react'

export function ChatWelcome() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <div className="rounded-lg border bg-background p-8">
        <div className="flex items-center justify-center mb-8">
          <div className="relative h-32 w-32">
            <img
              src="/icons/chainable.svg"
              alt="Chainable Logo"
              className="object-contain"
            />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">
          Welcome to Chainable
        </h1>
        <p className="text-muted-foreground text-center text-sm mb-4">
          Your trusted companion in the blockchain journey
        </p>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p className="text-center">
            Built with Next.js and secured with Base & Supabase
          </p>
        </div>
      </div>
    </div>
  )
} 