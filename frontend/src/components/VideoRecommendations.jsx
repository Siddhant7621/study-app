import React, { useState, useEffect } from "react";
import { PlayCircle, AccessTime } from "@mui/icons-material";
import axios from "axios";

const VideoRecommendations = ({ topic = "physics" }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, [topic]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `/api/youtube/search?topic=${encodeURIComponent(topic)}`
      );
      setVideos(response.data);
    } catch (err) {
      console.error("Failed to fetch videos:", err);
      setError("Failed to load video recommendations");
      // Fallback to mock data if API fails
      setVideos(getMockVideos(topic));
    } finally {
      setLoading(false);
    }
  };

  const getMockVideos = (currentTopic) => {
    const mockVideos = {
      physics: [
        {
          id: "d_BhzHVV4aQ",
          title: "Physics - Basic Introduction",
          thumbnail: "https://i.ytimg.com/vi/d_BhzHVV4aQ/mqdefault.jpg",
          duration: "53:37",
          channel: "The Organic Chemistry Tutor",
          views: "2.1M views",
          url: "https://www.youtube.com/watch?v=d_BhzHVV4aQ",
        },
        {
          id: "pyk8eQ0B3CM",
          title: "Newton's Laws of Motion",
          thumbnail: "https://i.ytimg.com/vi/pyk8eQ0B3CM/mqdefault.jpg",
          duration: "16:47",
          channel: "Professor Dave Explains",
          views: "1.5M views",
          url: "https://www.youtube.com/watch?v=pyk8eQ0B3CM",
        },
      ],
      chemistry: [
        {
          id: "74I5Xq6t2o",
          title: "Introduction to Chemistry",
          thumbnail: "https://i.ytimg.com/vi/74I5Xq6t2o/mqdefault.jpg",
          duration: "52:09",
          channel: "The Organic Chemistry Tutor",
          views: "1.8M views",
          url: "https://www.youtube.com/watch?v=74I5Xq6t2o",
        },
      ],
      mathematics: [
        {
          id: "zkCF7A3fro",
          title: "Algebra for Beginners",
          thumbnail: "https://i.ytimg.com/vi/zkCF7A3fro/mqdefault.jpg",
          duration: "23:05",
          channel: "Math and Science",
          views: "1.2M views",
          url: "https://www.youtube.com/watch?v=zkCF7A3fro",
        },
      ],
    };

    return mockVideos[currentTopic?.toLowerCase()] || mockVideos.physics;
  };

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <PlayCircle className="text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Recommended Videos
          </h2>
        </div>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <PlayCircle className="text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">
          Recommended Videos
        </h2>
      </div>

      <div className="mb-6">
        <p className="text-gray-600 mb-2">
          Related to:{" "}
          <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
            {topic || "Physics"}
          </span>
        </p>
        {error && (
          <p className="text-yellow-600 text-sm bg-yellow-50 px-3 py-2 rounded">
            {error} (showing sample videos)
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer hover:-translate-y-1 border border-gray-100"
            onClick={() => window.open(video.url, "_blank")}
          >
            <div className="relative">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover rounded-t-lg"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Video+Thumbnail";
                }}
              />
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                {video.duration}
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight text-sm">
                {video.title}
              </h3>

              <p className="text-gray-600 text-xs mb-3">{video.channel}</p>

              <div className="flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <AccessTime className="text-xs" />
                  <span>{video.duration}</span>
                </div>
                <span>{video.views}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No video recommendations available for this topic.
        </div>
      )}
    </div>
  );
};

export default VideoRecommendations;
