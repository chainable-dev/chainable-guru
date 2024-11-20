import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import RootLayout from '@/app/layout';

describe('Root Layout', () => {
  it('should render children and maintain layout structure', () => {
    render(
      <RootLayout>
        <div data-testid="child-content">Test Content</div>
      </RootLayout>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(document.querySelector('html')).toHaveAttribute('lang', 'en');
  });

  it('should include theme provider and necessary meta tags', () => {
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );

    // Check for theme provider
    expect(document.documentElement).toHaveAttribute('class');
    
    // Check meta tags
    const viewport = document.querySelector('meta[name="viewport"]');
    expect(viewport).toHaveAttribute('content', 'width=device-width, initial-scale=1');
  });
}); 