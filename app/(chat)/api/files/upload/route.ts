import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { generateUUID } from '@/lib/utils/utils';

export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Get form data
    const data = await req.formData();
    const file = data.get('file') as File;
    const chatId = data.get('chatId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get authenticated user - fix the client creation
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate unique path for blob storage
    const blobPath = `${user.id}/${generateUUID()}/${file.name}`;

    // Upload to blob storage
    const blob = await put(blobPath, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    // Return the blob URL immediately
    return NextResponse.json({
      url: blob.url,
      path: blob.url,
      success: true
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
