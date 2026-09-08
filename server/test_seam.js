import dotenv from 'dotenv';
dotenv.config();

import { generateChatResponse } from './src/services/aiService.js';
import { searchVectors, chunkText } from './src/services/ragService.js';

async function runTests() {
  console.log('Testing AI Service proxy & fallback...');
  const chatRes = await generateChatResponse({
    model: 'GPT-4o',
    messages: [{ role: 'user', content: 'Design an automated agent workflow.' }]
  });

  console.log('Chat response received:');
  console.log('- Role:', chatRes.role);
  console.log('- Total tokens:', chatRes.usage.totalTokens);
  console.log('- Latency:', chatRes.meta.latencyMs, 'ms');
  if (typeof chatRes.usage.totalTokens !== 'number' || isNaN(chatRes.usage.totalTokens)) {
    throw new Error('FAILED: chatRes.usage.totalTokens is NaN or not a number!');
  }

  console.log('\nTesting RAG Service proxy & fallback...');
  const docs = [
    { id: 'doc-1', title: 'Security Architecture', category: 'Security', content: 'mTLS encryption and zero-trust' }
  ];
  const searchResults = await searchVectors('mTLS security', docs);
  console.log('Search returned', searchResults.length, 'results:');
  console.log('- Top match:', searchResults[0].title, '(score:', searchResults[0].similarityScore, ')');
  if (!searchResults[0].similarityScore || !searchResults[0].documentId) {
    throw new Error('FAILED: Search result missing required contract fields!');
  }

  const chunks = await chunkText('This is a test document with several words for chunking.');
  console.log('Chunk count:', chunks.length);
  if (chunks.length < 1) {
    throw new Error('FAILED: chunkText returned empty array!');
  }

  console.log('\nALL NODE SEAM TESTS PASSED! Local fallback & contract parity verified.');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
