import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Initialize Anthropic client
const getAnthropicClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
  }
  return new Anthropic({ apiKey });
};

// AI Assistant chat endpoint
router.post('/ai-assistant/chat', authenticateUser, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a non-empty string'
      });
    }

    const anthropic = getAnthropicClient();

    // Build messages array for Claude API
    // Claude expects messages in a specific format: [{ role: 'user'|'assistant', content: string }]
    const messages = conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Add the current user message
    messages.push({
      role: 'user',
      content: message
    });

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', // Using latest Claude 3.5 Sonnet
      max_tokens: 1024,
      messages: messages,
      system: 'You are a helpful AI assistant integrated into a CMS (Content Management System) visual editor. Help users with content creation, editing, and provide guidance on using the CMS features. Be concise, helpful, and professional.'
    });

    // Extract the assistant's response
    const assistantMessage = response.content[0].text;

    res.json({
      success: true,
      message: assistantMessage,
      usage: response.usage
    });

  } catch (error) {
    console.error('[testing] AI Assistant API Error:', error);
    
    // Handle specific Anthropic API errors
    if (error.status === 401) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Anthropic API key'
      });
    }
    
    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to get AI response',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

export default router;

