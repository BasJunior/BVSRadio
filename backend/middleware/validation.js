function parseInteger(value) {
    if (typeof value === 'number') {
        return Number.isSafeInteger(value) ? value : null;
    }
    if (typeof value !== 'string' || !/^-?\d+$/.test(value.trim())) return null;
    const parsed = Number(value.trim());
    return Number.isSafeInteger(parsed) ? parsed : null;
}

function positiveInt(value) {
    const parsed = parseInteger(value);
    return parsed !== null && parsed > 0 ? parsed : null;
}

function boundedInt(value, { min = 1, max = 100 } = {}) {
    const parsed = parseInteger(value);
    return parsed !== null && parsed >= min && parsed <= max ? parsed : null;
}

function cleanString(value, { min = 0, max = 500, required = false } = {}) {
    if (value == null) return required ? null : undefined;
    if (typeof value !== 'string') return null;
    const cleaned = value.trim();
    if (required && cleaned.length < Math.max(1, min)) return null;
    if (cleaned.length < min || cleaned.length > max) return null;
    return cleaned;
}

function optionalHttpUrl(value) {
    if (value == null || value === '') return undefined;
    if (typeof value !== 'string' || value.length > 2048) return null;
    try {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol)) return null;
        if (url.username || url.password) return null;
        return url.toString();
    } catch {
        return null;
    }
}

function sendValidationError(res, message = 'Invalid request') {
    return res.status(400).json({ error: message });
}

module.exports = {
    positiveInt,
    boundedInt,
    cleanString,
    optionalHttpUrl,
    sendValidationError
};
