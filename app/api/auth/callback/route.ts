import { NextRequest, NextResponse } from 'next/server';
import { handleAuthCallback } from '../../../lib/auth'; // Adjust the import path as necessary

export async function POST(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url); // Extract search parameters from the request URL

        // Extracting tokens and other parameters
        const accessToken = searchParams.get('access_token');
        const expiresAt = searchParams.get('expires_at');
        const refreshToken = searchParams.get('refresh_token');
        const tokenType = searchParams.get('token_type');

        // You can now use these tokens as needed, e.g., store them in a session or database
        const result = await handleAuthCallback({
            accessToken,
            expiresAt,
            refreshToken,
            tokenType,
        });

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error handling callback:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 