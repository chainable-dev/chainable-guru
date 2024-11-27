import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface OllamaModel {
  name: string;
  size: string;
  modified: string;
}

function parseSize(size: string): number {
  const match = size.match(/^([\d.]+)\s*([KMGT]B)$/i);
  if (!match) return 0;
  
  const [, num, unit] = match;
  const multipliers = { KB: 1, MB: 1024, GB: 1024 * 1024, TB: 1024 * 1024 * 1024 };
  return parseFloat(num) * (multipliers[unit as keyof typeof multipliers] || 1);
}

export async function GET() {
  try {
    // Only fetch Ollama models in development
    if (process.env.NODE_ENV === 'development') {
      const { stdout } = await execAsync('ollama list');
      
      // Parse the output to get model names and sizes
      const models: OllamaModel[] = stdout
        .split('\n')
        .slice(1) // Skip header row
        .filter(Boolean)
        .map(line => {
          const [name, , size, , modified] = line.split(/\s+/);
          return { name, size, modified };
        })
        .filter(model => model.name.toLowerCase().includes('llama'))
        .sort((a, b) => parseSize(b.size) - parseSize(a.size)) // Sort by size, largest first
        .slice(0, 2); // Take only top 2 models

      return Response.json({
        models: [
          // Default OpenAI models
          { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
          { id: 'gpt-3.5-turbo', name: 'GPT-3.5', provider: 'openai' },
          // Add top 2 local Llama models
          ...models.map(model => ({
            id: model.name,
            name: model.name.split(':')[0],
            provider: 'ollama' as const,
            size: model.size
          }))
        ]
      });
    }

    // In production, return only OpenAI models
    return Response.json({
      models: [
        { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5', provider: 'openai' }
      ]
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    return Response.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
} 