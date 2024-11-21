import { createClient } from '@vercel/kv';

export const KEYS = {
  SESSION: 'session:',
  USER: 'user:'
};

export const redis = createClient({
  url: process.env.KV_URL!,
  token: process.env.KV_REST_API_TOKEN!
}); 