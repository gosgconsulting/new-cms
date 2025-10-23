import React, { useState } from 'react';
import { Video } from 'lucide-react';

interface VideoEditorProps {
  videoUrl?: string;
  videoTitle?: string;
  videoCaption?: string;
  onUrlChange?: (url: string) => void;
  onTitleChange?: (title: string) => void;
  onCaptionChange?: (caption: string) => void;
  className?: string;
}

export const VideoEditor: React.FC<VideoEditorProps> = ({
  videoUrl = '',
  videoTitle = '',
  videoCaption = '',
  onUrlChange,
  onTitleChange,
  onCaptionChange,
  className = ''
}) => {
  const [url, setUrl] = useState<string>(videoUrl);
  const [title, setTitle] = useState<string>(videoTitle);
  const [caption, setCaption] = useState<string>(videoCaption);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    onUrlChange?.(newUrl);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onTitleChange?.(newTitle);
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCaption = e.target.value;
    setCaption(newCaption);
    onCaptionChange?.(newCaption);
  };

  // Function to extract video ID from YouTube or Vimeo URL
  const getVideoId = (url: string) => {
    if (!url) return null;
    
    // YouTube patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return { id: youtubeMatch[1], type: 'youtube' };
    }
    
    // Vimeo patterns
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return { id: vimeoMatch[1], type: 'vimeo' };
    }
    
    return null;
  };

  const videoInfo = getVideoId(url);

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Video URL (YouTube or Vimeo)
        </label>
        <input
          type="text"
          value={url}
          onChange={handleUrlChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="https://www.youtube.com/watch?v=..."
        />
        {url && !videoInfo && (
          <p className="text-sm text-red-600 mt-1">
            Please enter a valid YouTube or Vimeo URL
          </p>
        )}
      </div>
      
      {videoInfo && (
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <div className="flex items-center mb-2">
            <Video className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              {videoInfo.type === 'youtube' ? 'YouTube' : 'Vimeo'} Video Preview
            </span>
          </div>
          <div className="aspect-video bg-gray-200 rounded-md flex items-center justify-center">
            {videoInfo.type === 'youtube' ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoInfo.id}`}
                title="YouTube video"
                className="w-full h-full rounded-md"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <iframe
                src={`https://player.vimeo.com/video/${videoInfo.id}`}
                title="Vimeo video"
                className="w-full h-full rounded-md"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Video Title
        </label>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter video title"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Video Caption
        </label>
        <input
          type="text"
          value={caption}
          onChange={handleCaptionChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter a caption for this video"
        />
      </div>
    </div>
  );
};

export default VideoEditor;
