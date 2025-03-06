const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per 15 minutes
    message: { error: "Too many login attempts. Please try again later." },
    headers: true, // Include rate limit info in response headers
});

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 API requests per minute
    message: { error: "Too many requests. Please slow down." },
    headers: true,
});

module.exports = { loginLimiter, apiLimiter };
