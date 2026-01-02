'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getTacticalFeedback(
    question: string,
    userAnswer: string,
    correctAnswer: string,
    type: 'vocab' | 'grammar' | 'blitz',
    userId: string
) {
    try {
        if (!userId || userId === 'guest') {
            return { success: false, isNotPro: true, message: 'Login dulu bro buat pake AI!' };
        }

        // PRO CHECK
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('is_pro, pro_until')
            .eq('id', userId)
            .single();

        const now = new Date();
        const isPro = user?.is_pro && user?.pro_until && new Date(user.pro_until) > now;

        if (!isPro) {
            return {
                success: false,
                isNotPro: true,
                message: 'Fitur Quantum AI Tutor hanya tersedia untuk member PRO, bro!'
            };
        }

        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            console.error('MISSING API KEY in environment variables!');
            return { success: false, error: 'API Key not configured in .env.local' };
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY.trim().replace(/^["']|["']$/g, '');
        const genAI = new GoogleGenerativeAI(apiKey);

        console.log('AI Request Started for:', { question, type });
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `
            You are "Quantum AI", a tactical language learning mentor for a game called LinguaGame. 
            Your tone is cool, tactical, uses terms like "bro", "sepuh", "gacor", "literally", "pusat", and "taktis". 
            You are helping a player who just made a mistake.

            QUESTION: "${question}"
            USER'S WRONG ANSWER: "${userAnswer}"
            CORRECT ANSWER: "${correctAnswer}"
            GAME MODE: "${type}"

            TASK:
            1. Briefly explain why the user's answer is wrong and why the correct one is right.
            2. Give 1 tactical tip to remember this in the future.
            3. Keep it punchy, short (max 2-3 sentences), and very encouraging in a "bro" tactical way.

            OUTPUT FORMAT:
            {
                "explanation": "...",
                "tip": "..."
            }
            Output only the JSON.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log('AI Raw Response:', text);

        // Clean JSON from potential markdown markers or extra text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in AI response');
        }
        const cleanJson = jsonMatch[0];
        const parsed = JSON.parse(cleanJson);

        console.log('AI Parsed Response:', parsed);

        return {
            success: true,
            explanation: parsed.explanation,
            tip: parsed.tip
        };
    } catch (error: any) {
        console.error('AI Feedback FULL ERROR:', JSON.stringify(error, null, 2));
        console.error('AI Feedback Error Detail:', error);
        return {
            success: false,
            message: 'AI lagi cooling down, bro. Tetap fokus!',
            debug_error: error.message || String(error)
        };
    }
}
