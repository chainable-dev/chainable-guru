import { describe, expect, it } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import { Button } from './button';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByText('Click Me');
    expect(button).toBeInTheDocument();
  });
}); 