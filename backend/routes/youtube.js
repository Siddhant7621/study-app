import express from 'express';
import axios from 'axios';

const router = express.Router();

// Get YouTube videos by topic
router.get('/search', async (req, res) => {
  try {
    const { topic } = req.query;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/search',
      {
        params: {
          part: 'snippet',
          q: `${topic} physics educational tutorial`,
          type: 'video',
          maxResults: 6,
          key: process.env.YOUTUBE_API_KEY,
          videoDuration: 'medium', // medium length videos (4-20 mins)
          relevanceLanguage: 'en',
          topicId: '/m/02vxb' // Education topic
        }
      }
    );

    // Get video durations
    const videoIds = response.data.items.map(item => item.id.videoId).join(',');
    
    const durationResponse = await axios.get(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        params: {
          part: 'contentDetails,statistics',
          id: videoIds,
          key: process.env.YOUTUBE_API_KEY
        }
      }
    );

    // Combine data
    const videos = response.data.items.map((item, index) => {
      const duration = durationResponse.data.items[index]?.contentDetails?.duration || 'PT0M0S';
      const stats = durationResponse.data.items[index]?.statistics || {};
      
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
        channel: item.snippet.channelTitle,
        views: stats.viewCount ? `${(stats.viewCount / 1000).toFixed(0)}K views` : 'No views',
        duration: formatDuration(duration),
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
      };
    });

    res.json(videos);
    
  } catch (error) {
    console.error('YouTube API error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch YouTube videos',
      details: error.response?.data || error.message
    });
  }
});

// Helper function to format duration
function formatDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  if (hours) {
    return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.padStart(2, '0')}`;
}

export default router;