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
const CLIENT_URL = process.env.CLIENT_URL;

const allowedOrigins = [
  CLIENT_URL,
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

const swaggerDocument = yaml.load(path.join(__dirname, 'swagger.yaml'));

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

app.get('/api/openapi.yaml', (req, res) => {
  res.setHeader('Content-Type', 'application/x-yaml');
  res.send(fs.readFileSync(path.join(__dirname, 'swagger.yaml'), 'utf8'));
});

const publicPaths = ['/api/deezer/chartsfirts', '/api/auth/logout'];

app.use(async (req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  //const session = await getSession(req);
  //console.log(req.path, session);
  /*if (!publicPaths.includes(req.path)) {
    if (session === null) {
      return res.redirect('/api/auth/logout');
    }
  }*/
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

createApiRouter().then(apiRouter => {
  app.use('/api', apiRouter);

  const printRoutes = (stack: any[], prefix = '') => {
  stack.forEach((layer: any) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods)
        .map(m => m.toUpperCase())
        .join(',');
      console.log(`${methods.padEnd(8)} ${prefix}${layer.route.path}`);
    } else if (layer.handle?.stack) {
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
}).catch(err => {
  console.error('Failed to create API router:', err); // 👈 ajoute ça
});