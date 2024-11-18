import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';

export async function uploadToBlob(file: File, chatId?: string) {
  const filename = `${chatId ? `${chatId}/` : ''}${nanoid()}-${file.name}`;
  
  const blob = await put(filename, file, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN!
  });

  return {
    url: blob.url,
    path: filename
  };
} 