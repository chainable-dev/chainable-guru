import { render, screen } from '@testing-library/react';
import {Button} from './button'; // Ensure this is the correct import

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click Me</Button>); 
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });
}); 