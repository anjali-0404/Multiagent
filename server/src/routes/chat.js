import express from 'express';
import { db } from '../db/database.js';
import { generateChatResponse, MODEL_PROFILES } from '../services/aiService.js';

const router = express.Router();

// GET /api/chat/models - list supported models & specs
router.get('/models', (req, res) => {
  res.json({ success: true, models: MODEL_PROFILES });
});

// GET /api/chat/history - list all chats
router.get('/history', (req, res) => {
  try {
    const chats = db.getChats();
    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/chat/completions - inference endpoint
router.post('/completions', async (req, res) => {
  try {
    const { model, messages, systemPrompt, temperature, maxTokens, chatId } = req.body;

    const response = await generateChatResponse({
      model,
      messages,
      systemPrompt,
      temperature,
      maxTokens
    });

    // Update database tokens & API call stats
    // BUG-06 FIX: Use the actual cost returned by the Python service (model-specific pricing)
    // instead of a hardcoded 0.000003/token rate that is wrong for all models except Claude.
    const realCostUsd = response.meta?.costUsd ?? (response.usage.totalTokens * 0.000003);
    const stats = db.getStats();
    db.updateStats({
      totalTokens: stats.totalTokens + response.usage.totalTokens,
      apiCalls: stats.apiCalls + 1,
      currentSpendUsd: parseFloat((stats.currentSpendUsd + realCostUsd).toFixed(6))
    });

    // Save or update chat session
    const currentChatId = chatId || `chat-${Date.now()}`;
    const userMsg = messages[messages.length - 1];
    const existing = db.getChatById(currentChatId);

    const updatedChat = {
      id: currentChatId,
      title: existing ? existing.title : (userMsg?.content ? userMsg.content.slice(0, 36) + '...' : 'New Prompt Session'),
      model: model || 'GPT-4o',
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        ...(existing ? existing.messages : messages.slice(0, -1)),
        userMsg,
        response
      ]
    };

    db.saveChat(updatedChat);

    db.logActivity({
      event: `Prompt Inferred (${model || 'GPT-4o'})`,
      detail: `Generated ${response.usage.outputTokens} tokens in ${response.meta.latencyMs}ms.`,
      type: 'success'
    });

    res.json({
      success: true,
      message: response,
      chat: updatedChat
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/chat/stream - SSE streaming pass-through
router.post('/stream', async (req, res) => {
  const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
  const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || 'forge_dev_secret_key_12345';

  try {
    const { model, messages, systemPrompt, temperature, maxTokens } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const aiRes = await fetch(`${AI_SERVICE_URL}/infer/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': INTERNAL_SERVICE_SECRET
      },
      body: JSON.stringify({
        model,
        messages,
        systemPrompt,
        temperature,
        maxTokens
      })
    });

    if (!aiRes.ok) {
      res.write(`data: ${JSON.stringify({ chunk: 'Could not connect to streaming service.', done: true })}\n\n`);
      return res.end();
    }

    const reader = aiRes.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
    res.end();
  } catch (error) {
    console.error('Chat stream error:', error);
    res.write(`data: ${JSON.stringify({ chunk: `Stream error: ${error.message}`, done: true })}\n\n`);
    res.end();
  }
});

export default router;
