const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

// Security Patterns for basic WAF
const sqlInjectionPattern = /(\b(SELECT|UPDATE|INSERT|DELETE|DROP|UNION|ALTER)\b)|(['"]\s*(OR|AND)\s*['"]?\d+['"]?\s*=\s*['"]?\d+)/i;
const xssPattern = /(<script\b[^>]*>[\s\S]*?<\/script>)|javascript:|onerror=|onload=/i;

exports.wafMiddleware = (req, res, next) => {
  const payload = JSON.stringify(req.body) + req.url;

  if (sqlInjectionPattern.test(payload) || xssPattern.test(payload)) {
    logger.warn(`WAF Blocked Request: IP ${req.ip} - UserAgent ${req.headers['user-agent']} - Payload: ${req.url}`);
    return res.status(403).json({ error: 'Forbidden: Malicious activity detected' });
  }
  next();
};

exports.globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' },
  handler: (req, res, next, options) => {
    logger.warn(`Rate Limit Exceeded: IP ${req.ip}`);
    res.status(options.statusCode).send(options.message);
  }
});
