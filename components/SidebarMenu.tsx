import React from 'react';
import { cn } from 'classnames'; // Assuming cn is a utility function for classnames

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn('flex flex-col gap-2 p-2', className)}
    {...props}
  />
));

SidebarMenu.displayName = 'SidebarMenu';

export default SidebarMenu;
