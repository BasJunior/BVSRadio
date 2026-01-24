// User Profile Component
import React from 'react';

export default function UserProfile({ user, isOwnProfile, onFollow, onMessage }) {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start space-x-4">
                <img 
                    src={user.avatar_url || '/default-avatar.png'} 
                    alt={user.username}
                    className="w-24 h-24 rounded-full"
                />
                <div className="flex-1">
                    <h2 className="text-2xl font-bold">{user.full_name}</h2>
                    <p className="text-gray-600">@{user.username}</p>
                    {user.bio && (
                        <p className="mt-2 text-gray-700">{user.bio}</p>
                    )}
                    
                    <div className="flex space-x-4 mt-4">
                        <div>
                            <span className="font-bold">{user.followers_count || 0}</span>
                            <span className="text-gray-600"> Followers</span>
                        </div>
                        <div>
                            <span className="font-bold">{user.following_count || 0}</span>
                            <span className="text-gray-600"> Following</span>
                        </div>
                    </div>
                    
                    {!isOwnProfile && (
                        <div className="flex space-x-2 mt-4">
                            <button 
                                onClick={onFollow}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Follow
                            </button>
                            <button 
                                onClick={onMessage}
                                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                            >
                                Message
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
