import { useState } from 'react';
import { toast } from 'sonner';
import { DatabaseIcon } from './icons';

interface DatabaseQueryToolProps {
  type: 'select' | 'insert' | 'update' | 'delete';
  args: {
    table: string;
    query?: any;
    data?: any;
  };
  result?: {
    success: boolean;
    data?: any;
    error?: string;
  };
}

export function DatabaseQueryTool({ type, args, result }: DatabaseQueryToolProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getActionText = () => {
    switch (type) {
      case 'select':
        return 'Querying';
      case 'insert':
        return 'Inserting into';
      case 'update':
        return 'Updating';
      case 'delete':
        return 'Deleting from';
      default:
        return 'Processing';
    }
  };

  if (!result) {
    return (
      <div className="w-fit border py-2 px-3 rounded-xl flex flex-row items-start justify-between gap-3">
        <div className="flex flex-row gap-3 items-start">
          <div className="text-zinc-500 mt-1">
            <DatabaseIcon />
          </div>
          <div>
            {getActionText()} {args.table}
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
          <DatabaseIcon />
        </div>
        <div className="flex flex-col gap-2">
          <div>
            {result.success ? (
              <>
                <div className="font-medium">
                  {type === 'select' && 'Query Results'}
                  {type === 'insert' && 'Insert Results'}
                  {type === 'update' && 'Update Results'}
                  {type === 'delete' && 'Delete Results'}
                </div>
                <pre className="bg-muted p-2 rounded-md mt-2 overflow-x-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
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