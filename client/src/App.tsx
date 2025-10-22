import React, { useState, useCallback, useMemo } from 'react';
import { summarizeVideo, transcribeVideo, translateText, generateSpeech } from './services/geminiService';
import { playAudio } from './utils/audio';
import InputSource from './components/InputSource';
import VideoPlayer from './components/VideoPlayer';
import ActionButton from './components/ActionButton';
import ResultCard from './components/ResultCard';
import Selector from './components/LanguageSelector';
import { LANGUAGES, VOICES, SPEECH_SPEEDS } from './constants';
import { SummaryIcon, TranscriptIcon, TranslateIcon, SpeakIcon } from './components/icons';
import type { TranscriptSegment, InputSourceType } from './types';
import { getYoutubeEmbedUrl } from './utils/youtube';

type LoadingStates = { summary: boolean; transcription: boolean; translation: boolean; speech: boolean; };
type SummaryLength = 'short' | 'medium' | 'long';
type InputType = 'file' | 'url';

const App: React.FC = () => {
    const [inputSource, setInputSource] = useState<InputSourceType | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [inputType, setInputType] = useState<InputType | null>(null);

    const [summary, setSummary] = useState<string>('');
    const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
    const [translatedTranscript, setTranslatedTranscript] = useState<string>('');
    const [targetLanguage, setTargetLanguage] = useState<string>('Spanish');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<LoadingStates>({ summary: false, transcription: false, translation: false, speech: false });

    const [summaryLength, setSummaryLength] = useState<SummaryLength>('medium');
    const [summaryKeywords, setSummaryKeywords] = useState<string>('');
    const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
    const [speechSpeed, setSpeechSpeed] = useState<string>('normal');

    const isProcessingEnabled = useMemo(() => !!inputSource, [inputSource]);

    const resetOutputs = () => {
        setSummary('');
        setTranscript([]);
        setTranslatedTranscript('');
        setError(null);
    };

    const handleFileChange = (file: File | null) => {
        resetOutputs();
        if (file) {
            setInputSource(file);
            const url = URL.createObjectURL(file);
            setVideoUrl(url);
            setInputType('file');
        } else {
            setInputSource(null);
            setVideoUrl(null);
            setInputType(null);
        }
    };

    const handleUrlChange = (url: string) => {
        resetOutputs();
        const embedUrl = getYoutubeEmbedUrl(url);
        if (embedUrl) {
            setInputSource(url); // Set the original URL as the source for processing
            setVideoUrl(embedUrl); // Set the embeddable URL for the player
            setInputType('url');
        } else {
            setError("Invalid YouTube URL. Please check the format and try again.");
            setInputSource(null);
            setVideoUrl(null);
            setInputType(null);
        }
    };

    const handleOperation = useCallback(async <T,>(operation: () => Promise<T>, key: keyof LoadingStates, onSuccess: (result: T) => void) => {
        setError(null);
        setLoading(prev => ({ ...prev, [key]: true }));
        try {
            const result = await operation();
            onSuccess(result);
        } catch (err: any) {
            console.error(`${key} error:`, err);
            setError(`Operation failed: ${err.message}`);
        } finally {
            setLoading(prev => ({ ...prev, [key]: false }));
        }
    }, []);

    const handleSummarize = async () => {
        if (!inputSource) return;
        await handleOperation(() => summarizeVideo(inputSource, summaryLength, summaryKeywords), 'summary', setSummary);
    };

    const handleTranscribe = async () => {
        if (!inputSource) return;
        await handleOperation(() => transcribeVideo(inputSource), 'transcription', setTranscript);
    };
    
    const fullTranscriptText = useMemo(() => transcript.map(t => t.text).join(' '), [transcript]);

    const handleTranslate = async () => {
        if (transcript.length === 0) return;
        await handleOperation(() => translateText(fullTranscriptText, targetLanguage), 'translation', setTranslatedTranscript);
    };

    const handleSpeak = async () => {
        if (!translatedTranscript) return;
        await handleOperation(() => generateSpeech(translatedTranscript, selectedVoice, speechSpeed), 'speech', playAudio);
    };
  
  return (
    <div className="min-h-screen bg-base-100 text-content font-sans">
      <header className="bg-base-200/50 backdrop-blur-sm sticky top-0 z-10 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">Video AI Toolkit</h1>
          <p className="text-content mt-1">Summarize, Transcribe, Translate, and Voice Over your videos with Gemini.</p>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-6">
            <InputSource onFileChange={handleFileChange} onUrlChange={handleUrlChange} />
            {videoUrl && inputType && <VideoPlayer src={videoUrl} inputType={inputType} />}
          </div>
          <div className="flex flex-col gap-6">
            <div className="bg-base-200 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-4">AI Actions</h2>
              {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4 break-words">{error}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 bg-base-300/50 p-4 rounded-md space-y-4">
                    <h3 className="font-semibold text-white">Summarization Options</h3>
                    <div>
                        <label className="text-sm font-medium text-content/80 block mb-2">Length</label>
                        <div className="flex items-center gap-4">
                            {(['short', 'medium', 'long'] as SummaryLength[]).map(len => (
                                <label key={len} className="flex items-center text-sm cursor-pointer">
                                    <input type="radio" name="summary-length" value={len} checked={summaryLength === len} onChange={() => setSummaryLength(len)} className="radio radio-primary mr-2" />
                                    <span className="capitalize">{len}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                     <div>
                        <label htmlFor="keywords" className="text-sm font-medium text-content/80 block mb-2">Focus Keywords (optional)</label>
                        <input type="text" id="keywords" value={summaryKeywords} onChange={e => setSummaryKeywords(e.target.value)} placeholder="e.g., climate change, solar panels" className="w-full bg-base-300 border border-base-300/50 text-white py-2 px-3 rounded-lg focus:outline-none focus:border-brand-primary transition-colors" />
                    </div>
                    <ActionButton onClick={handleSummarize} disabled={!isProcessingEnabled || loading.summary} isLoading={loading.summary} icon={<SummaryIcon />}>Summarize</ActionButton>
                </div>
                <ActionButton onClick={handleTranscribe} disabled={!isProcessingEnabled || loading.transcription} isLoading={loading.transcription} icon={<TranscriptIcon />} className="sm:col-span-2">Transcribe</ActionButton>
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                   <div className="sm:col-span-1">
                        <Selector label="Language" options={LANGUAGES.map(l => ({value: l, label: l}))} selectedValue={targetLanguage} onValueChange={setTargetLanguage} disabled={transcript.length === 0} />
                   </div>
                    <div className="sm:col-span-2">
                         <ActionButton onClick={handleTranslate} disabled={transcript.length === 0 || loading.translation} isLoading={loading.translation} icon={<TranslateIcon />}>Translate</ActionButton>
                    </div>
                </div>
                <div className="sm:col-span-2 bg-base-300/50 p-4 rounded-md space-y-4">
                    <h3 className="font-semibold text-white">Speech Options</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <Selector label="Voice" options={VOICES} selectedValue={selectedVoice} onValueChange={setSelectedVoice} disabled={!translatedTranscript} />
                         <Selector label="Speed" options={SPEECH_SPEEDS} selectedValue={speechSpeed} onValueChange={setSpeechSpeed} disabled={!translatedTranscript} />
                    </div>
                    <ActionButton onClick={handleSpeak} disabled={!translatedTranscript || loading.speech} isLoading={loading.speech} icon={<SpeakIcon />}>Generate Speech</ActionButton>
                </div>
              </div>
            </div>
            {summary && <ResultCard title="Summary"><p className="whitespace-pre-wrap">{summary}</p></ResultCard>}
            {transcript.length > 0 && (
              <ResultCard title="Transcript">
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {transcript.map((item, index) => (<div key={index} className="flex gap-4"><span className="font-mono text-sm bg-brand-primary/20 text-brand-primary px-2 py-1 rounded-md h-fit">{item.timestamp}</span><p>{item.text}</p></div>))}
                </div>
              </ResultCard>
            )}
            {translatedTranscript && <ResultCard title={`Translation (${targetLanguage})`}><p className="whitespace-pre-wrap">{translatedTranscript}</p></ResultCard>}
          </div>
        </div>
      </main>
    </div>
  );
};
export default App;
