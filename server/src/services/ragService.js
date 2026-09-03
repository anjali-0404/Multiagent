// RAG & Vector Search Simulation Service

export function chunkText(text, chunkSize = 250, overlap = 40) {
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
      embeddingDimension: 1536
    });
    i += (chunkSize - overlap);
  }

  return chunks;
}

export function searchVectors(query, documents) {
  const qTerms = query.toLowerCase().split(/\W+/).filter(t => t.length > 2);
  const results = [];

  documents.forEach(doc => {
    const docText = (doc.title + ' ' + (doc.content || '')).toLowerCase();
    let matchScore = 0.45; // baseline relevance

    qTerms.forEach(term => {
      if (docText.includes(term)) {
        matchScore += 0.15;
      }
    });

    matchScore = Math.min(0.98, matchScore + (Math.random() * 0.05));

    results.push({
      documentId: doc.id,
      title: doc.title,
      category: doc.category,
      similarityScore: parseFloat(matchScore.toFixed(3)),
      snippet: doc.content ? doc.content.substring(0, 180) + '...' : 'Relevant indexed knowledge chunk.',
      vectorModel: doc.embeddingsModel || 'text-embedding-3-large'
    });
  });

  return results.sort((a, b) => b.similarityScore - a.similarityScore);
}
