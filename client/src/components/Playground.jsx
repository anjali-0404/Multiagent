import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  SlidersHorizontal, 
  Trash2, 
  Copy, 
  Check, 
  Plus, 
  Terminal, 
  Code,
  Download,
  CornerDownLeft,
  ChevronRight
} from 'lucide-react';
import { sendChatCompletion, fetchChatHistory, deleteChatSession } from '../services/api';

const AVAILABLE_MODELS = [
  { id: 'Claude 3.5 Sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', context: '200k' },
  { id: 'GPT-4o', name: 'GPT-4o', provider: 'OpenAI', context: '128k' },
  { id: 'DeepSeek R1', name: 'DeepSeek R1', provider: 'DeepSeek', context: '64k' },
  { id: 'Gemini 1.5 Pro', name: 'Gemini 1.5 Pro', provider: 'Google', context: '2M' },
];

const SYSTEM_PRESETS = [
  { label: 'Technical Architect', prompt: 'You are a Principal Software Engineer. Provide concise, type-safe, production-ready code with minimal conversational filler.' },
  { label: 'Security Reviewer', prompt: 'You are an AppSec specialist. Identify potential OWASP vulnerabilities, race conditions, and boundary violations.' },
  { label: 'Concise Summary', prompt: 'Summarize insights directly in bulleted technical format.' }
];

export default function Playground({ onUpdateStats }) {
  const [selectedModel, setSelectedModel] = useState('Claude 3.5 Sonnet');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [systemPrompt, setSystemPrompt] = useState('You are an expert software engineer. Provide high-quality, structured technical responses.');
  
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Workbench ready. Select a model, configure parameters, or test prompts below.',
      usage: { totalTokens: 24 }
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showConfig, setShowConfig] = useState(true);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  async function loadChatHistory() {
    try {
      const res = await fetchChatHistory();
      if (res.success && res.chats.length > 0) {
        setChats(res.chats);
        setCurrentChatId(res.chats[0].id);
        setMessages(res.chats[0].messages);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  }

  function handleSelectChat(chat) {
    setCurrentChatId(chat.id);
    setSelectedModel(chat.model || 'Claude 3.5 Sonnet');
    setMessages(chat.messages || []);
  }

  function handleNewChat() {
    const newId = `chat-${Date.now()}`;
    setCurrentChatId(newId);
    setMessages([
      {
        role: 'assistant',
        content: `Session initialized with **${selectedModel}**. How can I help with your system architecture or code today?`,
        usage: { totalTokens: 20 }
      }
    ]);
  }

  async function handleDeleteChat(e, id) {
    e.stopPropagation();
    try {
      await deleteChatSession(id);
      const remaining = chats.filter(c => c.id !== id);
      setChats(remaining);
      if (currentChatId === id) {
        if (remaining.length > 0) {
          handleSelectChat(remaining[0]);
        } else {
          handleNewChat();
        }
      }
    } catch (err) {
      console.error('Error deleting chat:', err);
    }
  }

  async function handleSend() {
    if (!inputPrompt.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputPrompt.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await sendChatCompletion({
        model: selectedModel,
        messages: updatedMessages,
        systemPrompt,
        temperature,
        maxTokens,
        chatId: currentChatId
      });

      if (res.success) {
        setMessages(prev => [...prev, res.message]);
        if (onUpdateStats) onUpdateStats();
        loadChatHistory();
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${res.error || 'Failed to infer response'}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Network error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  }

  function copyToClipboard(text, id) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function exportChatJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(messages, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `prompt-session-${selectedModel}-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      {/* Left Sidebar: Saved Sessions */}
      <div style={{
        width: '220px',
        borderRight: '1px solid var(--border-hairline)',
        background: 'var(--bg-sidebar)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '14px 10px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={handleNewChat}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem', padding: '6px 10px' }}
          >
            <Plus size={14} />
            <span>New Prompt Run</span>
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, paddingLeft: '4px' }}>
              History
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
              {chats.map(chat => {
                const isActive = currentChatId === chat.id;
                return (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectChat(chat)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-xs)',
                      background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background 0.1s ease'
                    }}
                    onMouseEnter={e => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    }}
                    onMouseLeave={e => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: '2px' }}>
                      <span style={{ fontSize: '0.76rem', fontWeight: isActive ? 500 : 400, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {chat.title}
                      </span>
                      <span style={{ fontSize: '0.66rem', color: 'var(--text-tertiary)' }}>
                        {chat.model || 'Claude 3.5'}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', opacity: 0.7 }}
                      title="Delete run"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <button 
          onClick={exportChatJSON}
          className="btn-secondary"
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.74rem', padding: '6px' }}
        >
          <Download size={12} />
          <span>Export JSON</span>
        </button>
      </div>

      {/* Center: Main Workbench View */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
        {/* Top Model Selector Bar */}
        <div style={{
          padding: '10px 20px',
          borderBottom: '1px solid var(--border-hairline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-sidebar)'
        }}>
          {/* Segmented Model Switcher */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-sm)',
            padding: '2px'
          }}>
            {AVAILABLE_MODELS.map(m => {
              const isSelected = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-xs)',
                    border: 'none',
                    background: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 500 : 400,
                    cursor: 'pointer'
                  }}
                >
                  <span>{m.name}</span>
                  <span style={{ fontSize: '0.66rem', color: 'var(--text-tertiary)', fontFamily: 'Geist Mono, monospace' }}>{m.context}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="btn-secondary"
            style={{ padding: '5px 10px', fontSize: '0.76rem' }}
          >
            <SlidersHorizontal size={13} />
            <span>Parameters</span>
          </button>
        </div>

        {/* Message Stream */}
        <div style={{ flex: 1, padding: '20px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={idx} 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: isUser ? '75%' : '85%'
                }}
              >
                <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', alignItems: 'center', gap: '8px', padding: '0 4px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 500, color: isUser ? 'var(--text-secondary)' : '#60A5FA' }}>
                    {isUser ? 'User' : msg.model || selectedModel}
                  </span>
                  {msg.meta?.latencyMs && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                      {msg.meta.latencyMs}ms
                    </span>
                  )}
                </div>

                <div style={{
                  background: isUser ? 'rgba(255, 255, 255, 0.08)' : 'var(--bg-surface)',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ fontSize: '0.86rem', lineHeight: 1.55, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </div>

                  {!isUser && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-hairline)', paddingTop: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                        Tokens: {msg.usage?.totalTokens || 0}
                      </span>
                      <button
                        onClick={() => copyToClipboard(msg.content, idx)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}
                      >
                        {copiedId === idx ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                        <span>{copiedId === idx ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Streaming response from {selectedModel}...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-hairline)', background: 'var(--bg-sidebar)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px'
          }}>
            <textarea
              rows={2}
              placeholder={`Send message to ${selectedModel}...`}
              value={inputPrompt}
              onChange={e => setInputPrompt(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.84rem',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'none',
                lineHeight: 1.4
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                <kbd>Enter</kbd> to run
              </span>
              <button
                onClick={handleSend}
                disabled={isLoading || !inputPrompt.trim()}
                className="btn-accent"
                style={{ padding: '5px 10px', fontSize: '0.76rem' }}
              >
                <span>Run</span>
                <CornerDownLeft size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Drawer: Parameters Configuration */}
      {showConfig && (
        <div style={{
          width: '260px',
          borderLeft: '1px solid var(--border-hairline)',
          background: 'var(--bg-sidebar)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          overflowY: 'auto'
        }}>
          <div>
            <h3 style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>Sampling Parameters</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>Hyperparameter tuning for inference</p>
          </div>

          {/* System Prompt Presets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 500, color: 'var(--text-secondary)' }}>System Presets</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {SYSTEM_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setSystemPrompt(preset.prompt)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-hairline)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '3px 7px',
                    fontSize: '0.7rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* System Prompt */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 500, color: 'var(--text-secondary)' }}>System Prompt</span>
            <textarea
              className="custom-input"
              rows={4}
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              style={{ fontSize: '0.76rem', resize: 'vertical' }}
            />
          </div>

          {/* Temperature */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Temperature</span>
              <span style={{ color: 'var(--text-primary)', fontFamily: 'Geist Mono, monospace', fontWeight: 600 }}>{temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.05"
              value={temperature}
              onChange={e => setTemperature(parseFloat(e.target.value))}
              style={{ accentColor: '#3B82F6', cursor: 'pointer' }}
            />
          </div>

          {/* Max Tokens */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Max Output Tokens</span>
              <span style={{ color: 'var(--text-primary)', fontFamily: 'Geist Mono, monospace', fontWeight: 600 }}>{maxTokens}</span>
            </div>
            <input
              type="range"
              min="128"
              max="4096"
              step="128"
              value={maxTokens}
              onChange={e => setMaxTokens(parseInt(e.target.value))}
              style={{ accentColor: '#3B82F6', cursor: 'pointer' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
