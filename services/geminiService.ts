
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { fileToBase64 } from "../utils/file";
import type { TranscriptSegment } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const summarizeVideo = async (
  source: File,
  length: 'short' | 'medium' | 'long',
  keywords: string
): Promise<string> => {
  const { base64, mimeType } = await fileToBase64(source);
  
  let prompt = '';
  switch (length) {
    case 'short':
      prompt = 'Provide a short, concise summary (a few key sentences) of this video.';
      break;
    case 'medium':
      prompt = 'Provide a medium-length, detailed summary of this video, covering the main points.';
      break;
    case 'long':
      prompt = 'Provide a comprehensive, long, and in-depth summary of this video. Describe the key events, topics discussed, and overall message in detail.';
      break;
  }

  if (keywords.trim()) {
    prompt += `\n\nPay special attention to the following topics or keywords: ${keywords.trim()}.`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: {
      parts: [
        { inlineData: { data: base64, mimeType } },
        { text: prompt }
      ]
    }
  });
  return response.text;
};

export const transcribeVideo = async (source: File): Promise<TranscriptSegment[]> => {
  const { base64, mimeType } = await fileToBase64(source);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: {
      parts: [
        { inlineData: { data: base64, mimeType } },
        { text: 'Transcribe the audio from this video. Provide timestamps for each segment of speech in HH:MM:SS format. Return the result as a JSON array.' }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            timestamp: {
              type: Type.STRING,
              description: "The start time of the speech segment in HH:MM:SS format."
            },
            text: {
              type: Type.STRING,
              description: "The transcribed text for this segment."
            }
          },
          required: ["timestamp", "text"]
        }
      }
    }
  });

  try {
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    if (Array.isArray(result)) {
      return result as TranscriptSegment[];
    }
    return [];
  } catch (e) {
    console.error("Failed to parse transcription JSON:", e);
    throw new Error("Invalid format for transcription response.");
  }
};


export const translateText = async (text: string, language: string): Promise<string> => {
  const response = await ai.models.generateContent({
    // fix: Updated model to 'gemini-2.5-flash' for basic text tasks like translation, as per the guidelines.
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { text: `Translate the following text to ${language}. Preserve the original meaning and tone.\n\n---\n\n${text}` }
      ]
    }
  });
  return response.text;
};

export const generateSpeech = async (
  text: string,
  voice: string,
  speed: string
): Promise<string> => {
  let speedInstruction = 'Read the following text clearly and naturally';
  switch (speed) {
    case 'slow':
      speedInstruction = 'Read the following text at a slow, deliberate pace';
      break;
    case 'fast':
      speedInstruction = 'Read the following text at a quick, energetic pace';
      break;
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `${speedInstruction}: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("No audio data received from API.");
  }
  return base64Audio;
};