// Home page
import React from 'react';
import Layout from '../components/Layout';

export default function Home() {
    // In a real application, this would come from authentication
    // For demo purposes, we'll use a sample user ID
    const userId = 1;

    return (
        <Layout userId={userId}>
            <div className="space-y-8">
                <div className="text-center py-12">
                    <h1 className="text-5xl font-bold text-blue-600 mb-4">
                        Welcome to BVSRadio
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Your all-in-one platform for music streaming, shopping, and social connections
                    </p>
                    
                    <div className="flex justify-center gap-4 mb-12">
                        <a 
                            href="/demo" 
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                            Try Demo
                        </a>
                        <a 
                            href="https://github.com/BasJunior/BVSRadio" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-900 transition-colors font-semibold"
                        >
                            View on GitHub
                        </a>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg max-w-3xl mx-auto">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">
                            🤖 New: AI Assistant Powered by OpenAI
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Get intelligent help with shopping, music discovery, and social features. 
                            Our AI assistant is context-aware and provides personalized recommendations.
                        </p>
                        <p className="text-sm text-gray-600">
                            Click the chat icon in the bottom-right corner to start chatting!
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-4xl mb-4">🎵</div>
                        <h3 className="text-xl font-bold mb-2">Music Streaming</h3>
                        <p className="text-gray-600">
                            Listen to live radio stations, create playlists, and discover new music.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-4xl mb-4">🛍️</div>
                        <h3 className="text-xl font-bold mb-2">E-commerce</h3>
                        <p className="text-gray-600">
                            Browse and purchase music gear, subscriptions, and merchandise.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-4xl mb-4">👥</div>
                        <h3 className="text-xl font-bold mb-2">Social Network</h3>
                        <p className="text-gray-600">
                            Connect with music enthusiasts, share playlists, and send messages.
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
