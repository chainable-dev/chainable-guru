import { Power } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useActionsStore } from '@/lib/stores/use-actions-store';

export function ActionToggle() {
  const { isEnabled, toggleActions } = useActionsStore();

  return (
    <Button 
      variant="outline" 
      size="icon" 
      className={`size-9 transition-colors ${isEnabled ? 'bg-green-500/10' : 'bg-red-500/10'}`}
      onClick={toggleActions}
    >
      <Power className={`size-4 transition-all ${isEnabled ? 'text-green-500' : 'text-red-500'}`} />
      <span className="sr-only">Toggle actions</span>
    </Button>
  );
} 