const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Gemini sometimes emits raw control characters AND unescaped internal
// quote characters inside JSON string values (e.g. a resume mentioning
// something in quotes) even with responseSchema set. Both break strict
// JSON.parse. This walks the text once: control characters inside a
// string always get escaped; a `"` inside a string is only treated as
// the REAL closing quote if the next non-whitespace character is a JSON
// structural character (, : } ] or end of text) - otherwise it's a
// stray internal quote and gets escaped instead of closing the string.
function sanitizeJsonText(text) {
  let result = '';
  let inString = false;
  const n = text.length;
  let i = 0;
  while (i < n) {
    const ch = text[i];
    if (!inString) {
      result += ch;
      if (ch === '"') inString = true;
      i++;
      continue;
    }
    if (ch === '\\') {
      result += ch + (text[i + 1] ?? '');
      i += 2;
      continue;
    }
    if (ch === '\n') { result += '\\n'; i++; continue; }
    if (ch === '\r') { result += '\\r'; i++; continue; }
    if (ch === '\t') { result += '\\t'; i++; continue; }
    if (ch === '"') {
      let j = i + 1;
      while (j < n && /\s/.test(text[j])) j++;
      const next = text[j];
      const isRealClose = next === undefined || ',:}]'.includes(next);
      if (isRealClose) {
        result += '"';
        inString = false;
      } else {
        result += '\\"';
      }
      i++;
      continue;
    }
    result += ch;
    i++;
  }
  return result;
}

export async function askGemini({ system, user, temperature = 0.4, maxTokens = 700, responseSchema = null }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error('GEMINI_API_KEY is not configured');
    err.code = 'NO_API_KEY';
    throw err;
  }
  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;
  const generationConfig = {
    temperature,
    maxOutputTokens: maxTokens,
    // Gemini 2.5/3 Flash models think by default, and those thinking
    // tokens are drawn from the SAME maxOutputTokens budget as the actual
    // answer - with a modest budget like 600, the model can burn the
    // whole thing on internal reasoning and return nothing visible.
    // Setting thinkingBudget to 0 disables (or minimizes, on models that
    // don't support a full off-switch) that hidden token spend.
    thinkingConfig: { thinkingBudget: 0 }
  };
  if (responseSchema) {
    generationConfig.responseMimeType = 'application/json';
    generationConfig.responseSchema = responseSchema;
  }
  const body = { contents: [{ role: 'user', parts: [{ text: user }] }], generationConfig };
  if (system) body.systemInstruction = { parts: [{ text: system }] };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`Gemini API error ${res.status}: ${text.slice(0, 300)}`);
    err.code = 'GEMINI_HTTP_ERROR';
    throw err;
  }

  const data = await res.json();
  const finishReason = data.candidates?.[0]?.finishReason;
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!content) {
    const err = new Error('Gemini returned an empty response');
    err.code = 'EMPTY_RESPONSE';
    throw err;
  }
  if (finishReason === 'MAX_TOKENS') {
    const err = new Error('Gemini response was cut off (hit maxTokens) - increase maxTokens for this call');
    err.code = 'TRUNCATED';
    throw err;
  }

  if (!responseSchema) return content;

  try {
    return JSON.parse(content);
  } catch (firstErr) {
    // Fallback: try again after repairing likely quote/control-char issues.
    try {
      return JSON.parse(sanitizeJsonText(content));
    } catch (secondErr) {
      const err = new Error(`Gemini returned invalid JSON even after repair attempt: ${secondErr.message}`);
      err.code = 'BAD_JSON';
      throw err;
    }
  }
}