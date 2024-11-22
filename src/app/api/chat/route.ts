import { NextResponse } from 'next/server';
import formidable, { Fields, Files } from 'formidable';
import { IncomingMessage } from 'http';

export async function POST(req: Request) {
  try {
    // Convert the Request to IncomingMessage
    const incomingMessage = req as unknown as IncomingMessage;

    const form = new formidable.IncomingForm();
    const { fields, files }: { fields: Fields; files: Files } = await new Promise((resolve, reject) => {
      form.parse(incomingMessage, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    // Process the message and attachments
    const message = fields.message;
    const attachments = files;

    // Handle the message and attachments as needed
    // ...

    return NextResponse.json({ message: { role: 'assistant', content: 'Response with attachments processed' } });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 