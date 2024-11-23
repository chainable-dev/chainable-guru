import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { query } = req.query;

	if (!query || typeof query !== 'string') {
		return res.status(400).json({ error: 'Query parameter is required' });
	}

	try {
		const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
		if (!response.ok) throw new Error('Failed to fetch search results');

		const data = await response.json();
		res.status(200).json(data);
	} catch (error) {
		console.error('Error fetching search results:', error);
		res.status(500).json({ error: 'Failed to fetch search results' });
	}
}
