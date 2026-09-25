// AI Service: Proxies inference to Python FastAPI AI service with local simulation fallback

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || 'forge_dev_secret_key_12345';

const MODEL_PROFILES = {
  'GPT-4o': {
    company: 'OpenAI',
    contextWindow: 128000,
    speed: 'Fast (85 t/s)',
    specialty: 'Multimodal reasoning & agent orchestration',
    pricing: '$0.005 / 1k'
  },
  'Claude 3.5 Sonnet': {
    company: 'Anthropic',
    contextWindow: 200000,
    speed: 'Ultra-Fast (110 t/s)',
    specialty: 'Complex coding, nuanced tone, artifact generation',
    pricing: '$0.003 / 1k'
  },
  'DeepSeek R1': {
    company: 'DeepSeek',
    contextWindow: 64000,
    speed: 'Moderate (45 t/s)',
    specialty: 'Chain-of-thought mathematical & logical reasoning',
    pricing: '$0.001 / 1k'
  },
  'Gemini 1.5 Pro': {
    company: 'Google DeepMind',
    contextWindow: 2000000,
    speed: 'Fast (90 t/s)',
    specialty: 'Massive context ingestion & cross-modal synthesis',
    pricing: '$0.0035 / 1k'
  }
};

export async function generateChatResponse({ model = 'GPT-4o', messages = [], systemPrompt = '', temperature = 0.7, maxTokens = 1024 }) {
  // 1. Attempt to proxy to FastAPI Python service
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(`${AI_SERVICE_URL}/infer/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': INTERNAL_SERVICE_SECRET
      },
      body: JSON.stringify({
        model,
        messages,
        systemPrompt,
        temperature,
        maxTokens
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return data;
    }
    console.warn(`[AI Service Proxy] FastAPI returned status ${res.status}. Falling back to simulation.`);
  } catch (err) {
    console.warn(`[AI Service Proxy] Could not reach AI service at ${AI_SERVICE_URL} (${err.message}). Using local fallback.`);
  }

  // 2. Graceful Fallback to Local Simulation if Python service is offline
  return generateLocalFallbackResponse({ model, messages, systemPrompt, temperature, maxTokens });
}

function generateLocalFallbackResponse({ model, messages }) {
  // Honest offline disclosure — no inference was performed.
  // Fabricating plausible-looking answers (hallucination) is intentionally avoided here.
  const PROVIDER_MAP = {
    'GPT-4o':           { envVar: 'OPENAI_API_KEY',    provider: 'OpenAI' },
    'Claude 3.5 Sonnet':{ envVar: 'ANTHROPIC_API_KEY', provider: 'Anthropic' },
    'DeepSeek R1':      { envVar: 'DEEPSEEK_API_KEY',  provider: 'DeepSeek' },
    'Gemini 1.5 Pro':   { envVar: 'GEMINI_API_KEY',    provider: 'Google' },
  };
  const { envVar = 'OPENAI_API_KEY', provider = 'the provider' } = PROVIDER_MAP[model] || {};

  const userWords = messages.filter(m => m.role === 'user').map(m => m.content).join(' ').split(/\s+/);
  const inputTokens = Math.max(1, userWords.length);

  const responseText =
    `⚠️ **Offline / Demo Mode — no real inference was performed.**\n\n` +
    `The **${model}** model requires a valid \`${envVar}\` key to be configured on the server.\n\n` +
    `**To enable live responses:**\n` +
    `1. Obtain an API key from ${provider}.\n` +
    `2. Add it to \`ai/.env\`: \`${envVar}=<your-key>\`\n` +
    `3. Restart the Python AI service (\`python ai/run.py\`).\n\n` +
    `Your message has **not** been answered. This placeholder is shown so the UI remains functional while the service is unconfigured.`;

  const outputTokens = Math.max(1, Math.ceil(responseText.length / 4));

  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: responseText,
    model,
    usage: {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
    },
    meta: {
      finishReason: 'offline',
      latencyMs: 0,
      costUsd: 0,
    },
  };
}

export { MODEL_PROFILES };
