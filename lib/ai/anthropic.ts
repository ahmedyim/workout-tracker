import Anthropic from '@anthropic-ai/sdk'

// Runs only on the server, so the key never reaches the browser
export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })