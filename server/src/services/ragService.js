// RAG & Vector Search Service: Proxies to Python FastAPI with local fallback

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || 'forge_dev_secret_key_12345';

export async function chunkText(text, chunkSize = 250, overlap = 40, title = 'Document', category = 'General') {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${AI_SERVICE_URL}/rag/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': INTERNAL_SERVICE_SECRET
      },
      body: JSON.stringify({ title, category, content: text, chunkSize, overlap }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.chunksSample && data.chunksSample.length > 0) {
        return data.chunksSample;
      }
    }
  } catch (err) {
    // Fallback to local simulation
  }

  return localChunkText(text, chunkSize, overlap);
}

export function localChunkText(text, chunkSize = 250, overlap = 40) {
  const words = text.split(/\s+/);
  const chunks = [];
  let i = 0;
  let chunkIndex = 0;

  while (i < words.length) {
    const chunkWords = words.slice(i, i + chunkSize);
    chunks.push({
      chunkId: `chk-${Date.now()}-${chunkIndex++}`,
      text: chunkWords.join(' '),
      tokenCount: Math.ceil(chunkWords.join(' ').length / 4),
      // BUG-03 FIX: actual Python forge-hash-v1 produces 384-dim vectors, not 1536
      embeddingDimension: 384
    });
    i += (chunkSize - overlap);
  }

  return chunks;
}

export async function searchVectors(query, documents) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${AI_SERVICE_URL}/rag/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': INTERNAL_SERVICE_SECRET
      },
      body: JSON.stringify({ query }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results;
      }
    }
  } catch (err) {
    console.error('[RAG] searchVectors proxy error:', err.message);
  }

  return localSearchVectors(query, documents);
}

export function localSearchVectors(query, documents) {
  // BUG-03 FIX: Deterministic TF-style scoring — no Math.random().
  // Score = base 0.30 + 0.12 per matching term, capped at 0.94.
  const qTerms = query.toLowerCase().split(/\W+/).filter(t => t.length > 2);
  const results = [];

  documents.forEach(doc => {
    const docText = (doc.title + ' ' + (doc.content || '')).toLowerCase();
    let matchScore = 0.30;

    qTerms.forEach(term => {
      if (docText.includes(term)) {
        matchScore += 0.12;
      }
    });

    matchScore = Math.min(0.94, matchScore);

    results.push({
      documentId: doc.id,
      title: doc.title,
      category: doc.category,
      similarityScore: parseFloat(matchScore.toFixed(3)),
      snippet: doc.content ? doc.content.substring(0, 180) + '...' : 'Relevant indexed knowledge chunk.',
      // BUG-03 FIX: honest model label — local TF keyword match, not text-embedding-3-large
      vectorModel: doc.embeddingsModel || 'local-keyword-match'
    });
  });

  return results.sort((a, b) => b.similarityScore - a.similarityScore);
}
