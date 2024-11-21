import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { access_token, refresh_token } = req.query;

    if (access_token) {
        // Store the tokens in cookies or session storage as needed
        res.setHeader('Set-Cookie', [
            `sb:token=${access_token}; Path=/; HttpOnly;`,
            `sb:refresh_token=${refresh_token}; Path=/; HttpOnly;`,
        ]);
        return res.redirect('/dashboard'); // Redirect to the dashboard or home page
    }

    return res.status(400).json({ error: 'Invalid request' });
} 