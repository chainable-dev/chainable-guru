import { describe, expect, it } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import { SidebarToggle } from '@/components/custom/sidebar-toggle';

describe('SidebarToggle', () => {
  it('renders correctly', () => {
    render(<SidebarToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
}); 