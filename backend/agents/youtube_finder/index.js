const axios = require('axios');
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class YouTubeFinderAgent {
  async run(input) {
    try {
      // Handle both generic prompt format and specific agent format
      const { prompt, query_or_playlist_url, limit = 20, sortBy = 'relevance', duration = 'any' } = input;
      const searchQuery = query_or_playlist_url || prompt;

      if (!searchQuery) {
        throw new Error('Please provide a search query or playlist URL');
      }

      // If it's a playlist URL, extract the playlist ID
      if (searchQuery.includes('youtube.com/playlist')) {
        const playlistId = this.extractPlaylistId(searchQuery);
        if (playlistId) {
          return await this.getPlaylistVideos(playlistId, limit);
        }
      }

      // Otherwise, treat it as a search query
      return await this.searchVideos(searchQuery, limit, sortBy, duration);

    } catch (error) {
      console.error('YouTube Finder Error:', error);
      return {
        success: false,
        error: error.message,
        videos: []
      };
    }
  }

  async getVideoDetails(videoIds) {
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        throw new Error('YouTube API key not configured');
      }

      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`;
      const response = await axios.get(detailsUrl);

      // Create a map of videoId to details for easy lookup
      const detailsMap = {};
      response.data.items.forEach(item => {
        detailsMap[item.id] = {
          contentDetails: item.contentDetails,
          statistics: item.statistics
        };
      });

      // Return details in the same order as the input videoIds
      return videoIds.split(',').map(id => detailsMap[id] || {});
    } catch (error) {
      console.error('Failed to get video details:', error);
      // Return empty objects for all videos if details fetch fails
      return videoIds.split(',').map(() => ({}));
    }
  }

  async searchVideos(query, limit, sortBy, duration, minViews) {
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        throw new Error('YouTube API key not configured');
      }

      // Use Groq to enhance the search query for better educational content
      const enhancedQuery = await this.enhanceSearchQuery(query);

      // Build search parameters
      let searchParams = `part=snippet&q=${encodeURIComponent(enhancedQuery)}&type=video&order=${sortBy}&maxResults=${Math.min(limit, 50)}&key=${apiKey}`;

      // Add duration filter
      if (duration !== 'any') {
        searchParams += `&videoDuration=${duration}`;
      }

      const searchUrl = `https://www.googleapis.com/youtube/v3/search?${searchParams}`;

      const response = await axios.get(searchUrl);
      const videos = response.data.items || [];

      // Get detailed information for each video
      const videoDetails = await this.getVideoDetails(videos.map(v => v.id.videoId).join(','));

      let formattedVideos = videos.map((video, index) => ({
        title: video.snippet.title,
        channel: video.snippet.channelTitle,
        description: video.snippet.description,
        videoId: video.id.videoId,
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
        publishedAt: video.snippet.publishedAt,
        duration: videoDetails[index]?.contentDetails?.duration || 'Unknown',
        viewCount: parseInt(videoDetails[index]?.statistics?.viewCount || '0'),
        likeCount: parseInt(videoDetails[index]?.statistics?.likeCount || '0')
      }));

      // Filter out shorts (videos shorter than 60 seconds)
      formattedVideos = formattedVideos.filter(video => {
        if (video.duration === 'Unknown') return true; // Keep if duration unknown
        const durationInSeconds = this.parseDurationToSeconds(video.duration);
        return durationInSeconds >= 60; // Exclude videos shorter than 60 seconds (shorts)
      });

      // Apply client-side filtering for minimum views
      if (minViews) {
        formattedVideos = formattedVideos.filter(video => video.viewCount >= parseInt(minViews));
      }

      // Sort videos based on criteria
      if (sortBy === 'viewCount') {
        formattedVideos.sort((a, b) => b.viewCount - a.viewCount);
      } else if (sortBy === 'rating') {
        formattedVideos.sort((a, b) => b.likeCount - a.likeCount);
      }

      return {
        success: true,
        query: enhancedQuery,
        totalResults: formattedVideos.length,
        videos: formattedVideos,
        filters: {
          sortBy,
          duration,
          minViews: minViews || 0
        },
        downloadAvailable: false
      };

    } catch (error) {
      throw new Error(`YouTube search failed: ${error.message}`);
    }
  }

  async getPlaylistVideos(playlistId, limit) {
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        throw new Error('YouTube API key not configured');
      }

      const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${limit}&key=${apiKey}`;

      const response = await axios.get(playlistUrl);
      const videos = response.data.items || [];

      // Get video details
      const videoIds = videos.map(v => v.snippet.resourceId.videoId).join(',');
      const videoDetails = await this.getVideoDetails(videoIds);

      const formattedVideos = videos.map((video, index) => ({
        title: video.snippet.title,
        channel: video.snippet.channelTitle,
        description: video.snippet.description,
        videoId: video.snippet.resourceId.videoId,
        url: `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`,
        thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
        publishedAt: video.snippet.publishedAt,
        duration: videoDetails[index]?.contentDetails?.duration || 'Unknown',
        viewCount: videoDetails[index]?.statistics?.viewCount || '0',
        likeCount: videoDetails[index]?.statistics?.likeCount || '0'
      }));

      return {
        success: true,
        playlistId,
        totalResults: formattedVideos.length,
        videos: formattedVideos,
        downloadAvailable: false
      };

    } catch (error) {
      throw new Error(`Playlist fetch failed: ${error.message}`);
    }
  }

  async getSingleVideo(url) {
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        throw new Error('YouTube API key not configured');
      }

      // Extract video ID from URL
      const videoId = this.extractVideoId(url);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      // Get video details
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`;
      const response = await axios.get(detailsUrl);

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error('Video not found');
      }

      const video = response.data.items[0];

      // Try to get transcript
      const transcript = await this.getTranscript(videoId);

      const formattedVideo = {
        title: video.snippet.title,
        channel: video.snippet.channelTitle,
        description: video.snippet.description,
        videoId: video.id,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        thumbnail: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url,
        publishedAt: video.snippet.publishedAt,
        duration: video.contentDetails?.duration || 'Unknown',
        viewCount: parseInt(video.statistics?.viewCount || '0'),
        likeCount: parseInt(video.statistics?.likeCount || '0'),
        transcript: transcript,
        tags: video.snippet.tags || []
      };

      return {
        success: true,
        video: formattedVideo,
        downloadAvailable: false
      };

    } catch (error) {
      throw new Error(`Video fetch failed: ${error.message}`);
    }
  }

  parseDurationToSeconds(duration) {
    if (!duration || duration === 'Unknown') return 0;

    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);

    return hours * 3600 + minutes * 60 + seconds;
  }

  extractVideoId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  async getTranscript(videoId) {
    try {
      // Try to get captions from YouTube API
      const apiKey = process.env.YOUTUBE_API_KEY;
      const captionsUrl = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${apiKey}`;

      const response = await axios.get(captionsUrl);
      const captions = response.data.items || [];

      if (captions.length > 0) {
        // Get the first available caption track
        const captionId = captions[0].id;
        const captionDataUrl = `https://www.googleapis.com/youtube/v3/captions/${captionId}?key=${apiKey}`;

        try {
          const captionResponse = await axios.get(captionDataUrl, {
            headers: {
              'Accept': 'application/json'
            }
          });

          return {
            available: true,
            text: captionResponse.data.body || 'Transcript available but could not be retrieved',
            language: captions[0].snippet.language
          };
        } catch (captionError) {
          return {
            available: true,
            text: 'Transcript available but requires manual download',
            language: captions[0].snippet.language,
            note: 'Transcript exists but cannot be automatically retrieved'
          };
        }
      }

      return {
        available: false,
        text: 'No transcript available for this video',
        note: 'Video may not have captions enabled'
      };

    } catch (error) {
      return {
        available: false,
        text: 'Failed to retrieve transcript',
        error: error.message
      };
    }
  }

  async enhanceSearchQuery(query) {
    try {
      const prompt = `Enhance this YouTube search query to find the best educational/lecture videos. Make it more specific for academic content, full lectures, and exclude ads/shorts. Add terms like "full lecture", "complete course", "tutorial", "educational video" and exclude terms like "shorts", "clip", "trailer", "preview". Original query: "${query}"

Return only the enhanced search query, no explanation.`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama3-70b-8192",
        temperature: 0.3,
        max_tokens: 100,
      });

      return completion.choices[0]?.message?.content?.trim() || query;
    } catch (error) {
      console.error('Query enhancement failed:', error);
      return query;
    }
  }
}

module.exports = new YouTubeFinderAgent();
