export const getYoutubeEmbedUrl = (url: string): string | null => {
  let videoId: string | null = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.substring(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v');
    }
    
    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch (e) {
    // Invalid URL format, try regex fallback
  }

  // Regex fallback for non-standard URLs
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  videoId = match ? match[1] : null;

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  return null;
};
