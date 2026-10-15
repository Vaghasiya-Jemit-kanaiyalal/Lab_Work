/**
 * AI Controller for Task Management Application
 * Integrates external AI (Google Gemini API / OpenAI API) with graceful fallback.
 * Adheres to Responsible AI principles:
 * - API keys are stored server-side only in process.env and never exposed to clients
 * - Never logs private keys or raw authentication credentials
 * - Enforces request timeout to prevent hanging connections
 * - Provides graceful fallback on network timeout, quota errors, or missing keys
 */

import dotenv from 'dotenv';

/**
 * Intelligent Rule-Based Fallback Generator
 * Generates structured task descriptions and priority suggestions when external AI is unavailable.
 */
export const generateFallbackTaskInfo = (title = '') => {
  const cleanTitle = title.trim();
  const lower = cleanTitle.toLowerCase();

  let suggestedPriority = 'medium';
  let suggestedDays = 3;

  if (/\b(urgent|critical|crash|prod|emergency|asap|security|blocker)\b/.test(lower)) {
    suggestedPriority = 'urgent';
    suggestedDays = 1;
  } else if (/\b(fix|bug|deploy|test|exam|submit|deadline|interview|patch)\b/.test(lower)) {
    suggestedPriority = 'high';
    suggestedDays = 2;
  } else if (/\b(read|explore|cleanup|refactor|docs|optional|research|idea|backup)\b/.test(lower)) {
    suggestedPriority = 'low';
    suggestedDays = 7;
  }

  let description = '';
  if (/\b(presentation|slides|demo)\b/.test(lower)) {
    description = `Prepare outline, visual assets, and speaker notes for "${cleanTitle}". Rehearse key sections and verify live demo steps.`;
  } else if (/\b(test|testing|qa|ci|cd|pipeline)\b/.test(lower)) {
    description = `Formulate test cases, execute automated suite for "${cleanTitle}", analyze code coverage, and resolve any regression failures.`;
  } else if (/\b(docker|container|compose|deploy)\b/.test(lower)) {
    description = `Configure environment variables, build container images for "${cleanTitle}", verify port mappings, and test service orchestration.`;
  } else if (/\b(study|revise|practical|assignment|lab)\b/.test(lower)) {
    description = `Review reference documentation, implement core deliverables for "${cleanTitle}", and prepare report with screenshots.`;
  } else {
    description = `Define objectives, break down actionable milestones, and execute deliverables for "${cleanTitle}" to ensure timely completion.`;
  }

  return {
    description,
    suggestedPriority,
    suggestedDays,
    isFallback: true,
    provider: 'smart-fallback',
    message: 'AI API key not configured or external service unreachable. Fallback assistant generated this proposal.',
  };
};

/**
 * Calls Google Gemini API (gemini-1.5-flash / gemini-2.0-flash)
 */
async function callGeminiApi(apiKey, taskTitle) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are an AI assistant in a modern Task Management application.
Given the task title: "${taskTitle}"
Generate an actionable, professional task description (1 to 2 clear sentences), a suggested priority level (must be one of: 'low', 'medium', 'high', 'urgent'), and estimated completion days (integer between 1 and 14).
Respond strictly with valid JSON only in this exact format:
{
  "description": "concise description here",
  "suggestedPriority": "medium",
  "suggestedDays": 3
}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 250
        }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API HTTP ${response.status}: ${errText.slice(0, 150)}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Strip markdown code fences if present
    const cleanJson = rawText.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    const priority = validPriorities.includes(parsed.suggestedPriority?.toLowerCase())
      ? parsed.suggestedPriority.toLowerCase()
      : 'medium';

    return {
      description: parsed.description || `Deliverables and action plan for "${taskTitle}".`,
      suggestedPriority: priority,
      suggestedDays: Number.isInteger(parsed.suggestedDays) ? parsed.suggestedDays : 3,
      isFallback: false,
      provider: 'gemini'
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Calls OpenAI API (gpt-4o-mini / gpt-3.5-turbo)
 */
async function callOpenAiApi(apiKey, taskTitle) {
  const url = 'https://api.openai.com/v1/chat/completions';

  const prompt = `You are an AI assistant in a modern Task Management application.
Given the task title: "${taskTitle}"
Generate an actionable, professional task description (1 to 2 clear sentences), a suggested priority level (must be one of: 'low', 'medium', 'high', 'urgent'), and estimated completion days (integer between 1 and 14).
Respond strictly with valid JSON only in this exact format:
{
  "description": "concise description here",
  "suggestedPriority": "medium",
  "suggestedDays": 3
}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        response_format: { type: 'json_object' }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API HTTP ${response.status}: ${errText.slice(0, 150)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    const priority = validPriorities.includes(parsed.suggestedPriority?.toLowerCase())
      ? parsed.suggestedPriority.toLowerCase()
      : 'medium';

    return {
      description: parsed.description || `Deliverables and action plan for "${taskTitle}".`,
      suggestedPriority: priority,
      suggestedDays: Number.isInteger(parsed.suggestedDays) ? parsed.suggestedDays : 3,
      isFallback: false,
      provider: 'openai'
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * POST /api/ai/generate-description
 * Receives { title: string }
 * Returns { success: true, description, suggestedPriority, suggestedDays, isFallback, provider }
 */
export const generateTaskDescription = async (req, res) => {
  dotenv.config();
  const { title } = req.body || {};

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Task title is required to generate AI suggestions.'
    });
  }

  const cleanTitle = title.trim();
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  // Attempt external AI service if API key is configured
  if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
    try {
      const aiResult = await callGeminiApi(geminiKey, cleanTitle);
      return res.status(200).json({
        success: true,
        ...aiResult
      });
    } catch (err) {
      console.warn('⚠️ [AI Service Warning] Gemini API call failed or timed out:', err.message);
      // Graceful degradation to fallback
      const fallbackResult = generateFallbackTaskInfo(cleanTitle);
      return res.status(200).json({
        success: true,
        ...fallbackResult,
        warning: 'External AI call failed. Graceful fallback engaged.'
      });
    }
  }

  if (openAiKey && openAiKey !== 'your_openai_api_key_here') {
    try {
      const aiResult = await callOpenAiApi(openAiKey, cleanTitle);
      return res.status(200).json({
        success: true,
        ...aiResult
      });
    } catch (err) {
      console.warn('⚠️ [AI Service Warning] OpenAI API call failed or timed out:', err.message);
      const fallbackResult = generateFallbackTaskInfo(cleanTitle);
      return res.status(200).json({
        success: true,
        ...fallbackResult,
        warning: 'External AI call failed. Graceful fallback engaged.'
      });
    }
  }

  // If no external API key is provided, gracefully engage fallback assistant
  const fallbackResult = generateFallbackTaskInfo(cleanTitle);
  return res.status(200).json({
    success: true,
    ...fallbackResult
  });
};

/**
 * GET /api/ai/status
 * Informs frontend about AI service readiness without exposing keys
 */
export const getAiServiceStatus = (req, res) => {
  dotenv.config();
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here');

  res.status(200).json({
    success: true,
    service: 'Task Management AI Assistant',
    status: hasGemini || hasOpenAi ? 'online' : 'fallback-mode',
    provider: hasGemini ? 'Google Gemini' : hasOpenAi ? 'OpenAI' : 'Built-in Fallback Assistant',
    responsibleAi: {
      clientKeyExposed: false,
      privacyPreserved: true,
      gracefulDegradation: true
    }
  });
};
