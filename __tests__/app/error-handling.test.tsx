import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import Error from '@/app/error';
import Loading from '@/app/loading';

describe('Error Handling and Loading Architecture', () => {
  it('should render error boundary correctly', () => {
    const resetErrorBoundary = vi.fn();
    
    render(
      <Error 
        error={new Error('Test error')} 
        reset={resetErrorBoundary}
      />
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    
    // Test reset functionality
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(resetErrorBoundary).toHaveBeenCalled();
  });

  it('should render loading state correctly', () => {
    render(<Loading />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
}); 