// Main index page - redirects to store
import React from 'react';
import Link from 'next/link';

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <div className="text-center text-white px-4">
                <h1 className="text-6xl font-bold mb-4">🎵 BVSRadio</h1>
                <p className="text-2xl mb-8">Stream Music. Shop Products. Connect with Friends.</p>
                <div className="space-x-4">
                    <Link href="/store">
                        <a className="inline-block bg-white text-purple-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                            Visit Store
                        </a>
                    </Link>
                    <a 
                        href="https://github.com/BasJunior/BVSRadio"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-gray-800 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-700 transition-colors shadow-lg"
                    >
                        GitHub
                    </a>
                </div>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6">
                        <div className="text-4xl mb-2">🎧</div>
                        <h3 className="text-xl font-bold mb-2">Live Radio</h3>
                        <p className="text-sm">Stream your favorite stations</p>
                    </div>
                    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6">
                        <div className="text-4xl mb-2">🛍️</div>
                        <h3 className="text-xl font-bold mb-2">E-commerce</h3>
                        <p className="text-sm">Wolf Beat Packs & Mixtapes</p>
                    </div>
                    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6">
                        <div className="text-4xl mb-2">👥</div>
                        <h3 className="text-xl font-bold mb-2">Social</h3>
                        <p className="text-sm">Connect with music lovers</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
