import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Behind nginx on the same host: trust loopback so rate-limiting keys on the real client IP
app.set('trust proxy', 'loopback');

const allowedOrigins = (process.env.CORS_ORIGIN || 'https://wallet.korsh.org,http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000')
  .split(',')
  .map((s) => s.trim());

// Security headers
app.use(helmet());

// CORS - allow wallet frontend and development servers
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ['GET', 'POST'],
  })
);

// Parse JSON bodies (for broadcast endpoint)
app.use(express.json({ limit: '100kb' }));

// Rate limiting: 60 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
app.use('/api', limiter);

// Stricter rate limit for broadcast (5 per minute)
const broadcastLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many broadcast requests' },
});
app.use('/api/broadcast', broadcastLimiter);

// API routes
app.use('/api', routes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, process.env.HOST || '127.0.0.1', () => {
  console.log(`Wallet API running on port ${PORT}`);
});
