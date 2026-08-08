// Deprecated - the app switched from Groq to OpenAI. Kept only as a
// re-export so nothing breaks if something still imports this path;
// services/openaiClient.js is the real transport now. Safe to delete.
export { askOpenAI as askGroq } from './openaiClient.js';
