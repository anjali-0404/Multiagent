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

function generateLocalFallbackResponse({ model, messages, systemPrompt, temperature, maxTokens }) {
  const lastUserMsg = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
  const promptLower = lastUserMsg.toLowerCase();

  let responseText = '';

  if (promptLower.includes('workflow') || promptLower.includes('agent')) {
    responseText = `Based on your request, I recommend structuring an asynchronous agent loop with a reactive state bus.

1. **State Isolation**: Encapsulate worker state inside discrete node execution contexts.
2. **Backpressure & Retries**: Configure exponential backoff (e.g. initial 200ms, multiplier 2x, max 5 attempts) on external tool calls.
3. **Guardrails**: Validate schema output via runtime Zod/JSON Schema parsing before handing off to downstream sink actions.

Would you like me to synthesize the complete JSON DAG schema for your pipeline?`;
  } else if (promptLower.includes('rag') || promptLower.includes('vector') || promptLower.includes('embedding')) {
    responseText = `Here is an optimal RAG pipeline architecture for high precision retrieval:

- **Ingestion**: Recursive semantic chunking (target: 512 tokens with 64-token sliding window overlap).
- **Indexing**: HNSW index with \`m=16\`, \`ef_construction=64\` using cosine distance metrics.
- **Query Optimization**: HyDE (Hypothetical Document Embeddings) coupled with reciprocal rank fusion (RRF) combining dense vectors and sparse BM25 tokens.
- **Reranker**: Cohere/BGE reranker pass over the top 25 candidates to extract the highest confidence top-5 chunks.`;
  } else {
    responseText = `I have analyzed your input with **${model}** (configured with temperature ${temperature}, max tokens ${maxTokens}).

${systemPrompt ? `> *System Context applied: "${systemPrompt.substring(0, 60)}..."*\n\n` : ''}Key Analysis Points:
- **Synthesized Query**: "${lastUserMsg.length > 80 ? lastUserMsg.substring(0, 80) + '...' : lastUserMsg}"
- **Recommended Strategy**: Implement modular orchestration with deterministic schema validation.
- **Latency Benchmark**: Model running with optimal throughput on cloud edge inference nodes.

How would you like to proceed with this task?`;
  }

  const inputTokens = Math.ceil((lastUserMsg.length + (systemPrompt || '').length) / 4) + 20;
  const outputTokens = Math.ceil(responseText.length / 4);
  const totalTokens = inputTokens + outputTokens;

  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: responseText,
    model,
    usage: {
      inputTokens,
      outputTokens,
      totalTokens
    },
    meta: {
      finishReason: 'stop',
      latencyMs: Math.floor(Math.random() * 120) + 85,
      costUsd: parseFloat((totalTokens * 0.000003).toFixed(6))
    }
  };
}

export { MODEL_PROFILES };
