// Activity Feed Component
import React from 'react';

export default function ActivityFeed({ activities }) {
    const formatActivity = (activity) => {
        const data = typeof activity.activity_data === 'string' 
            ? JSON.parse(activity.activity_data) 
            : activity.activity_data;
            
        switch (activity.activity_type) {
            case 'playlist_created':
                return `created a playlist "${data.playlist_name}"`;
            case 'product_purchased':
                return `purchased ${data.product_name}`;
            case 'track_liked':
                return `liked "${data.track_name}"`;
            case 'user_followed':
                return `followed ${data.username}`;
            default:
                return 'did something';
        }
    };

    const getTimeAgo = (timestamp) => {
        const now = new Date();
        const then = new Date(timestamp);
        const seconds = Math.floor((now - then) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Activity Feed</h2>
            <div className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b">
                        <img 
                            src={activity.avatar_url || '/default-avatar.png'} 
                            alt={activity.username}
                            className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                            <p className="text-gray-800">
                                <span className="font-semibold">{activity.username}</span>
                                {' '}
                                {formatActivity(activity)}
                            </p>
                            <p className="text-gray-500 text-sm">
                                {getTimeAgo(activity.created_at)}
                            </p>
                        </div>
                    </div>
                ))}
                {activities.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No activities yet</p>
                )}
            </div>
        </div>
    );
}
