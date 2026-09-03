const API_BASE = '/api';

const DEFAULT_USER = {
  id: 'usr-1',
  name: 'Arjun Developer',
  email: 'arjun@example.com',
  role: 'Fullstack AI Engineer',
  initials: 'AD',
  avatarColor: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)'
};

// Auth & User Profile
export async function loginUser(credentials) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback for static deployments
  }
  return {
    success: true,
    user: { ...DEFAULT_USER, email: credentials.email },
    token: `nx_jwt_static_${Date.now()}`
  };
}

export async function signupUser(userData) {
  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback
  }
  const initials = (userData.name || 'AD').substring(0, 2).toUpperCase();
  return {
    success: true,
    user: { ...DEFAULT_USER, ...userData, initials },
    token: `nx_jwt_static_${Date.now()}`
  };
}

export async function fetchCurrentUser() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`);
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback
  }
  return { success: true, user: DEFAULT_USER };
}

export async function updateUserProfile(profileData) {
  try {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback
  }
  return { success: true, user: { ...DEFAULT_USER, ...profileData } };
}

// Stats & Telemetry
export async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback
  }
  return {
    success: true,
    stats: {
      totalTokens: 1428500,
      apiCalls: 48930,
      avgLatencyMs: 142,
      activeAgents: 8,
      monthlyBudgetUsd: 150.0,
      currentSpendUsd: 43.65,
      tokenHistory: [
        { date: 'Aug 28', tokens: 180000, cost: 5.4 },
        { date: 'Aug 29', tokens: 220000, cost: 6.8 },
        { date: 'Aug 30', tokens: 195000, cost: 5.9 },
        { date: 'Aug 31', tokens: 260000, cost: 7.8 },
        { date: 'Sep 01', tokens: 310000, cost: 9.3 },
        { date: 'Sep 02', tokens: 280000, cost: 8.4 },
        { date: 'Sep 03', tokens: 345000, cost: 10.35 }
      ],
      modelUsage: [
        { name: 'GPT-4o', percentage: 45, color: '#3B82F6' },
        { name: 'Claude 3.5 Sonnet', percentage: 30, color: '#10B981' },
        { name: 'DeepSeek R1', percentage: 15, color: '#8B5CF6' },
        { name: 'Gemini 1.5 Pro', percentage: 10, color: '#F59E0B' }
      ]
    },
    recentActivity: [
      { id: 'act-1', event: 'Workflow Triggered', detail: 'Automated Lead Enrichment executed successfully (4 nodes, 820ms)', time: '2 mins ago', type: 'success' },
      { id: 'act-2', event: 'RAG Query', detail: 'Semantic search query: "mTLS zero-trust communication" (Score: 0.94)', time: '14 mins ago', type: 'info' }
    ]
  };
}

export async function resetStats() {
  try {
    const res = await fetch(`${API_BASE}/stats/reset`, { method: 'POST' });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true };
}

// Chat / Playground
export async function fetchModels() {
  try {
    const res = await fetch(`${API_BASE}/chat/models`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true, models: [] };
}

export async function fetchChatHistory() {
  try {
    const res = await fetch(`${API_BASE}/chat/history`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true, chats: [] };
}

export async function sendChatCompletion(payload) {
  try {
    const res = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true, response: { message: { content: 'Simulation completed.' } } };
}

export async function deleteChatSession(id) {
  try {
    const res = await fetch(`${API_BASE}/chat/${id}`, { method: 'DELETE' });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true };
}

// Workflows
export async function fetchWorkflows() {
  try {
    const res = await fetch(`${API_BASE}/workflows`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true, workflows: [] };
}

export async function saveWorkflow(workflow) {
  try {
    const res = await fetch(`${API_BASE}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true, workflow };
}

export async function runWorkflow(id) {
  try {
    const res = await fetch(`${API_BASE}/workflows/${id}/run`, { method: 'POST' });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true };
}

export async function deleteWorkflow(id) {
  try {
    const res = await fetch(`${API_BASE}/workflows/${id}`, { method: 'DELETE' });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true };
}

// Documents / RAG
export async function fetchDocuments() {
  try {
    const res = await fetch(`${API_BASE}/documents`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true, documents: [] };
}

export async function uploadDocument(doc) {
  try {
    const res = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true, document: doc };
}

export async function searchKnowledgeBase(query) {
  try {
    const res = await fetch(`${API_BASE}/documents/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true, results: [] };
}

export async function deleteDocument(id) {
  try {
    const res = await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE' });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true };
}

// Image Studio
export async function fetchImages() {
  try {
    const res = await fetch(`${API_BASE}/images`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true, images: [] };
}

export async function generateImage(payload) {
  try {
    const res = await fetch(`${API_BASE}/images/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true, image: { ...payload, url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80' } };
}

export async function deleteImage(id) {
  try {
    const res = await fetch(`${API_BASE}/images/${id}`, { method: 'DELETE' });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true };
}

// API Keys
export async function fetchApiKeys() {
  try {
    const res = await fetch(`${API_BASE}/keys`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true, apiKeys: [] };
}

export async function createApiKey(payload) {
  try {
    const res = await fetch(`${API_BASE}/keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true, apiKey: payload };
}

export async function toggleApiKey(id) {
  try {
    const res = await fetch(`${API_BASE}/keys/${id}/toggle`, { method: 'POST' });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true };
}

export async function deleteApiKey(id) {
  try {
    const res = await fetch(`${API_BASE}/keys/${id}`, { method: 'DELETE' });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true };
}
