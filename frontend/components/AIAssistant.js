// AI Assistant Chat Widget Component
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function AIAssistant({ userId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load conversation history when widget opens
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            loadHistory();
        }
    }, [isOpen]);

    const loadHistory = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/ai/history`, {
                headers: { 'x-user-id': userId }
            });
            
            if (response.data.history && response.data.history.length > 0) {
                const formattedMessages = response.data.history.map(msg => ({
                    role: msg.role,
                    content: msg.message,
                    timestamp: msg.created_at
                }));
                setMessages(formattedMessages);
            }
        } catch (err) {
            console.error('Failed to load chat history:', err);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        
        if (!inputMessage.trim()) return;

        const userMessage = {
            role: 'user',
            content: inputMessage,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                `${API_BASE_URL}/ai/chat`,
                { 
                    message: inputMessage,
                    context: {
                        timestamp: new Date().toISOString(),
                        page: window.location.pathname
                    }
                },
                {
                    headers: { 'x-user-id': userId }
                }
            );

            const assistantMessage = {
                role: 'assistant',
                content: response.data.response,
                timestamp: new Date().toISOString(),
                disclaimer: response.data.disclaimer
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            console.error('Chat error:', err);
            
            const errorMessage = err.response?.data?.fallback || 
                'Sorry, I encountered an error. Please try again or contact support.';
            
            setError(errorMessage);
            
            // Add error message to chat
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: errorMessage,
                timestamp: new Date().toISOString(),
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearHistory = async () => {
        if (!window.confirm('Are you sure you want to clear your chat history?')) return;

        try {
            await axios.delete(`${API_BASE_URL}/ai/history`, {
                headers: { 'x-user-id': userId }
            });
            setMessages([]);
        } catch (err) {
            console.error('Failed to clear history:', err);
        }
    };

    const toggleWidget = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Chat Widget */}
            {isOpen && (
                <div className="bg-white rounded-lg shadow-2xl w-96 h-[500px] flex flex-col mb-4">
                    {/* Header */}
                    <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg">AI Assistant</h3>
                            <p className="text-xs opacity-80">Powered by BVSRadio</p>
                        </div>
                        <button
                            onClick={clearHistory}
                            className="text-white hover:bg-blue-700 px-2 py-1 rounded text-sm"
                            title="Clear history"
                        >
                            Clear
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 mt-8">
                                <p className="text-lg mb-2">👋 Hi! I'm your AI assistant</p>
                                <p className="text-sm">Ask me about products, playlists, or anything else!</p>
                            </div>
                        )}
                        
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg ${
                                        msg.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : msg.isError
                                            ? 'bg-red-100 text-red-800 border border-red-300'
                                            : 'bg-white text-gray-800 border border-gray-200'
                                    }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    {msg.disclaimer && (
                                        <p className="text-xs mt-2 opacity-70 italic border-t pt-1">
                                            {msg.disclaimer}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>

                    {/* AI Disclaimer */}
                    <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200">
                        <p className="text-xs text-yellow-800">
                            ⚠️ AI responses may not always be accurate. Verify important information.
                        </p>
                    </div>

                    {/* Input Area */}
                    <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !inputMessage.trim()}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={toggleWidget}
                className="bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110"
                aria-label="Toggle AI Assistant"
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>
        </div>
    );
}
