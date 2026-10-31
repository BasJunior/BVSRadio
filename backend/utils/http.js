function handleServerError(res, error, context = 'request') {
    console.error(`[${context}]`, error);
    return res.status(500).json({ error: 'Internal server error' });
}

module.exports = {
    handleServerError
};
