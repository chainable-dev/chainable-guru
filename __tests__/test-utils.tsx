import React from "react";
import { render } from "@testing-library/react";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "react-error-boundary";

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
	return (
		<ErrorBoundary fallback={<div>Error</div>}>
			<ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
				{children}
			</ThemeProvider>
		</ErrorBoundary>
	);
};

const customRender = (ui: React.ReactElement, options = {}) =>
	render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };
