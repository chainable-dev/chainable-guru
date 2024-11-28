import React, { useState } from 'react';
import { Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BetterTooltip } from '@/components/ui/tooltip';

interface RunPythonCodeProps {
  onRunCode: (code: string) => void;
}

export function RunPythonCode({ onRunCode }: RunPythonCodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState('');

  const handleRunCode = () => {
    if (code.trim()) {
      onRunCode(code.trim());
      setCode('');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <BetterTooltip content="Run Python Code">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Code className="h-4 w-4" />
          <span className="sr-only">Run Python Code</span>
        </Button>
      </BetterTooltip>
      {isOpen && (
        <div className="absolute bottom-full mb-2 w-64">
          <Textarea
            placeholder="Enter Python code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mb-2"
            rows={5}
          />
          <Button onClick={handleRunCode} className="w-full">
            Run Code
          </Button>
        </div>
      )}
    </div>
  );
} 