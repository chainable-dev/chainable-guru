import { render } from "@testing-library/react";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "react-error-boundary";
import { ReactElement } from "react";

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
	return (
		<ErrorBoundary
			FallbackComponent={({ error }) => <div>{error.message}</div>}
		>
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				{children}
			</ThemeProvider>
		</ErrorBoundary>
	);
};

const customRender = (ui: ReactElement, options = {}) =>
	render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
