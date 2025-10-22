import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ytdl from 'ytdl-core';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import { Readable } from 'stream';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const streamToBuffer = (stream: Readable): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
};

app.post('/api/process-url', async (req, res) => {
    const { url, action, promptOptions } = req.body;
    
    if (!url || !action) {
        return res.status(400).json({ error: 'URL and action are required' });
    }

    console.log(`[Server] Processing URL: ${url} for action: ${action}`);

    try {
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }
        
        const audioStream = ytdl(url, { quality: 'lowestaudio' });
        const audioBuffer = await streamToBuffer(audioStream);
        const base64Audio = audioBuffer.toString('base64');
        
        const { summaryLength, summaryKeywords } = promptOptions || {};

        let response;
        if (action === 'summarize') {
            let prompt = '';
            switch (summaryLength) {
                case 'short': prompt = 'Provide a short, concise summary (a few key sentences) of this video.'; break;
                case 'medium': prompt = 'Provide a medium-length, detailed summary of this video, covering the main points.'; break;
                case 'long': prompt = 'Provide a comprehensive, long, and in-depth summary of this video.'; break;
                default: prompt = 'Provide a medium-length summary of this video.'; break;
            }
            if (summaryKeywords) {
                prompt += `\n\nPay special attention to the following topics or keywords: ${summaryKeywords}.`;
            }

            response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: { parts: [{ inlineData: { data: base64Audio, mimeType: 'audio/mp4' } }, { text: prompt }] }
            });
        } else if (action === 'transcribe') {
            response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: { parts: [{ inlineData: { data: base64Audio, mimeType: 'audio/mp4' } }, { text: 'Transcribe the audio from this video. Provide timestamps for each segment of speech in HH:MM:SS format. Return the result as a JSON array.' }] },
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                timestamp: { type: Type.STRING },
                                text: { type: Type.STRING }
                            },
                            required: ["timestamp", "text"]
                        }
                    }
                }
            });
        } else {
            return res.status(400).json({ error: 'Invalid action specified' });
        }
        
        res.json({ result: response.text });

    } catch (error: any) {
        console.error('[Server] Error processing YouTube URL:', error);
        res.status(500).json({ error: 'Failed to process YouTube video. It might be private or region-locked.', details: error.message });
    }
});

app.post('/api/translate', async (req, res) => {
    const { text, language } = req.body;
    if (!text || !language) {
        return res.status(400).json({ error: 'Text and language are required' });
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: `Translate the following text to ${language}:\n\n${text}` }] }
        });
        res.json({ result: response.text });
    } catch (error: any) {
        console.error('[Server] Translation Error:', error);
        res.status(500).json({ error: 'Failed to translate text.' });
    }
});

app.post('/api/generate-speech', async (req, res) => {
    const { text, voice, speed } = req.body;
    if (!text || !voice || !speed) {
        return res.status(400).json({ error: 'Text, voice, and speed are required' });
    }
    try {
        let speedInstruction = 'Read the following text clearly and naturally';
        if (speed === 'slow') speedInstruction = 'Read the following text at a slow, deliberate pace';
        if (speed === 'fast') speedInstruction = 'Read the following text at a quick, energetic pace';

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `${speedInstruction}: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio data received.");
        
        res.json({ result: base64Audio });
    } catch (error: any) {
        console.error('[Server] Speech Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate speech.' });
    }
});

app.listen(port, () => {
    console.log(`[Server] Backend server listening on http://localhost:${port}`);
});
