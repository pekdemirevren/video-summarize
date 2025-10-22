import React, { useCallback, useState } from 'react';

interface InputSourceProps {
  onFileChange: (file: File | null) => void;
  onUrlChange: (url: string) => void;
}

type InputTab = 'file' | 'url';

const InputSource: React.FC<InputSourceProps> = ({ onFileChange, onUrlChange }) => {
  const [activeTab, setActiveTab] = useState<InputTab>('file');
  const [fileName, setFileName] = useState<string | null>(null);
  const [url, setUrl] = useState<string>('');

  const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        setFileName(file.name);
        onFileChange(file);
      }
    }
  }, [onFileChange]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFileName(file.name);
      onFileChange(file);
    } else {
        setFileName(null);
        onFileChange(null);
    }
  };

  const handleUrlSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (url.trim()) {
      onUrlChange(url);
    }
  }
  
  const TabButton: React.FC<{tab: InputTab, children: React.ReactNode}> = ({ tab, children }) => (
      <button
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none ${
          activeTab === tab 
          ? 'bg-base-200 text-brand-primary border-b-2 border-brand-primary' 
          : 'text-content/70 hover:text-white border-b-2 border-transparent'
        }`}
        aria-pressed={activeTab === tab}
      >
        {children}
      </button>
  );

  return (
    <div className="bg-base-200 p-6 rounded-lg shadow-lg">
      <div className="flex border-b border-base-300 mb-4">
        <TabButton tab="file">Upload File</TabButton>
        <TabButton tab="url">From YouTube URL</TabButton>
      </div>

      {activeTab === 'file' && (
        <div>
          <label
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-base-300 rounded-lg cursor-pointer bg-base-100 hover:bg-base-300/50 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-content" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
              </svg>
              <p className="mb-2 text-sm text-content"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-content/70">MP4, MOV, AVI, WEBM etc.</p>
            </div>
            <input id="dropzone-file" type="file" className="hidden" accept="video/*" onChange={handleFileSelect} />
          </label>
          {fileName && <p className="mt-4 text-center text-sm">Selected file: <span className="font-medium text-brand-secondary">{fileName}</span></p>}
        </div>
      )}

      {activeTab === 'url' && (
        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div>
            <label htmlFor="youtube-url" className="text-sm font-medium text-content/80 block mb-2">YouTube Video URL</label>
            <input 
              type="url" 
              id="youtube-url" 
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="e.g., https://www.youtube.com/watch?v=..." 
              className="w-full bg-base-300 border border-base-300/50 text-white py-2 px-3 rounded-lg focus:outline-none focus:border-brand-primary transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold text-white rounded-lg shadow-md transition-all duration-300 ease-in-out bg-brand-secondary hover:bg-brand-secondary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-brand-secondary"
          >
            Load Video
          </button>
        </form>
      )}
    </div>
  );
};

export default InputSource;
