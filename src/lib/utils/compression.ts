import { deflate, inflate } from 'pako';

export async function compress(data: string): Promise<string> {
  try {
    const compressed = deflate(data);
    return Buffer.from(compressed).toString('base64');
  } catch (error) {
    throw new Error(`Compression failed: ${error.message}`);
  }
}

export async function decompress(data: string): Promise<string> {
  try {
    const compressedData = Buffer.from(data, 'base64');
    const decompressed = inflate(compressedData);
    return new TextDecoder().decode(decompressed);
  } catch (error) {
    throw new Error(`Decompression failed: ${error.message}`);
  }
} 