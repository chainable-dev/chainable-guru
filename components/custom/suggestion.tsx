'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useWindowSize } from 'usehooks-ts';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '../ui/card';

type UISuggestion = {
  id: string;
  title: string;
  description: string;
  code?: string;
};

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
          className="absolute cursor-pointer text-muted-foreground hover:text-foreground -right-8 p-1 transition-colors"
          onClick={() => setIsExpanded(true)}
          whileHover={{ scale: 1.1 }}
        >
          <MessageSquare size={windowWidth && windowWidth < 768 ? 16 : 14} />
        </motion.div>
      ) : (
        <motion.div
          key={suggestion.id}
          className="absolute z-50 -right-12 md:-right-16"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: -20 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Card className="w-56 bg-card/95 backdrop-blur border-border shadow-lg">
            <CardHeader className="p-3 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-4 bg-primary/20 rounded-full" />
                  <div className="font-medium text-foreground">Assistant</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsExpanded(false)}
                >
                  <X size={12} className="text-muted-foreground hover:text-foreground" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 text-sm text-foreground/90">
              {suggestion.description}
            </CardContent>
            <CardFooter className="p-3 pt-0">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full w-fit"
                onClick={onApply}
              >
                Apply
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
