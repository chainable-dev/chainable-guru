import { z } from 'zod';

// Model configuration schema
export const modelConfigSchema = z.object({
  id: z.string(),
  label: z.string(),
  apiIdentifier: z.string(),
  description: z.string(),
  maxTokens: z.number().optional(),
  temperature: z.number().optional(),
  contextWindow: z.number().optional(),
});

export type ModelConfig = z.infer<typeof modelConfigSchema>;

// Available models configuration
export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: "gpt-4",
    label: "GPT-4",
    apiIdentifier: "gpt-4",
    description: "Most capable model for complex tasks",
    maxTokens: 8192,
    temperature: 0.7,
    contextWindow: 8192,
  },
  {
    id: "gpt-3.5-turbo",
    label: "GPT-3.5 Turbo",
    apiIdentifier: "gpt-3.5-turbo",
    description: "Fast and efficient for most tasks",
    maxTokens: 4096,
    temperature: 0.7,
    contextWindow: 4096,
  },
] as const;

export class ModelsService {
  private static instance: ModelsService;
  private readonly models: Map<string, ModelConfig>;

  private constructor() {
    this.models = new Map(
      AVAILABLE_MODELS.map(model => [model.id, model])
    );
  }

  public static getInstance(): ModelsService {
    if (!ModelsService.instance) {
      ModelsService.instance = new ModelsService();
    }
    return ModelsService.instance;
  }

  getModel(modelId: string): ModelConfig {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }
    return model;
  }

  getDefaultModel(): ModelConfig {
    return this.getModel('gpt-4');
  }

  getAllModels(): ModelConfig[] {
    return Array.from(this.models.values());
  }

  validateModelConfig(config: unknown): ModelConfig {
    return modelConfigSchema.parse(config);
  }

  isValidModelId(modelId: string): boolean {
    return this.models.has(modelId);
  }
}

// Export singleton instance
export const modelsService = ModelsService.getInstance(); 