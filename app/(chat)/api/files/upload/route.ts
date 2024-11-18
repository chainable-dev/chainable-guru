import { NextResponse } from 'next/server';
import { upload } from '@/db/storage';
import { createClient } from '@/lib/supabase/server';

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const chatId = formData.get('chatId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    try {
      const sanitizedFileName = sanitizeFileName(file.name);
      const filePath = [userId, chatId, sanitizedFileName];

      const publicUrl = await upload(supabase, {
        file,
        path: filePath,
      });

      const { error: dbError } = await supabase.from('file_uploads').insert({
        user_id: userId,
        chat_id: chatId,
        bucket_id: 'chat_attachments',
        storage_path: filePath.join('/'),
        filename: sanitizedFileName,
        original_name: file.name,
        content_type: file.type,
        size: file.size,
        url: publicUrl,
      });

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw dbError;
      }

      return NextResponse.json({
        url: publicUrl,
        path: filePath.join('/'),
      });

    } catch (uploadError: any) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        {
          error: 'File upload failed',
          details: uploadError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Request handler error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
