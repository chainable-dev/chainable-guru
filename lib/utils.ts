import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Function to generate UUID for chat IDs
export function generateUUID(): string {
	return uuidv4();
}

// Function to check if string is valid UUID
export function isValidUUID(str: string): boolean {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(str);
}

// Function to format date
export function formatDate(date: Date): string {
	return new Intl.DateTimeFormat("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	}).format(date);
}

// Function to wait for a specified duration
export function wait(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to truncate text
export function truncate(str: string, length: number): string {
	return str.length > length ? `${str.substring(0, length)}...` : str;
}
