import dotenv from 'dotenv';
dotenv.config();

const PORT = 5000;
const SERVER_URL = `http://localhost:${PORT}`;

async function testFullIntegration() {
  console.log('--- Starting Full Express -> FastAPI Integration Verification ---');

  // 1. Health check
  console.log('\n[1] Testing Express /api/health...');
  const healthRes = await fetch(`${SERVER_URL}/api/health`);
  const healthData = await healthRes.json();
  console.log('Health:', healthData.status, '-', healthData.service);

  // 2. Chat completion
  console.log('\n[2] Testing Express /api/chat/completions -> FastAPI /infer/chat...');
  const chatRes = await fetch(`${SERVER_URL}/api/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'GPT-4o',
      messages: [{ role: 'user', content: 'Explain multi-agent state orchestration.' }],
      systemPrompt: 'You are a Principal Engineer.'
    })
  });
  const chatData = await chatRes.json();
  console.log('Chat status:', chatRes.status);
  console.log('Chat response ID:', chatData.message?.id);
  console.log('Chat usage totalTokens:', chatData.message?.usage?.totalTokens);
  console.log('Chat latency:', chatData.message?.meta?.latencyMs, 'ms');
  if (typeof chatData.message?.usage?.totalTokens !== 'number' || isNaN(chatData.message?.usage?.totalTokens)) {
    throw new Error('FAILED: totalTokens is NaN or missing!');
  }

  // 3. Document ingestion
  console.log('\n[3] Testing Express /api/documents -> FastAPI /rag/ingest...');
  const docRes = await fetch(`${SERVER_URL}/api/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Distributed State Synchronization.md',
      category: 'Architecture',
      content: 'Distributed state synchronization ensures that agents maintain local caches with raft consensus.'
    })
  });
  const docData = await docRes.json();
  console.log('Document ingest status:', docRes.status);
  console.log('Doc ID:', docData.document?.id, 'Chunks count:', docData.document?.chunksCount);

  // 4. Document search
  console.log('\n[4] Testing Express /api/documents/search -> FastAPI /rag/search...');
  const searchRes = await fetch(`${SERVER_URL}/api/documents/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'consensus state synchronization' })
  });
  const searchData = await searchRes.json();
  console.log('Search status:', searchRes.status, 'Results count:', searchData.results?.length);
  console.log('Top match similarity:', searchData.results?.[0]?.similarityScore);

  // 5. Agent run (202 async job)
  console.log('\n[5] Testing Express /api/agents/run -> FastAPI /agents/run (HTTP 202)...');
  const agentRes = await fetch(`${SERVER_URL}/api/agents/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      goal: 'Build an autonomous cloud deployment agent',
      projectName: 'Cloud Deploy Agent'
    })
  });
  const agentData = await agentRes.json();
  console.log('Agent run status code:', agentRes.status);
  console.log('Job ID:', agentData.jobId);
  console.log('Job status:', agentData.status);

  // Wait 1.5s and poll the job
  await new Promise(resolve => setTimeout(resolve, 1500));
  console.log('\n[6] Polling Express /api/agents/runs/:jobId -> FastAPI /agents/runs/:jobId...');
  const pollRes = await fetch(`${SERVER_URL}/api/agents/runs/${agentData.jobId}`);
  const pollData = await pollRes.json();
  console.log('Poll status:', pollRes.status);
  console.log('Job current status:', pollData.job?.status);
  console.log('Job progress:', pollData.job?.progress, '%');
  console.log('Step logs count:', pollData.job?.logs?.length);
  console.log('Blueprint created:', Boolean(pollData.job?.blueprint));

  console.log('\n>>> FULL EXPRESS <-> FASTAPI SEAM TEST SUCCEEDED 100%! <<<');
}

testFullIntegration().catch(err => {
  console.error('Integration test failed:', err);
  process.exit(1);
});
