import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/db/cached-queries';

export const runtime = 'edge';

// Define allowed file types
const ALLOWED_FILE_TYPES = {
  // Images
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  
  // Documents
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  
  // Text
  'text/plain': 'txt',
  'text/markdown': 'md',
  'text/csv': 'csv',
  
  // Code
  'text/javascript': 'js',
  'text/typescript': 'ts',
  'text/html': 'html',
  'text/css': 'css',
  'application/json': 'json',
  
  // Archives
  'application/zip': 'zip',
  'application/x-rar-compressed': 'rar',
  'application/x-7z-compressed': '7z'
} as const;

// Increase max file size to 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const chatId = formData.get('chatId') as string;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const session = await getSession();
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: 'File size exceeds 10MB limit' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!(file.type in ALLOWED_FILE_TYPES)) {
      const allowedExtensions = Object.values(ALLOWED_FILE_TYPES).join(', ');
      return new Response(
        JSON.stringify({ 
          error: `File type not supported. Allowed types: ${allowedExtensions}` 
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const timestamp = Date.now();
    const extension = ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES];
    const sanitizedFileName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.[^/.]+$/, ''); // Remove original extension
    const uniqueFileName = `${timestamp}-${sanitizedFileName}.${extension}`;
    const filePath = `${session.user.id}/${chatId}/${uniqueFileName}`;

    const supabase = await createClient();
    
    const { data, error } = await supabase.storage
      .from('chat-attachments')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return new Response(
        JSON.stringify({ error: error.message }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { data: { publicUrl } } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(filePath);

    return new Response(
      JSON.stringify({
        url: publicUrl,
        name: file.name,
        type: file.type,
        size: file.size,
        extension
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Upload handler error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

