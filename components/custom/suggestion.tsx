'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useWindowSize } from 'usehooks-ts';
import Image from 'next/image'

import { UISuggestion } from '@/lib/editor/suggestions';
import { quotes } from '@/lib/constants/quotes'

import { CrossIcon, MessageIcon } from './icons';
import { Button } from '../ui/button';

export const Suggestion = ({
  suggestion,
  onApply,
}: {
  suggestion: UISuggestion;
  onApply: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { width: windowWidth } = useWindowSize();

  return (
    <AnimatePresence>
      {!isExpanded ? (
        <motion.div
          className="absolute cursor-pointer text-muted-foreground -right-8 p-1"
          onClick={() => {
            setIsExpanded(true);
          }}
          whileHover={{ scale: 1.1 }}
        >
          <MessageIcon size={windowWidth && windowWidth < 768 ? 16 : 14} />
        </motion.div>
      ) : (
        <motion.div
          key={suggestion.id}
          className="absolute bg-background p-3 flex flex-col gap-3 rounded-2xl border text-sm w-56 shadow-xl z-50 -right-12 md:-right-16"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: -20 }}
          exit={{ opacity: 0, y: -10 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              <div className="size-4 bg-muted-foreground/25 rounded-full" />
              <div className="font-medium">Assistant</div>
            </div>
            <div
              className="text-xs text-gray-500 cursor-pointer"
              onClick={() => {
                setIsExpanded(false);
              }}
            >
              <CrossIcon size={12} />
            </div>
          </div>
          <div>{suggestion.description}</div>
          <Button
            variant="outline"
            className="w-fit py-1.5 px-3 rounded-full"
            onClick={onApply}
          >
            Apply
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export function SuggestionOverview() {
  const [currentQuote, setCurrentQuote] = useState('')

  useEffect(() => {
    // Update quote every 5 hours
    const updateQuote = () => {
      const randomIndex = Math.floor(Math.random() * quotes.length)
      setCurrentQuote(quotes[randomIndex])
    }
    
    updateQuote() // Initial quote
    const interval = setInterval(updateQuote, 5 * 60 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center space-y-6 p-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-lg border">
      <div className="flex items-center space-x-4">
        <div className="relative w-12 h-12">
          <Image
            src="/images/elron.ico"
            alt="Elron Bot"
            fill
            className="rounded-full object-cover"
            priority
          />
        </div>
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold tracking-tight">Elron</h2>
          <p className="text-sm text-muted-foreground">Powered by chainable.co</p>
        </div>
      </div>
      
      <div className="w-full max-w-[500px] text-center">
        <p className="text-sm italic text-muted-foreground">&ldquo;{currentQuote}&rdquo;</p>
      </div>

      <div className="relative w-[120px] h-[30px]">
        <Image 
          src="/images/logo-darkmode.png"
          alt="Chainable Logo"
          fill
          className="opacity-80 dark:opacity-100 object-contain"
        />
      </div>
    </div>
  )
}
