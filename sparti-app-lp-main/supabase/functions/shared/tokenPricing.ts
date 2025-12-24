// AI Model pricing configuration (per 1K tokens)
export const MODEL_PRICING = {
  // OpenAI Models
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  
  // Claude Models (via OpenRouter)
  'anthropic/claude-3.5-sonnet': { input: 0.003, output: 0.015 },
  'anthropic/claude-3-haiku': { input: 0.00025, output: 0.00125 },
  'anthropic/claude-3-opus': { input: 0.015, output: 0.075 },
  
  // Google Models
  'google/gemini-pro': { input: 0.0005, output: 0.0015 },
  'google/gemini-pro-vision': { input: 0.0005, output: 0.0015 },
  
  // Meta Models
  'meta-llama/llama-3.1-70b-instruct': { input: 0.0008, output: 0.0008 },
  'meta-llama/llama-3.1-8b-instruct': { input: 0.0002, output: 0.0002 },
  
  // Mistral Models
  'mistralai/mixtral-8x7b-instruct': { input: 0.00027, output: 0.00027 },
  'mistralai/mistral-7b-instruct': { input: 0.0002, output: 0.0002 },
  
  // Cohere Models
  'cohere/command-r-plus': { input: 0.003, output: 0.015 },
  'cohere/command-r': { input: 0.0005, output: 0.0015 },
  
  // Default fallback pricing
  'default': { input: 0.001, output: 0.002 }
};

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface CostCalculation {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  pricing: { input: number; output: number };
}

/**
 * Get pricing for a specific model
 */
export function getModelPricing(model: string): { input: number; output: number } {
  return (MODEL_PRICING as Record<string, { input: number; output: number }>)[model] || MODEL_PRICING['default'];
}

/**
 * Calculate token costs based on usage and model
 */
export function calculateTokenCost(
  usage: TokenUsage,
  model: string,
  multiplier: number = 1
): CostCalculation {
  const pricing = getModelPricing(model);
  
  const inputCost = (usage.promptTokens / 1000) * pricing.input * multiplier;
  const outputCost = (usage.completionTokens / 1000) * pricing.output * multiplier;
  const totalCost = inputCost + outputCost;
  
  return {
    inputCost,
    outputCost,
    totalCost,
    pricing
  };
}

/**
 * Extract token usage from OpenAI API response
 */
export function extractTokenUsage(apiResponse: any): TokenUsage {
  const usage = apiResponse.usage || {};
  return {
    promptTokens: usage.prompt_tokens || 0,
    completionTokens: usage.completion_tokens || 0,
    totalTokens: usage.total_tokens || 0
  };
}

/**
 * Format cost for logging
 */
export function formatCostLog(cost: CostCalculation, usage: TokenUsage, model: string): string {
  return `💰 Model: ${model} | Tokens: ${usage.totalTokens} (${usage.promptTokens} prompt + ${usage.completionTokens} completion) | Cost: $${cost.totalCost.toFixed(6)}`;
}
