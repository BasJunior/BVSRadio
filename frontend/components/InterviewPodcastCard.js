// Interview Podcast Card Component
import React from 'react';

function formatDuration(seconds) {
    if (!seconds) return null;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
        return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${m}:${String(s).padStart(2, '0')}`;
}

export default function InterviewPodcastCard({ podcast, onPlay }) {
    const duration = formatDuration(podcast.duration);

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative">
                {podcast.thumbnail_url ? (
                    <img
                        src={podcast.thumbnail_url}
                        alt={podcast.title}
                        className="w-full h-48 object-cover"
                    />
                ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-4xl">🎙️</span>
                    </div>
                )}
                {duration && (
                    <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {duration}
                    </span>
                )}
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold mb-1 line-clamp-2">{podcast.title}</h3>
                <p className="text-sm text-gray-500 mb-1">
                    Host: <span className="font-medium text-gray-700">{podcast.host}</span>
                    {podcast.guest && (
                        <> &middot; Guest: <span className="font-medium text-gray-700">{podcast.guest}</span></>
                    )}
                </p>
                {podcast.category && (
                    <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded mb-2">
                        {podcast.category}
                    </span>
                )}
                {podcast.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{podcast.description}</p>
                )}
                <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400">
                        {podcast.view_count} view{podcast.view_count !== 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={() => onPlay(podcast)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                    >
                        ▶ Watch
                    </button>
                </div>
            </div>
        </div>
    );
}
