import { useState } from 'react';
import { toast } from 'sonner';
import { FileIcon } from './icons';
import { Button } from '../ui/button';

interface FileSystemToolProps {
  type: 'read' | 'write' | 'list';
  args: {
    path?: string;
    content?: string;
  };
  result?: {
    success: boolean;
    data?: string | string[];
    error?: string;
  };
}

export function FileSystemTool({ type, args, result }: FileSystemToolProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getActionText = () => {
    switch (type) {
      case 'read':
        return 'Reading file';
      case 'write':
        return 'Writing to file';
      case 'list':
        return 'Listing directory';
      default:
        return 'Processing';
    }
  };

  if (!result) {
    return (
      <div className="w-fit border py-2 px-3 rounded-xl flex flex-row items-start justify-between gap-3">
        <div className="flex flex-row gap-3 items-start">
          <div className="text-zinc-500 mt-1">
            <FileIcon />
          </div>
          <div>
            {getActionText()} {args.path}
          </div>
        </div>
        <div className="animate-spin mt-1">⋯</div>
      </div>
    );
  }

  return (
    <div className="w-fit border py-2 px-3 rounded-xl">
      <div className="flex flex-row gap-3 items-start">
        <div className="text-zinc-500 mt-1">
          <FileIcon />
        </div>
        <div className="flex flex-col gap-2">
          <div>
            {result.success ? (
              <>
                {type === 'read' && (
                  <pre className="bg-muted p-2 rounded-md mt-2 overflow-x-auto">
                    {result.data as string}
                  </pre>
                )}
                {type === 'list' && (
                  <ul className="list-disc list-inside mt-2">
                    {(result.data as string[]).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                )}
                {type === 'write' && (
                  <span className="text-green-500">Successfully wrote to {args.path}</span>
                )}
              </>
            ) : (
              <span className="text-red-500">{result.error}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 