// OpenRouter se baat karne ki ek hi jagah. Poora project AI isi file se bulayega.
//
// IMPORTANT (interview me ye bolna):
// LLM kabhi galat format me jawab deta hai (markdown, extra text, adhoora JSON).
// Isliye 3 layer ki suraksha hai:
//   1. Prompt me bolte hain "sirf JSON do"
//   2. Jawab me se JSON nikalte hain (code fences hata ke)
//   3. Zod se shape check karte hain. Galat nikla to dobara try (max 3 baar)

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_ATTEMPTS = 3;

// Model kabhi ```json ... ``` ke andar ya extra baatein likh ke jawab deta hai.
// Pehle '{' se aakhri '}' tak ka hissa nikalte hain.
function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('No JSON found in AI reply');
  }
  return JSON.parse(text.slice(start, end + 1));
}

async function callModel(messages) {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'openrouter/free',
      messages,
      temperature: 0.7,
    }),
    // Free models kabhi bahut slow hote hain, isliye 45 second baad haar maan lo
    signal: AbortSignal.timeout(45000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty reply from AI');
  return content;
}

// system = AI ko role batata hai, user = asli kaam, schema = Zod schema jo reply ka shape check karega
async function askJSON({ system, user, schema }) {
  const messages = [
    {
      role: 'system',
      content: `${system}\n\nReply with ONE valid JSON object only. No markdown, no text outside the JSON.`,
    },
    { role: 'user', content: user },
  ];

  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const text = await callModel(messages);
      const json = extractJson(text);
      return schema.parse(json); // shape galat hua to yahin error, aur loop dobara try karega
    } catch (err) {
      lastError = err;
      console.warn(`AI attempt ${attempt} failed: ${err.message}`);
    }
  }
  throw new Error(`AI failed after ${MAX_ATTEMPTS} attempts: ${lastError.message}`);
}

module.exports = { askJSON };