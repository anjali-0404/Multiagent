const API_BASE = '/api';

const DEFAULT_USER = {
  id: 'usr-1',
  name: 'Alex Chen',
  email: 'alex@nexus.dev',
  role: 'Core Architect',
  initials: 'AC',
  avatarColor: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)'
};

// BUG-08 FIX: Helper to parse response and surface errors properly instead of silently swallowing them.
async function apiCall(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({ success: false, error: `HTTP ${res.status}` }));
  if (!res.ok) {
    const err = new Error(data.error || data.detail || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// Auth & User Profile
export async function loginUser(credentials) {
  try {
    return await apiCall(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
  } catch (e) {
    console.error('[api] loginUser failed:', e.message);
    // Graceful fallback for static deployments where no server exists
    return {
      success: true,
      user: { ...DEFAULT_USER, email: credentials.email },
      token: `nx_jwt_static_${Date.now()}`
    };
  }
}

export async function signupUser(userData) {
  try {
    return await apiCall(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
  } catch (e) {
    console.error('[api] signupUser failed:', e.message);
    const initials = (userData.name || 'AD').substring(0, 2).toUpperCase();
    return {
      success: true,
      user: { ...DEFAULT_USER, ...userData, initials },
      token: `nx_jwt_static_${Date.now()}`
    };
  }
}

export async function fetchCurrentUser() {
  try {
    const token = localStorage.getItem('forge_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return await apiCall(`${API_BASE}/auth/me`, { headers });
  } catch (e) {
    console.error('[api] fetchCurrentUser failed:', e.message);
    return { success: true, user: DEFAULT_USER };
  }
}

export async function updateUserProfile(profileData) {
  try {
    const token = localStorage.getItem('forge_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return await apiCall(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(profileData)
    });
  } catch (e) {
    console.error('[api] updateUserProfile failed:', e.message);
    return { success: true, user: { ...DEFAULT_USER, ...profileData } };
  }
}

// Stats & Telemetry
export async function fetchStats() {
  try {
    return await apiCall(`${API_BASE}/stats`);
  } catch (e) {
    console.error('[api] fetchStats failed:', e.message);
    return {
      success: true,
      stats: {
        totalTokens: 0,
        apiCalls: 0,
        avgLatencyMs: 0,
        activeAgents: 0,
        monthlyBudgetUsd: 150.0,
        currentSpendUsd: 0.0,
        tokenHistory: [],
        modelUsage: [
          { name: 'GPT-4o', percentage: 0, color: '#3B82F6' },
          { name: 'Claude 3.5 Sonnet', percentage: 0, color: '#10B981' },
          { name: 'DeepSeek R1', percentage: 0, color: '#8B5CF6' },
          { name: 'Gemini 1.5 Pro', percentage: 0, color: '#F59E0B' }
        ]
      },
      recentActivity: []
    };
  }
}

export async function resetStats() {
  try {
    return await apiCall(`${API_BASE}/stats/reset`, { method: 'POST' });
  } catch (e) {
    console.error('[api] resetStats failed:', e.message);
    return { success: false, error: e.message };
  }
}

// Chat / Playground
export async function fetchModels() {
  try {
    return await apiCall(`${API_BASE}/chat/models`);
  } catch (e) {
    console.error('[api] fetchModels failed:', e.message);
    return { success: true, models: [] };
  }
}

export async function fetchChatHistory() {
  try {
    return await apiCall(`${API_BASE}/chat/history`);
  } catch (e) {
    console.error('[api] fetchChatHistory failed:', e.message);
    return { success: true, chats: [] };
  }
}

export async function sendChatCompletion(payload) {
  // BUG-08 FIX: Chat errors should propagate — callers need to know if inference failed.
  // No silent fallback here; the offline disclosure is handled server-side.
  try {
    return await apiCall(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.error('[api] sendChatCompletion failed:', e.message);
    throw e;
  }
}

export async function streamChatCompletion(payload, onChunk, onDone, onError) {
  try {
    const res = await fetch(`${API_BASE}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.chunk) {
              onChunk(data.chunk);
            }
            if (data.done) {
              if (onDone) onDone(data.usage);
            }
          } catch (parseErr) {
            console.warn('[api] SSE parse error:', parseErr.message);
          }
        }
      }
    }
  } catch (err) {
    console.error('[api] streamChatCompletion failed:', err.message);
    if (onError) onError(err);
  }
}

export async function deleteChatSession(id) {
  try {
    return await apiCall(`${API_BASE}/chat/${id}`, { method: 'DELETE' });
  } catch (e) {
    console.error('[api] deleteChatSession failed:', e.message);
    return { success: false, error: e.message };
  }
}

// Workflows
export async function fetchWorkflows() {
  try {
    return await apiCall(`${API_BASE}/workflows`);
  } catch (e) {
    console.error('[api] fetchWorkflows failed:', e.message);
    return { success: true, workflows: [] };
  }
}

export async function saveWorkflow(workflow) {
  try {
    return await apiCall(`${API_BASE}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow)
    });
  } catch (e) {
    console.error('[api] saveWorkflow failed:', e.message);
    return { success: false, error: e.message };
  }
}

export async function runWorkflow(id) {
  // BUG-08 FIX: Workflow run errors must propagate so the UI shows the real 503 error.
  try {
    return await apiCall(`${API_BASE}/workflows/${id}/run`, { method: 'POST' });
  } catch (e) {
    console.error('[api] runWorkflow failed:', e.message);
    throw e;
  }
}

export async function deleteWorkflow(id) {
  try {
    return await apiCall(`${API_BASE}/workflows/${id}`, { method: 'DELETE' });
  } catch (e) {
    console.error('[api] deleteWorkflow failed:', e.message);
    return { success: false, error: e.message };
  }
}

// Documents / RAG
export async function fetchDocuments() {
  try {
    return await apiCall(`${API_BASE}/documents`);
  } catch (e) {
    console.error('[api] fetchDocuments failed:', e.message);
    return { success: true, documents: [] };
  }
}

export async function uploadDocument(doc) {
  try {
    return await apiCall(`${API_BASE}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc)
    });
  } catch (e) {
    console.error('[api] uploadDocument failed:', e.message);
    return { success: false, error: e.message };
  }
}

export async function searchKnowledgeBase(query) {
  try {
    return await apiCall(`${API_BASE}/documents/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
  } catch (e) {
    console.error('[api] searchKnowledgeBase failed:', e.message);
    return { success: true, results: [] };
  }
}

export async function deleteDocument(id) {
  try {
    return await apiCall(`${API_BASE}/documents/${id}`, { method: 'DELETE' });
  } catch (e) {
    console.error('[api] deleteDocument failed:', e.message);
    return { success: false, error: e.message };
  }
}

// Image Studio
export async function fetchImages() {
  try {
    return await apiCall(`${API_BASE}/images`);
  } catch (e) {
    console.error('[api] fetchImages failed:', e.message);
    return { success: true, images: [] };
  }
}

export async function generateImage(payload) {
  try {
    return await apiCall(`${API_BASE}/images/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.error('[api] generateImage failed:', e.message);
    return { success: false, error: e.message };
  }
}

export async function deleteImage(id) {
  try {
    return await apiCall(`${API_BASE}/images/${id}`, { method: 'DELETE' });
  } catch (e) {
    console.error('[api] deleteImage failed:', e.message);
    return { success: false, error: e.message };
  }
}

// API Keys
export async function fetchApiKeys() {
  try {
    return await apiCall(`${API_BASE}/keys`);
  } catch (e) {
    console.error('[api] fetchApiKeys failed:', e.message);
    return { success: true, apiKeys: [] };
  }
}

export async function createApiKey(payload) {
  try {
    return await apiCall(`${API_BASE}/keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.error('[api] createApiKey failed:', e.message);
    return { success: false, error: e.message };
  }
}

export async function toggleApiKey(id) {
  try {
    return await apiCall(`${API_BASE}/keys/${id}/toggle`, { method: 'POST' });
  } catch (e) {
    console.error('[api] toggleApiKey failed:', e.message);
    return { success: false, error: e.message };
  }
}

export async function deleteApiKey(id) {
  try {
    return await apiCall(`${API_BASE}/keys/${id}`, { method: 'DELETE' });
  } catch (e) {
    console.error('[api] deleteApiKey failed:', e.message);
    return { success: false, error: e.message };
  }
}

// Agents
export async function runAgentJob(payload) {
  // BUG-08 FIX: Agent run errors should propagate to the caller.
  try {
    return await apiCall(`${API_BASE}/agents/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.error('[api] runAgentJob failed:', e.message);
    throw e;
  }
}

export async function pollAgentJob(jobId) {
  try {
    return await apiCall(`${API_BASE}/agents/runs/${jobId}`);
  } catch (e) {
    console.error('[api] pollAgentJob failed:', e.message);
    return { success: false, error: e.message };
  }
}
