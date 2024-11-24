import React from 'react';
import classNames from 'classnames';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
  <ul
    ref={ref}
    data-sidebar="menu"
    className={classNames('flex flex-col gap-2 p-2', className)}
    {...props}
  />
      </TooltipTrigger>
      <TooltipContent>
        Sidebar Menu
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
));

SidebarMenu.displayName = 'SidebarMenu';

export default SidebarMenu;
