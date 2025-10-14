/**
 * OpenRouter API Integration
 * Provides AI services through OpenRouter API
 */

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[testing] OpenRouter API key not found. Set VITE_OPENROUTER_API_KEY environment variable.');
    }
  }

  /**
   * Generate chat completion using OpenRouter API
   */
  async chatCompletion(
    messages: OpenRouterMessage[],
    model: string = 'openai/gpt-3.5-turbo',
    options: {
      temperature?: number;
      max_tokens?: number;
      top_p?: number;
    } = {}
  ): Promise<OpenRouterResponse> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is required');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'GO SG Website'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000,
        top_p: options.top_p || 1,
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Get available models from OpenRouter
   */
  async getModels(): Promise<any[]> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is required');
    }

    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  }
}

// Export singleton instance
export const openRouterClient = new OpenRouterClient();
