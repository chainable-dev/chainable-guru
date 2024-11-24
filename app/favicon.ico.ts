export const runtime = 'edge';

export async function GET() {
  return new Response(null, {
    status: 307,
    headers: {
      Location: '/icons/favicon.ico',
    },
  });
} 