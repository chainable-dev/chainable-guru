export interface FunctionCall {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required: string[];
  };
}

export const createFunctionCall = (
  name: string,
  description: string,
  parameters: Record<string, {
    type: string;
    description: string;
    enum?: string[];
    required?: boolean;
  }>
): FunctionCall => ({
  name,
  description,
  parameters: {
    type: 'object',
    properties: parameters,
    required: Object.entries(parameters)
      .filter(([_, value]) => value.required)
      .map(([key]) => key)
  }
}); 