// SendGiftForm Component - allows organizations to send gifts to users via Paynow
import React, { useState, useEffect } from 'react';
import { formatCurrency, API_BASE_URL } from '../utils/helpers';

const PAYMENT_METHODS = [
    { value: 'ecocash', label: 'Ecocash' },
    { value: 'onemoney', label: 'OneMoney' },
    { value: 'telecash', label: 'Telecash' },
    { value: 'visa', label: 'Visa' },
    { value: 'mastercard', label: 'Mastercard' },
    { value: 'paynow', label: 'Paynow (any method)' }
];

export default function SendGiftForm({ onGiftSent }) {
    const [organizations, setOrganizations] = useState([]);
    const [formData, setFormData] = useState({
        organization_id: '',
        recipient_id: '',
        amount: '',
        currency: 'USD',
        message: '',
        payment_method: 'paynow'
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/organizations`);
            if (response.ok) {
                const data = await response.json();
                setOrganizations(data);
            }
        } catch (err) {
            // Non-critical: organizations list will be empty
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/gifts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    organization_id: parseInt(formData.organization_id),
                    recipient_id: parseInt(formData.recipient_id),
                    amount: parseFloat(formData.amount)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send gift');
            }

            setResult(data);
            if (onGiftSent) onGiftSent(data);

            // Reset form
            setFormData(prev => ({
                ...prev,
                recipient_id: '',
                amount: '',
                message: ''
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-1 text-purple-700">Send a Gift</h2>
            <p className="text-gray-500 text-sm mb-5">
                Send a gift from your organization to a BVSRadio user using local payment methods.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Organization */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organization
                    </label>
                    {organizations.length > 0 ? (
                        <select
                            name="organization_id"
                            value={formData.organization_id}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        >
                            <option value="">Select organization...</option>
                            {organizations.map(org => (
                                <option key={org.id} value={org.id}>
                                    {org.name} {org.is_verified ? '✓' : ''}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="number"
                            name="organization_id"
                            value={formData.organization_id}
                            onChange={handleChange}
                            placeholder="Organization ID"
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                    )}
                </div>

                {/* Recipient */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recipient User ID
                    </label>
                    <input
                        type="number"
                        name="recipient_id"
                        value={formData.recipient_id}
                        onChange={handleChange}
                        placeholder="Enter recipient user ID"
                        required
                        min="1"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                </div>

                {/* Amount and Currency */}
                <div className="flex gap-3">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount
                        </label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            placeholder="0.00"
                            required
                            min="0.01"
                            step="0.01"
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                    </div>
                    <div className="w-28">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Currency
                        </label>
                        <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        >
                            <option value="USD">USD</option>
                            <option value="ZWL">ZWL</option>
                        </select>
                    </div>
                </div>

                {/* Payment Method */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PAYMENT_METHODS.map(method => (
                            <label
                                key={method.value}
                                className={`flex items-center gap-2 border rounded px-3 py-2 cursor-pointer transition-colors ${
                                    formData.payment_method === method.value
                                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value={method.value}
                                    checked={formData.payment_method === method.value}
                                    onChange={handleChange}
                                    className="accent-purple-600"
                                />
                                <span className="text-sm font-medium">{method.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Message */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message <span className="text-gray-400">(optional)</span>
                    </label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Add a personal message..."
                        rows={3}
                        maxLength={500}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Sending Gift...' : 'Send Gift via Paynow'}
                </button>
            </form>

            {/* Success Result */}
            {result && (
                <div className="mt-6 bg-green-50 border border-green-300 rounded-lg p-4">
                    <h3 className="font-bold text-green-800 mb-2">🎁 Gift Created Successfully!</h3>
                    <p className="text-sm text-green-700 mb-3">
                        Gift of {formatCurrency(result.gift.amount, result.gift.currency)} created for the recipient.
                        Complete the payment using the Paynow button below.
                    </p>
                    <a
                        href={result.paynow_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                    >
                        <img
                            src="https://www.paynow.co.zw/Content/Buttons/Medium_buttons/button_pay-now_medium.png"
                            alt="Pay with Paynow"
                            className="h-10 hover:opacity-90 transition-opacity"
                        />
                    </a>
                    <p className="text-xs text-gray-500 mt-2">
                        Gift ID: {result.gift.id} · The recipient will be notified once payment is confirmed.
                    </p>
                </div>
            )}
        </div>
    );
}
