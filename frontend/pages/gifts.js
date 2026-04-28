// Gifts Page - cross-platform gifts from organizations to users
import React, { useState, useEffect } from 'react';
import GiftCard from '../components/GiftCard';
import SendGiftForm from '../components/SendGiftForm';
import { API_BASE_URL } from '../utils/helpers';

const TABS = [
    { id: 'received', label: '🎁 My Gifts' },
    { id: 'send', label: '➕ Send a Gift' },
    { id: 'about', label: 'ℹ️ About' }
];

export default function Gifts() {
    const [activeTab, setActiveTab] = useState('received');
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // In production, get userId from auth context/session
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

    useEffect(() => {
        if (activeTab === 'received' && userId) {
            fetchReceivedGifts();
        }
    }, [activeTab, userId]);

    const fetchReceivedGifts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_BASE_URL}/api/gifts/received`, {
                headers: { 'x-user-id': userId }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to fetch gifts');
            }

            const data = await response.json();
            setGifts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClaimGift = async (giftId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/gifts/${giftId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': userId
                },
                body: JSON.stringify({ status: 'claimed' })
            });

            if (response.ok) {
                fetchReceivedGifts();
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleGiftSent = () => {
        // Optionally switch to received tab after sending
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">🎁 BVSRadio Gifts</h1>
                    <p className="text-lg">Cross-platform gifts from organizations to users — powered by local payment methods</p>
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-white shadow">
                <div className="container mx-auto px-4 flex gap-0">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-4 font-semibold text-sm border-b-2 transition-colors ${
                                activeTab === tab.id
                                    ? 'border-purple-600 text-purple-700'
                                    : 'border-transparent text-gray-600 hover:text-purple-600'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Received Gifts Tab */}
                {activeTab === 'received' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Gifts You've Received</h2>

                        {!userId && (
                            <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded mb-6">
                                Please log in to view your received gifts.
                            </div>
                        )}

                        {loading && (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                                <p className="mt-4 text-gray-600">Loading gifts...</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                                {error}
                            </div>
                        )}

                        {!loading && !error && userId && gifts.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                                <p className="text-5xl mb-4">🎁</p>
                                <p className="text-gray-500 text-lg">No gifts received yet.</p>
                                <p className="text-gray-400 text-sm mt-1">Organizations can send you gifts using local payment methods.</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {gifts.map(gift => (
                                <GiftCard key={gift.id} gift={gift} onClaim={handleClaimGift} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Send a Gift Tab */}
                {activeTab === 'send' && (
                    <div className="max-w-xl mx-auto">
                        <SendGiftForm onGiftSent={handleGiftSent} />
                    </div>
                )}

                {/* About Tab */}
                {activeTab === 'about' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-lg shadow-md p-6 space-y-5">
                            <h2 className="text-2xl font-bold text-purple-700">About Cross-Platform Gifts</h2>
                            <p className="text-gray-700">
                                BVSRadio Gifts enables organizations and businesses to send digital gifts to users across
                                multiple platforms using locally available payment methods.
                            </p>

                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Supported Payment Methods</h3>
                                <ul className="grid grid-cols-2 gap-2">
                                    {[
                                        { name: 'Ecocash', desc: 'Mobile money' },
                                        { name: 'OneMoney', desc: 'Mobile money' },
                                        { name: 'Telecash', desc: 'Mobile money' },
                                        { name: 'Visa', desc: 'Card payment' },
                                        { name: 'Mastercard', desc: 'Card payment' },
                                        { name: 'Paynow', desc: 'All methods' }
                                    ].map(method => (
                                        <li key={method.name} className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2">
                                            <span className="text-purple-600 font-semibold text-sm">{method.name}</span>
                                            <span className="text-gray-500 text-xs">{method.desc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">How It Works</h3>
                                <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
                                    <li>An organization creates a gift for a BVSRadio user.</li>
                                    <li>The organization pays via Paynow using their preferred local method.</li>
                                    <li>The user receives a notification and can claim the gift.</li>
                                    <li>All payments are processed securely through Paynow's gateway.</li>
                                </ol>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Gift Statuses</h3>
                                <ul className="space-y-1 text-sm">
                                    <li><span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-medium mr-2">Pending</span>Gift created, awaiting payment</li>
                                    <li><span className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium mr-2">Paid</span>Payment confirmed, ready to claim</li>
                                    <li><span className="inline-block bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium mr-2">Claimed</span>User has claimed the gift</li>
                                    <li><span className="inline-block bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-medium mr-2">Cancelled</span>Gift was cancelled</li>
                                </ul>
                            </div>

                            <p className="text-xs text-gray-500">
                                All payments are processed through <a href="https://www.paynow.co.zw" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Paynow</a>, Zimbabwe's leading payment platform. No sensitive payment information is stored on BVSRadio servers.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
