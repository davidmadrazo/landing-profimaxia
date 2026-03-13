import { createOpenAI } from '@ai-sdk/openai'

export const openrouter = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export const MODELS = {
  fast: 'gpt-4o-mini',
  balanced: 'gpt-4o-mini',
  powerful: 'gpt-4o',
} as const

export type ModelKey = keyof typeof MODELS
