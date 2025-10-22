import { fileToBase64 } from "../utils/file";
import type { TranscriptSegment, InputSourceType } from "../types";

const API_BASE_URL = 'http://localhost:3001/api';

const handleApiResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred' }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.result;
};

export const summarizeVideo = async (
    source: InputSourceType,
    length: 'short' | 'medium' | 'long',
    keywords: string
): Promise<string> => {
    let body;
    if (typeof source === 'string') { // It's a URL
        body = JSON.stringify({
            url: source,
            action: 'summarize',
            promptOptions: { summaryLength: length, summaryKeywords: keywords }
        });
        const response = await fetch(`${API_BASE_URL}/process-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        });
        return handleApiResponse(response);
    } else { // It's a File
        // This functionality now lives on the server for consistency, but
        // a direct-to-Gemini client-side implementation could be added here
        // if desired for file uploads to bypass our own server.
        // For now, we'll keep all AI logic on the server.
        throw new Error("Direct file processing on the client is not implemented in this version. Please use the server for all operations.");
    }
};

export const transcribeVideo = async (source: InputSourceType): Promise<TranscriptSegment[]> => {
     let body;
    if (typeof source === 'string') { // It's a URL
        body = JSON.stringify({
            url: source,
            action: 'transcribe'
        });
        const response = await fetch(`${API_BASE_URL}/process-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        });
        const result = await handleApiResponse(response);
        // The server returns a stringified JSON, so we parse it here.
        return JSON.parse(result);
    } else { // It's a File
        throw new Error("Direct file processing on the client is not implemented in this version. Please use the server for all operations.");
    }
};

export const translateText = async (text: string, language: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language })
    });
    return handleApiResponse(response);
};

export const generateSpeech = async (
    text: string,
    voice: string,
    speed: string
): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/generate-speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice, speed })
    });
    return handleApiResponse(response);
};
