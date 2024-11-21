import { NextRequest, NextResponse } from 'next/server';




export async function POST(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url); // Extract search parameters from the request URL

        // Extracting tokens and other parameters
        const accessToken = searchParams.get('access_token');
        const expiresAt = searchParams.get('expires_at');
        const refreshToken = searchParams.get('refresh_token');
        const tokenType = searchParams.get('token_type');

        // Return the extracted tokens directly
        return NextResponse.json({
            accessToken,
            expiresAt,
            refreshToken,
            tokenType
        }, { status: 200 });

    } catch (error) {
        console.error('Error handling callback:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
