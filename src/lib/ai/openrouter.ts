import { createOpenAI } from '@ai-sdk/openai'

export const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? 'https://profimaxia.com',
    'X-Title': 'landing-profimaxia',
  },
})

export const MODELS = {
  fast: 'anthropic/claude-haiku-4.5',
  balanced: 'anthropic/claude-haiku-4.5',
  powerful: 'anthropic/claude-sonnet-4.6',
} as const

export type ModelKey = keyof typeof MODELS
