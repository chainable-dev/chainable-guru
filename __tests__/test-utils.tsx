import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { ThemeProvider } from 'next-themes';
import { ErrorBoundary } from 'react-error-boundary';

const ErrorFallback = ({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) => (
  <div role="alert">
    <p>Something went wrong:</p>
    <pre>{error.message}</pre>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </ErrorBoundary>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Add custom error matcher
expect.extend({
  toHaveErrorMessage(received: Error, expected: string) {
    const pass = received.message.includes(expected);
    return {
      pass,
      message: () =>
        `expected error message "${received.message}" ${
          pass ? 'not ' : ''
        }to include "${expected}"`,
    };
  },
});

export * from '@testing-library/react';
export { customRender as render }; 