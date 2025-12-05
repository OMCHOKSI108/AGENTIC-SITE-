const User = require('../models/User');

// Simple in-memory rate limiting (for production, use Redis or database)
const rateLimitStore = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.lastReset > 24 * 60 * 60 * 1000) { // 24 hours
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

const rateLimit = (req, res, next) => {
  const now = Date.now();
  const hourInMs = 60 * 60 * 1000; // 1 hour

  // Determine the key for rate limiting
  let key;
  let limit;

  if (req.user) {
    // Authenticated user: 50 runs per day
    key = `user_${req.user._id}`;
    limit = 50;
  } else {
    // Anonymous user: 10 runs per hour per IP
    key = `ip_${req.ip || req.connection.remoteAddress}`;
    limit = 10;
  }

  // Get or initialize rate limit data
  let rateData = rateLimitStore.get(key);
  if (!rateData || now - rateData.lastReset > hourInMs) {
    rateData = {
      count: 0,
      lastReset: now
    };
  }

  // Check if limit exceeded
  if (rateData.count >= limit) {
    const resetTime = new Date(rateData.lastReset + hourInMs);
    return res.status(429).json({
      message: 'Rate limit exceeded',
      limit: limit,
      resetTime: resetTime.toISOString(),
      retryAfter: Math.ceil((resetTime - now) / 1000)
    });
  }

  // Increment counter
  rateData.count++;
  rateLimitStore.set(key, rateData);

  // Add rate limit headers
  res.set({
    'X-RateLimit-Limit': limit,
    'X-RateLimit-Remaining': Math.max(0, limit - rateData.count),
    'X-RateLimit-Reset': new Date(rateData.lastReset + hourInMs).toISOString()
  });

  next();
};

module.exports = rateLimit;