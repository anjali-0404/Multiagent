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
    const stats = db.getStats();
    db.updateStats({
      totalTokens: stats.totalTokens + response.usage.totalTokens,
      apiCalls: stats.apiCalls + 1,
      currentSpendUsd: parseFloat((stats.currentSpendUsd + (response.usage.totalTokens * 0.000003)).toFixed(4))
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

// DELETE /api/chat/:id - delete chat session
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.deleteChat(id);
    res.json({ success: true, message: 'Chat deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
