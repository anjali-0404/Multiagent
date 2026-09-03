const API_BASE = '/api';

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  return res.json();
}

export async function resetStats() {
  const res = await fetch(`${API_BASE}/stats/reset`, { method: 'POST' });
  return res.json();
}

// Chat / Playground
export async function fetchModels() {
  const res = await fetch(`${API_BASE}/chat/models`);
  return res.json();
}

export async function fetchChatHistory() {
  const res = await fetch(`${API_BASE}/chat/history`);
  return res.json();
}

export async function sendChatCompletion(payload) {
  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function deleteChatSession(id) {
  const res = await fetch(`${API_BASE}/chat/${id}`, { method: 'DELETE' });
  return res.json();
}

// Workflows
export async function fetchWorkflows() {
  const res = await fetch(`${API_BASE}/workflows`);
  return res.json();
}

export async function saveWorkflow(workflow) {
  const res = await fetch(`${API_BASE}/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow)
  });
  return res.json();
}

export async function runWorkflow(id) {
  const res = await fetch(`${API_BASE}/workflows/${id}/run`, {
    method: 'POST'
  });
  return res.json();
}

export async function deleteWorkflow(id) {
  const res = await fetch(`${API_BASE}/workflows/${id}`, { method: 'DELETE' });
  return res.json();
}

// Documents / RAG
export async function fetchDocuments() {
  const res = await fetch(`${API_BASE}/documents`);
  return res.json();
}

export async function uploadDocument(doc) {
  const res = await fetch(`${API_BASE}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc)
  });
  return res.json();
}

export async function searchKnowledgeBase(query) {
  const res = await fetch(`${API_BASE}/documents/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  return res.json();
}

export async function deleteDocument(id) {
  const res = await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE' });
  return res.json();
}

// Image Studio
export async function fetchImages() {
  const res = await fetch(`${API_BASE}/images`);
  return res.json();
}

export async function generateImage(payload) {
  const res = await fetch(`${API_BASE}/images/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function deleteImage(id) {
  const res = await fetch(`${API_BASE}/images/${id}`, { method: 'DELETE' });
  return res.json();
}

// API Keys
export async function fetchApiKeys() {
  const res = await fetch(`${API_BASE}/keys`);
  return res.json();
}

export async function createApiKey(payload) {
  const res = await fetch(`${API_BASE}/keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function toggleApiKey(id) {
  const res = await fetch(`${API_BASE}/keys/${id}/toggle`, { method: 'POST' });
  return res.json();
}

export async function deleteApiKey(id) {
  const res = await fetch(`${API_BASE}/keys/${id}`, { method: 'DELETE' });
  return res.json();
}
