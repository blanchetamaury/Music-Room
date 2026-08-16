import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createApiRouter } from './router';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:8081';

// Allow both localhost and ngrok URLs
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:8081',
  'http://localhost:19006',
  'https://ambulance-eggshell-preamble.ngrok-free.dev',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

createApiRouter().then(apiRouter => {
  app.use('/api', (req, res, next) => {
    console.log(`API router received: ${req.method} ${req.path}`);
    next();
  }, apiRouter);
  
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});