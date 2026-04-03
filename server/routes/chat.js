const express = require('express');

const router = express.Router();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const CABZEE_CONTEXT = require('../utils/cabzee_context');

const SYSTEM_PROMPT = `You are CabZee AI Assistant — a helpful, friendly chatbot for the CabZee ride-hailing app.
You can have general conversations and help users with any questions they have.
You are knowledgeable, polite, and conversational.
Keep responses concise but helpful. Use emojis sparingly.
Always be friendly and approachable.

${CABZEE_CONTEXT}`;

// Chat with Groq AI
router.post('/', express.json(), async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    if (!GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'GROQ_API_KEY is not configured in backend .env'
      });
    }

    // Build messages array for Groq (OpenAI-compatible format)
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error:', response.status, errorText);
      return res.status(502).json({
        success: false,
        message: 'AI service error. Please try again.'
      });
    }

    const data = await response.json();

    res.json({
      success: true,
      data: {
        reply: data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.',
        model: data.model
      }
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI response'
    });
  }
});

module.exports = router;
