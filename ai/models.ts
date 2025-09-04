// Define your models here.

export interface Model {
	id: string;
	label: string;
	apiIdentifier: string;
	description: string;
}

export const models: Array<Model> = [
	{
		id: "gemini-1.5-flash",
		label: "Gemini 1.5 Flash",
		apiIdentifier: "gemini-1.5-flash",
		description: "Fast and efficient model for general tasks",
	},
	{
		id: "gemini-1.5-pro",
		label: "Gemini 1.5 Pro",
		apiIdentifier: "gemini-1.5-pro",
		description: "Advanced model for complex tasks",
	},
] as const;

export const DEFAULT_MODEL_NAME: string = "gemini-1.5-flash";
