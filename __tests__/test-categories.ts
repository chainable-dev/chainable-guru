export const TEST_CATEGORIES = {
	ARCHITECTURE: "Architecture",
	COMPONENTS: "Components",
	API: "API Routes",
	HOOKS: "Hooks",
	UTILS: "Utilities",
	LAYOUTS: "Layouts",
	ROUTING: "Routing",
	DATA_FETCHING: "Data Fetching",
	ERROR_HANDLING: "Error Handling",
} as const;

export type TestCategory =
	(typeof TEST_CATEGORIES)[keyof typeof TEST_CATEGORIES];
