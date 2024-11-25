import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

type FetcherOptions = {
	method?: string
	headers?: Record<string, string>
	body?: any
	signal?: AbortSignal
}

export async function fetcher<T>(
	url: string,
	options: FetcherOptions = {}
): Promise<T> {
	const { 
		method = 'GET',
		headers = {},
		body,
		signal
	} = options

	const res = await fetch(url, {
		method,
		headers: {
			'Content-Type': 'application/json',
			...headers
		},
		body: body ? JSON.stringify(body) : undefined,
		signal
	})

	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		throw new Error(error.message || 'An error occurred while fetching the data')
	}

	return res.json()
}

export async function fetchWithProgress<T>(
	url: string,
	options: FetcherOptions = {},
	onProgress?: (chunk: any) => void
): Promise<T> {
	const { 
		method = 'GET',
		headers = {},
		body,
		signal
	} = options

	const res = await fetch(url, {
		method,
		headers: {
			'Content-Type': 'application/json',
			...headers
		},
		body: body ? JSON.stringify(body) : undefined,
		signal
	})

	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		throw new Error(error.message || 'An error occurred while fetching the data')
	}

	if (!res.body) {
		throw new Error('ReadableStream not supported')
	}

	const reader = res.body.getReader()
	const decoder = new TextDecoder()
	let result = ''

	while (true) {
		const { done, value } = await reader.read()
		if (done) break

		const chunk = decoder.decode(value, { stream: true })
		result += chunk

		if (onProgress) {
			try {
				const json = JSON.parse(chunk)
				onProgress(json)
			} catch (e) {
				// Ignore parse errors for partial chunks
			}
		}
	}

	try {
		return JSON.parse(result)
	} catch (e) {
		throw new Error('Invalid JSON response')
	}
}

export function generateId(): string {
	return crypto.randomUUID()
}

export function formatDate(date: Date): string {
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
	}).format(date)
}

export function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}
