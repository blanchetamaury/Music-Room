import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yamljs';
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

// Load OpenAPI spec
const swaggerDocument = yaml.load(path.join(__dirname, 'swagger.yaml'));

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Music Room API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
  },
}));

// Raw OpenAPI spec endpoint
app.get('/api/openapi.yaml', (req, res) => {
  res.setHeader('Content-Type', 'application/x-yaml');
  res.send(fs.readFileSync(path.join(__dirname, 'swagger.yaml'), 'utf8'));
});

// Debug middleware
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

createApiRouter().then(apiRouter => {
  app.use('/api', apiRouter);

  // Debug : affiche toutes les routes montées
  const printRoutes = (stack: any[], prefix = '') => {
  stack.forEach((layer: any) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods)
        .map(m => m.toUpperCase())
        .join(',');
      console.log(`${methods.padEnd(8)} ${prefix}${layer.route.path}`);
    } else if (layer.handle?.stack) {
      // Reconstruit le préfixe depuis la regexp du layer
      const seg = layer.regexp?.source
        ?.replace('^\\/', '/')
        ?.replace('\\/?(?=\\/|$)', '')
        ?.replace(/\\\//g, '/') ?? '';
      printRoutes(layer.handle.stack, prefix + (seg.startsWith('/') ? seg : ''));
      }
    });
  };

  const router = (app as any).router ?? (app as any)._router;
  console.log('--- Routes ---');
  printRoutes(router.stack);

  app.listen(PORT, () => { /* ... */ });
});