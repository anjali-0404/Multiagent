import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../../data/db.json');

const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const initialData = {
  users: [
    {
      id: 'usr-1',
      name: 'Alex Chen',
      email: 'alex@nexus.dev',
      role: 'Core Architect',
      password: 'password123',
      initials: 'AC',
      avatarColor: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
      createdAt: '2026-08-01T00:00:00Z'
    }
  ],
  stats: {
    totalTokens: 1428500,
    apiCalls: 48920,
    avgLatencyMs: 142,
    activeAgents: 12,
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
  chats: [
    {
      id: 'chat-1',
      title: 'Neural Net Architecture Optimizer',
      model: 'GPT-4o',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      messages: [
        { role: 'user', content: 'How do I optimize learning rate warmup with AdamW?' },
        { role: 'assistant', content: 'Using a linear warmup for the first 10% of total training steps followed by a cosine annealing decay schedule is the modern standard for transformer architectures. It prevents early instability when gradients have high variance.' }
      ]
    },
    {
      id: 'chat-2',
      title: 'RAG Chunking Strategy Comparison',
      model: 'Claude 3.5 Sonnet',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      messages: [
        { role: 'user', content: 'What is semantic window chunking?' },
        { role: 'assistant', content: 'Semantic window chunking splits text based on sentence embeddings or heading boundaries rather than fixed token lengths, attaching surrounding buffer sentences to preserve contextual co-references during vector retrieval.' }
      ]
    }
  ],
  workflows: [
    {
      id: 'wf-1',
      name: 'Automated Lead Enrichment & Scoring',
      status: 'active',
      trigger: 'Webhook Ingestion',
      lastRun: '5 mins ago',
      nodes: [
        { id: 'node-1', type: 'trigger', label: 'Incoming CRM Webhook', icon: 'Webhook', status: 'ready' },
        { id: 'node-2', type: 'rag', label: 'Company Knowledge Match', icon: 'Database', status: 'ready' },
        { id: 'node-3', type: 'llm', label: 'Lead Scoring Agent (Claude 3.5)', icon: 'BrainCircuit', status: 'ready' },
        { id: 'node-4', type: 'action', label: 'Slack Alert & DB Update', icon: 'Send', status: 'ready' }
      ],
      description: 'Ingests new inbound lead data, pulls ICP knowledge embeddings, evaluates conversion probability, and pushes alerts.'
    },
    {
      id: 'wf-2',
      name: 'Financial Earnings Report Synthesizer',
      status: 'idle',
      trigger: 'Scheduled (Daily 09:00)',
      lastRun: 'Yesterday',
      nodes: [
        { id: 'node-1', type: 'trigger', label: 'Cron Timer (09:00 AM)', icon: 'Clock', status: 'ready' },
        { id: 'node-2', type: 'tool', label: 'SEC Filing Scraper', icon: 'Globe', status: 'ready' },
        { id: 'node-3', type: 'llm', label: 'Deep Analysis LLM (DeepSeek R1)', icon: 'Cpu', status: 'ready' },
        { id: 'node-4', type: 'action', label: 'Export Executive PDF & Email', icon: 'FileText', status: 'ready' }
      ],
      description: 'Scrapes 10-K and 10-Q filings, performs balance sheet diffing, and generates executive summaries.'
    },
    {
      id: 'wf-3',
      name: 'Code Review & Security Vulnerability Guard',
      status: 'active',
      trigger: 'GitHub PR Event',
      lastRun: '12 mins ago',
      nodes: [
        { id: 'node-1', type: 'trigger', label: 'GitHub Webhook (PR Open)', icon: 'GitPullRequest', status: 'ready' },
        { id: 'node-2', type: 'tool', label: 'Diff Parser & AST Extractor', icon: 'Code', status: 'ready' },
        { id: 'node-3', type: 'llm', label: 'OWASP Security Inspector', icon: 'ShieldCheck', status: 'ready' },
        { id: 'node-4', type: 'action', label: 'Post Inline PR Comments', icon: 'CheckCircle', status: 'ready' }
      ],
      description: 'Analyzes AST trees and pull request diffs for injection vectors, hardcoded secrets, and performance regressions.'
    }
  ],
  documents: [
    {
      id: 'doc-1',
      title: 'Nexus Enterprise API Security Whitepaper.pdf',
      category: 'Security',
      chunksCount: 48,
      embeddingsModel: 'text-embedding-3-large',
      uploadedAt: '2026-08-30T10:15:00Z',
      size: '2.4 MB',
      status: 'indexed',
      content: 'Nexus Enterprise uses mTLS encryption and ECDSA signed tokens for zero-trust microservice communication. All data at rest is encrypted via AES-256-GCM. Vector retrieval utilizes hierarchical navigable small world (HNSW) graphs with cosine distance.'
    },
    {
      id: 'doc-2',
      title: 'Q3 Product Architecture & Latency SLA.md',
      category: 'Architecture',
      chunksCount: 22,
      embeddingsModel: 'text-embedding-3-large',
      uploadedAt: '2026-09-01T14:30:00Z',
      size: '840 KB',
      status: 'indexed',
      content: 'The platform guarantees p99 inference streaming latency under 220ms across US-East and EU-Central clusters. High-throughput queues utilize Redis Streams backed by distributed SQLite node shards.'
    },
    {
      id: 'doc-3',
      title: 'Global Compliance & GDPR Vector Handling.docx',
      category: 'Legal & Privacy',
      chunksCount: 35,
      embeddingsModel: 'text-embedding-3-large',
      uploadedAt: '2026-09-02T09:00:00Z',
      size: '1.1 MB',
      status: 'indexed',
      content: 'Personal identifiable data (PII) is automatically redacted via NER transformer models prior to vectorization. Chunk metadata preserves tenant isolation keys preventing cross-tenant vector leakage.'
    }
  ],
  images: [
    {
      id: 'img-1',
      prompt: 'Futuristic AI neural core floating in a cyberpunk glass room, neon violet and cyan lighting, volumetric fog, octane render 8k',
      style: 'Cyberpunk',
      aspectRatio: '16:9',
      createdAt: '2026-09-02T18:20:00Z',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
      likes: 42
    },
    {
      id: 'img-2',
      prompt: 'Holographic data dashboard with floating glowing financial graphs and glowing planetary orbits, sleek minimalist dark mode',
      style: '3D Render',
      aspectRatio: '1:1',
      createdAt: '2026-09-02T20:11:00Z',
      url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80',
      likes: 29
    },
    {
      id: 'img-3',
      prompt: 'Hyper-detailed quantum processor crystal chip radiating cyan energy waves, macro photography, shallow depth of field',
      style: 'Photorealistic',
      aspectRatio: '4:3',
      createdAt: '2026-09-03T04:15:00Z',
      url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1000&q=80',
      likes: 38
    }
  ],
  apiKeys: [
    {
      id: 'key-1',
      name: 'Production Worker Key',
      key: 'nx_live_9a8f4c2e71d3e8b0a5f90124c7e8',
      createdAt: '2026-08-15',
      lastUsed: '2 mins ago',
      rateLimit: '1,000 req/min',
      status: 'active'
    },
    {
      id: 'key-2',
      name: 'Staging Environment',
      key: 'nx_test_41c0e8f23b194d88a1ef90b72a4c',
      createdAt: '2026-08-28',
      lastUsed: '4 hours ago',
      rateLimit: '200 req/min',
      status: 'active'
    },
    {
      id: 'key-3',
      name: 'Analytics Batch Ingestor',
      key: 'nx_live_58e17b3c90f24a688d01bc49ae87',
      createdAt: '2026-09-01',
      lastUsed: 'Yesterday',
      rateLimit: '500 req/min',
      status: 'active'
    }
  ],
  activityLogs: [
    { id: 'act-1', event: 'Workflow Triggered', detail: 'Automated Lead Enrichment executed successfully (4 nodes, 820ms)', time: '2 mins ago', type: 'success' },
    { id: 'act-2', event: 'RAG Query', detail: 'Semantic search query: "mTLS zero-trust communication" (Score: 0.94)', time: '14 mins ago', type: 'info' },
    { id: 'act-3', event: 'API Key Created', detail: 'New key generated: "Analytics Batch Ingestor"', time: '1 hour ago', type: 'warning' },
    { id: 'act-4', event: 'Model Swapped', detail: 'Playground default changed to Claude 3.5 Sonnet', time: '3 hours ago', type: 'info' },
    { id: 'act-5', event: 'Image Generated', detail: 'Octane render prompt generated in 2.1s', time: '6 hours ago', type: 'success' }
  ]
};

class Database {
  constructor() {
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.users) {
          this.data.users = initialData.users;
          this.save();
        }
      } else {
        this.data = initialData;
        this.save();
      }
    } catch (err) {
      console.error('Error loading DB file, falling back to initial schema:', err);
      this.data = initialData;
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving DB file:', err);
    }
  }

  // Users & Auth
  getUsers() {
    return this.data.users || [];
  }

  getUserByEmail(email) {
    return (this.data.users || []).find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id) {
    return (this.data.users || []).find(u => u.id === id);
  }

  createUser(user) {
    if (!this.data.users) this.data.users = [];
    this.data.users.push(user);
    this.save();
    return user;
  }

  updateUser(id, updates) {
    const userIndex = (this.data.users || []).findIndex(u => u.id === id);
    if (userIndex >= 0) {
      this.data.users[userIndex] = { ...this.data.users[userIndex], ...updates };
      this.save();
      return this.data.users[userIndex];
    }
    return null;
  }

  getStats() {
    return this.data.stats;
  }

  updateStats(partial) {
    this.data.stats = { ...this.data.stats, ...partial };
    this.save();
    return this.data.stats;
  }

  // Chats
  getChats() {
    return this.data.chats || [];
  }

  getChatById(id) {
    return (this.data.chats || []).find(c => c.id === id);
  }

  saveChat(chat) {
    const existingIndex = (this.data.chats || []).findIndex(c => c.id === chat.id);
    if (existingIndex >= 0) {
      this.data.chats[existingIndex] = chat;
    } else {
      this.data.chats.unshift(chat);
    }
    this.save();
    return chat;
  }

  deleteChat(id) {
    this.data.chats = (this.data.chats || []).filter(c => c.id !== id);
    this.save();
    return true;
  }

  // Workflows
  getWorkflows() {
    return this.data.workflows || [];
  }

  getWorkflowById(id) {
    return (this.data.workflows || []).find(w => w.id === id);
  }

  saveWorkflow(workflow) {
    const existingIndex = (this.data.workflows || []).findIndex(w => w.id === workflow.id);
    if (existingIndex >= 0) {
      this.data.workflows[existingIndex] = workflow;
    } else {
      this.data.workflows.unshift(workflow);
    }
    this.save();
    return workflow;
  }

  deleteWorkflow(id) {
    this.data.workflows = (this.data.workflows || []).filter(w => w.id !== id);
    this.save();
    return true;
  }

  // Documents (RAG)
  getDocuments() {
    return this.data.documents || [];
  }

  addDocument(doc) {
    this.data.documents.unshift(doc);
    this.save();
    return doc;
  }

  deleteDocument(id) {
    this.data.documents = (this.data.documents || []).filter(d => d.id !== id);
    this.save();
    return true;
  }

  // Images
  getImages() {
    return this.data.images || [];
  }

  addImage(img) {
    this.data.images.unshift(img);
    this.save();
    return img;
  }

  deleteImage(id) {
    this.data.images = (this.data.images || []).filter(i => i.id !== id);
    this.save();
    return true;
  }

  // API Keys
  getApiKeys() {
    return this.data.apiKeys || [];
  }

  addApiKey(key) {
    this.data.apiKeys.unshift(key);
    this.save();
    return key;
  }

  revokeApiKey(id) {
    const target = (this.data.apiKeys || []).find(k => k.id === id);
    if (target) {
      target.status = target.status === 'active' ? 'revoked' : 'active';
      this.save();
      return target;
    }
    return null;
  }

  deleteApiKey(id) {
    this.data.apiKeys = (this.data.apiKeys || []).filter(k => k.id !== id);
    this.save();
    return true;
  }

  // Activity Logs
  getActivityLogs() {
    return this.data.activityLogs || [];
  }

  logActivity(log) {
    const entry = {
      id: `act-${Date.now()}`,
      time: 'Just now',
      ...log
    };
    this.data.activityLogs.unshift(entry);
    if (this.data.activityLogs.length > 50) {
      this.data.activityLogs = this.data.activityLogs.slice(0, 50);
    }
    this.save();
    return entry;
  }
}

export const db = new Database();
