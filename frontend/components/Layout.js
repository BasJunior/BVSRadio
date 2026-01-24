// Main layout component
import React from 'react';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-blue-600 text-white p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">BVSRadio</h1>
                    <nav>
                        <a href="/" className="mx-2 hover:underline">Home</a>
                        <a href="/radio" className="mx-2 hover:underline">Radio</a>
                        <a href="/shop" className="mx-2 hover:underline">Shop</a>
                        <a href="/social" className="mx-2 hover:underline">Social</a>
                        <a href="/profile" className="mx-2 hover:underline">Profile</a>
                    </nav>
                </div>
            </header>
            <main className="container mx-auto p-4">
                {children}
            </main>
            <footer className="bg-gray-800 text-white p-4 mt-8">
                <div className="container mx-auto text-center">
                    <p>&copy; 2026 BVSRadio. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
