import OpenAI from 'openai';

import { env } from '../../config/env';
import { logger } from '../../logger';
import { ApiError } from '../../utils/ApiError';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!env.grokApiKey) {
    throw ApiError.badRequest('AI summarization is not configured on this server');
  }
  if (!client) {
    client = new OpenAI({ apiKey: env.grokApiKey, baseURL: env.grokBaseUrl });
  }
  return client;
}

const SYSTEM_PROMPT =
  'You summarize personal notes into 1-2 concise sentences that capture the key point and any concrete next steps. Respond with only the summary text - no headings, quotes, or commentary.';

const MAX_INPUT_CHARS = 8000;

export async function summarizeText(text: string, client: OpenAI = getClient()): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw ApiError.badRequest('This note has no content to summarize');
  }

  try {
    const response = await client.chat.completions.create({
      model: env.grokModel,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: trimmed.slice(0, MAX_INPUT_CHARS) },
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    const summary = response.choices[0]?.message?.content?.trim();
    if (!summary) {
      throw new Error('Empty response from the AI provider');
    }
    return summary;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    logger.error({ err }, 'Grok summarization request failed');
    throw ApiError.internal('Could not generate a summary right now. Please try again.');
  }
}
