import React from 'react';

interface VideoPlayerProps {
  src: string;
  inputType: 'file' | 'url';
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, inputType }) => {
  return (
    <div className="bg-base-200 p-2 rounded-lg shadow-lg">
      {inputType === 'file' && (
        <video
          controls
          key={src} // Add key to force re-render on src change
          src={src}
          className="w-full h-auto rounded-md aspect-video"
        >
          Your browser does not support the video tag.
        </video>
      )}
      {inputType === 'url' && (
        <div className="w-full aspect-video">
          <iframe
            src={src}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-md"
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;