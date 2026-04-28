// Shared utility functions for BVSRadio frontend

/**
 * Format a monetary amount with its currency code.
 * @param {number|string} amount
 * @param {string} currency
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'USD') {
    return `${currency} ${parseFloat(amount).toFixed(2)}`;
}

/**
 * Base URL for the BVSRadio backend API.
 * Reads from the NEXT_PUBLIC_API_URL environment variable if set,
 * otherwise falls back to localhost for local development.
 */
export const API_BASE_URL =
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
    'http://localhost:3000';
