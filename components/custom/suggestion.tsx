'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RiArrowDownSLine, RiArrowUpSLine, RiMessage2Line, RiCloseLine } from 'react-icons/ri';
import { useWindowSize } from 'usehooks-ts';

import { UISuggestion } from '@/lib/editor/suggestions';
import { Button } from '../ui/button';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export const Suggestion = ({
  suggestion,
  onApply,
}: {
  suggestion: UISuggestion;
  onApply: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth && windowWidth < 768;
  const iconSize = isMobile ? 16 : 14;

  return (
    <AnimatePresence mode="wait">
      {!isExpanded ? (
        <div className="absolute -right-8 p-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  className="cursor-pointer text-muted-foreground p-1.5 hover:bg-muted rounded-full transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsExpanded(true)}
                  role="button"
                  aria-label="View suggestion"
                >
                  <RiMessage2Line size={iconSize} />
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>View suggestion</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ) : (
        <motion.div
          key={suggestion.id}
          className="absolute bg-background/95 backdrop-blur-sm p-4 flex flex-col gap-3 rounded-2xl border text-sm w-64 shadow-lg z-50 -right-12 md:-right-16"
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          initial={{ opacity: 0, y: -5, scale: 0.95 }}
          animate={{ opacity: 1, y: -20, scale: 1 }}
          exit={{ opacity: 0, y: -5, scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              <div className="size-4 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full" />
              <div className="font-medium text-primary">Assistant</div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsExpanded(false)}
                    aria-label="Close suggestion"
                  >
                    <RiCloseLine size={12} />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>Close</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="text-muted-foreground leading-relaxed">
            {suggestion.description}
          </div>

          <Button
            variant="outline"
            className="w-fit py-1.5 px-4 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={onApply}
          >
            Apply Suggestion
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
