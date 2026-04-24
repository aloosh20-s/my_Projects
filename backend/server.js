const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { connectDB, sequelize } = require('./config/db');

const logger = require('./config/logger');
const loggerMiddleware = require('./middlewares/loggerMiddleware');
const { wafMiddleware, globalRateLimiter } = require('./middlewares/security');

// Read env variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Restricted to frontend URL
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

// Middlewares
const allowedOrigins = [
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      upgradeInsecureRequests: [],
    },
  }
}));

app.use(globalRateLimiter);
app.use(wafMiddleware);
app.use(loggerMiddleware);

// Header Sanitization Middleware
app.use((req, res, next) => {
  const sanitize = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  if (req.headers['user-agent']) {
    req.headers['user-agent'] = sanitize(req.headers['user-agent']);
  }
  if (req.headers['referer']) {
    req.headers['referer'] = sanitize(req.headers['referer']);
  }
  
  next();
});

// Protocol Validation Middleware for Socket.io
app.use('/socket.io', (req, res, next) => {
  if (req.query.EIO && !/^\d+$/.test(req.query.EIO)) {
    return res.status(400).json({ error: 'Invalid EIO parameter' });
  }
  next();
});

app.use(express.json());

// Serve uploads folder statically for local development
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.io connection & authentication
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
  if (!token) {
    logger.warn(`Socket connection attempt without token: ${socket.id}`);
    return next(new Error('Authentication error: Token missing'));
  }

  const tokenStr = token.startsWith('Bearer ') ? token.slice(7) : token;

  jwt.verify(tokenStr, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      logger.warn(`Socket connection with invalid token: ${socket.id}`);
      return next(new Error('Authentication error: Invalid token'));
    }
    socket.user = decoded;
    next();
  });
});

io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id} (UserId: ${socket.user?.id || 'Unknown'})`);

  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    logger.info(`User ${userId} joined their notification room`);
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Basic Route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/workers', require('./routes/workerRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/service-requests', require('./routes/serviceRequestRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
// app.use('/api/reviews', require('./routes/reviewRoutes'));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Sync all defined models to the DB
    await sequelize.sync();
    logger.info('Database synced successfully');

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error(`Failed to sync database: ${err.message}`);
  }
};

startServer();