import Resource from '../models/Resource.js';
import sampleResources from '../data/sampleResources.js';

const REQUIRE_AI = true;

export const getAnswer = async (req, res) => {
    try {
        const { question } = req.body;
        const q = String(question || '').trim();
        if (!q) return res.status(400).json({ success: false, error: 'Question is required' });

        // Prepare local context from resources to ground answers
        const dbResources = await Resource.find();
        const allResources = [...dbResources, ...sampleResources];
        const topContext = allResources
            .slice(0, 8)
            .map(r => `- ${r.title}${r.subject ? ` [${r.subject}]` : ''}${r.description ? `: ${r.description}` : ''}`)
            .join('\n');

        const grokKey = String(process.env.GROK_API_KEY || '').trim();
        if (grokKey) {
            try {
                const model = process.env.GROK_MODEL || 'grok-2';
                const response = await fetch('https://api.x.ai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${grokKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model,
                        messages: [
                            { role: 'system', content: 'You are a helpful, knowledgeable assistant for students and teachers. Answer clearly, with step-by-step reasoning when useful. If code is requested, provide concise, runnable examples. If the question relates to the site subjects, reference them naturally.' },
                            { role: 'system', content: `Local study context:\n${topContext}` },
                            { role: 'user', content: q }
                        ]
                    })
                });
                const data = await response.json();
                if (response.ok) {
                    const text = data?.choices?.[0]?.message?.content?.trim();
                    if (text) {
                        return res.json({ success: true, source: 'grok', answer: text });
                    }
                }
            } catch (_) {}
        }

        return res.status(503).json({ success: false, error: 'AI service unavailable. Please try again later.' });
    } catch (error) {
        console.error('QA Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to generate answer' });
    }
};

export default { getAnswer };
