// Example demo page showcasing AI Assistant integration
import React from 'react';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import RadioPlayer from '../components/RadioPlayer';

export default function Demo() {
    // In a real application, this would come from authentication
    const userId = 1;

    const sampleProducts = [
        {
            id: 1,
            name: 'Wireless Headphones',
            description: 'High-quality wireless headphones with noise cancellation',
            price: 199.99,
            image: 'https://via.placeholder.com/300x200?text=Headphones'
        },
        {
            id: 2,
            name: 'Bluetooth Speaker',
            description: 'Portable Bluetooth speaker with amazing sound',
            price: 79.99,
            image: 'https://via.placeholder.com/300x200?text=Speaker'
        }
    ];

    return (
        <Layout userId={userId}>
            <div className="space-y-8">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg">
                    <h1 className="text-4xl font-bold mb-4">Welcome to BVSRadio</h1>
                    <p className="text-xl mb-6">
                        Experience music streaming, shop for audio gear, and connect with music lovers - all enhanced by our AI assistant!
                    </p>
                    <div className="bg-white/20 p-4 rounded-lg">
                        <p className="text-sm">
                            💡 <strong>Try the AI Assistant:</strong> Click the chat icon in the bottom-right corner to get help with:
                        </p>
                        <ul className="list-disc list-inside mt-2 text-sm">
                            <li>Finding the perfect products</li>
                            <li>Discovering new playlists and music</li>
                            <li>Managing your cart and orders</li>
                            <li>Connecting with other users</li>
                        </ul>
                    </div>
                </div>

                {/* Radio Player Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">Now Playing</h2>
                    <RadioPlayer />
                </div>

                {/* Products Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sampleProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>

                {/* AI Assistant Info */}
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-3 text-blue-900">
                        🤖 AI Assistant Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h4 className="font-semibold text-blue-800 mb-2">E-commerce Help</h4>
                            <p className="text-sm text-gray-700">
                                Get product recommendations, manage your cart, and track orders with intelligent assistance.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-blue-800 mb-2">Music Discovery</h4>
                            <p className="text-sm text-gray-700">
                                Find new tracks, create playlists, and get personalized music suggestions based on your taste.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-blue-800 mb-2">Social Features</h4>
                            <p className="text-sm text-gray-700">
                                Connect with friends, send messages, and explore what's trending in the community.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sample Interactions */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Try asking the AI:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded border border-gray-200">
                            <p className="text-sm font-medium text-gray-700">
                                "What are your most popular wireless headphones?"
                            </p>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-200">
                            <p className="text-sm font-medium text-gray-700">
                                "Suggest a playlist for working out"
                            </p>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-200">
                            <p className="text-sm font-medium text-gray-700">
                                "How do I add items to my cart?"
                            </p>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-200">
                            <p className="text-sm font-medium text-gray-700">
                                "Show me products under $100"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
