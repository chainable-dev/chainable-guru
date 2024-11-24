import React from 'react';
import classNames from 'classnames';

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={classNames('flex flex-col gap-2 p-2', className)}
    {...props}
  />
));

SidebarMenu.displayName = 'SidebarMenu';

export default SidebarMenu;
