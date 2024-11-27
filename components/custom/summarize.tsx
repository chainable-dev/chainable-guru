import { useState } from 'react';
import { toast } from 'sonner';
import { SummarizeIcon } from './icons';

interface SummarizeToolProps {
  type: 'text' | 'document' | 'conversation';
  args: {
    content: string;
    options?: {
      maxLength?: number;
      format?: 'bullet' | 'paragraph';
      focus?: string;
    };
  };
  result?: {
    success: boolean;
    summary?: string;
    keyPoints?: string[];
    error?: string;
  };
}

export function SummarizeTool({ type, args, result }: SummarizeToolProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getActionText = () => {
    switch (type) {
      case 'text':
        return 'Summarizing text';
      case 'document':
        return 'Summarizing document';
      case 'conversation':
        return 'Summarizing conversation';
      default:
        return 'Processing';
    }
  };

  if (!result) {
    return (
      <div className="w-fit border py-2 px-3 rounded-xl flex flex-row items-start justify-between gap-3">
        <div className="flex flex-row gap-3 items-start">
          <div className="text-zinc-500 mt-1">
            <SummarizeIcon />
          </div>
          <div>{getActionText()}</div>
        </div>
        <div className="animate-spin mt-1">⋯</div>
      </div>
    );
  }

  return (
    <div className="w-fit border py-2 px-3 rounded-xl">
      <div className="flex flex-row gap-3 items-start">
        <div className="text-zinc-500 mt-1">
          <SummarizeIcon />
        </div>
        <div className="flex flex-col gap-2">
          {result.success ? (
            <>
              {result.summary && (
                <div className="prose dark:prose-invert">
                  <p>{result.summary}</p>
                </div>
              )}
              {result.keyPoints && (
                <div className="prose dark:prose-invert">
                  <ul>
                    {result.keyPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <span className="text-red-500">{result.error}</span>
          )}
        </div>
      </div>
    </div>
  );
} 