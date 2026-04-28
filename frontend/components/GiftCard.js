// GiftCard Component - displays a single gift from an organization to a user
import React from 'react';
import { formatCurrency } from '../utils/helpers';

const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-blue-100 text-blue-800',
    claimed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
};

const PAYMENT_METHOD_LABELS = {
    ecocash: 'Ecocash',
    onemoney: 'OneMoney',
    telecash: 'Telecash',
    visa: 'Visa',
    mastercard: 'Mastercard',
    paynow: 'Paynow'
};

export default function GiftCard({ gift, onClaim }) {
    const statusColor = STATUS_COLORS[gift.status] || 'bg-gray-100 text-gray-800';
    const paymentLabel = PAYMENT_METHOD_LABELS[gift.payment_method] || gift.payment_method || 'Paynow';

    const formattedDate = gift.sent_at
        ? new Date(gift.sent_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
        : '';

    return (
        <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-xl transition-shadow border-l-4 border-purple-500">
            {/* Organization info */}
            <div className="flex items-center gap-3 mb-3">
                {gift.organization_logo ? (
                    <img
                        src={gift.organization_logo}
                        alt={gift.organization_name}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg">
                        {gift.organization_name ? gift.organization_name[0].toUpperCase() : 'O'}
                    </div>
                )}
                <div>
                    <p className="font-semibold text-gray-800">
                        {gift.organization_name}
                        {gift.organization_verified && (
                            <span className="ml-1 text-blue-500 text-sm" title="Verified Organization">✓</span>
                        )}
                    </p>
                    <p className="text-xs text-gray-500">{formattedDate}</p>
                </div>
                <span className={`ml-auto text-xs font-medium px-2 py-1 rounded-full ${statusColor}`}>
                    {gift.status.charAt(0).toUpperCase() + gift.status.slice(1)}
                </span>
            </div>

            {/* Gift amount */}
            <div className="text-3xl font-bold text-purple-600 mb-2">
                {formatCurrency(gift.amount, gift.currency)}
            </div>

            {/* Message */}
            {gift.message && (
                <p className="text-gray-600 text-sm italic mb-3">"{gift.message}"</p>
            )}

            {/* Payment method badge */}
            <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-gray-500">via</span>
                <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    {paymentLabel}
                </span>
            </div>

            {/* Action button */}
            {gift.status === 'paid' && onClaim && (
                <button
                    onClick={() => onClaim(gift.id)}
                    className="w-full mt-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors font-semibold"
                >
                    Claim Gift
                </button>
            )}
            {gift.status === 'claimed' && gift.claimed_at && (
                <p className="text-xs text-green-600 mt-2">
                    Claimed on {new Date(gift.claimed_at).toLocaleDateString()}
                </p>
            )}
        </div>
    );
}
