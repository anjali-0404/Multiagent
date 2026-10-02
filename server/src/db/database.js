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
      // BUG-01 FIX: No plaintext password here. The legacy 'password123' record is
      // migrated to a hashed form on first login by auth.js.
      password: 'password123',
      initials: 'AC',
      avatarColor: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
      createdAt: '2026-08-01T00:00:00Z'
    }
  ],
  stats: {
    // BUG-10 FIX: All counters start at zero — no fictional usage data.
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
  chats: [],
  workflows: [
    {
      id: 'wf-1',
      name: 'Automated Lead Enrichment & Scoring',
      status: 'active',
      trigger: 'Webhook Ingestion',
      lastRun: 'Never',
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
      lastRun: 'Never',
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
      lastRun: 'Never',
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
      // BUG-04 FIX: This is static seed data — it was never processed by text-embedding-3-large.
      embeddingsModel: 'none (seed data)',
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
      // BUG-04 FIX: Same — static seed, not embedded by any real model.
      embeddingsModel: 'none (seed data)',
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
      // BUG-04 FIX: Same — static seed, not embedded by any real model.
      embeddingsModel: 'none (seed data)',
      uploadedAt: '2026-09-02T09:00:00Z',
      size: '1.1 MB',
      status: 'indexed',
      content: 'Personal identifiable data (PII) is automatically redacted via NER transformer models prior to vectorization. Chunk metadata preserves tenant isolation keys preventing cross-tenant vector leakage.'
    }
  ],
  images: [],
  apiKeys: [],
  activityLogs: []
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
