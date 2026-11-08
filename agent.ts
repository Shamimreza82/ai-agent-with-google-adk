
import {LlmAgent, GOOGLE_SEARCH} from '@google/adk';

export const rootAgent = new LlmAgent({
  name: 'search_assistant',
  description: 'An assistant that can search the web.',
  model: 'gemini-3.5-flash-lite',
  instruction:
    'You are a helpful assistant. Answer user questions using Google Search when needed.',
  tools: [GOOGLE_SEARCH],
});