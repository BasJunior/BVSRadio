// Radio Player Component
import React, { useState } from 'react';

export default function RadioPlayer({ station }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(70);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
        // In production, control actual audio playback here
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
                {station.logo_url && (
                    <img 
                        src={station.logo_url} 
                        alt={station.name}
                        className="w-16 h-16 rounded-full mr-4"
                    />
                )}
                <div>
                    <h3 className="text-xl font-bold">{station.name}</h3>
                    <p className="text-gray-600">{station.genre}</p>
                </div>
            </div>
            
            <div className="flex items-center justify-center space-x-4 mb-4">
                <button 
                    onClick={togglePlay}
                    className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700"
                >
                    {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
            </div>
            
            <div className="flex items-center space-x-2">
                <span className="text-sm">🔊</span>
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="flex-1"
                />
                <span className="text-sm">{volume}%</span>
            </div>
        </div>
    );
}
