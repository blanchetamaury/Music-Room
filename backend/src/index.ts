import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import swaggerUi from 'swagger-ui-express';
import * as yaml from 'yamljs';
import { createApiRouter } from './router';
import { auditMiddleware, requestIdMiddleware, resolveUserMiddleware } from './lib/auditLog';
import { csrfMiddleware, issueCsrfCookieMiddleware } from './lib/csrfMiddleware';
import { sseHandler, type RealtimeTopic } from './lib/realtime';
import { canManageDevice, canReadEvent, canReadPlaylist } from './lib/permissions';

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
	process.env.CLIENT_URL_WEB,
	process.env.CLIENT_URL_MOBILE,
	'http://localhost:8081',
	'http://localhost:19006',
].filter(Boolean);

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin) {
				return callback(null, true);
			}
			if (allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				console.warn(`❌ CORS bloqué pour l'origine : ${origin}`);
				callback(new Error('Not allowed by CORS'));
			}
		},
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
		allowedHeaders: [
			'Content-Type',
			'Authorization',
			'X-CSRF-Token',
			'X-Client-Type',
			'X-Client-Platform',
			'X-Device-Id',
			'X-Device-Model',
			'X-App-Version',
			'X-Request-Id',
		],
	})
);

app.options(/.*/, cors());
app.use(express.json());

const swaggerDocument = yaml.load(path.join(__dirname, 'swagger.yaml'));

app.use(
	'/api/docs',
	swaggerUi.serve,
	swaggerUi.setup(swaggerDocument, {
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
	})
);

app.get('/api/openapi.yaml', (req, res) => {
	res.setHeader('Content-Type', 'application/x-yaml');
	res.send(fs.readFileSync(path.join(__dirname, 'swagger.yaml'), 'utf8'));
});

app.use(requestIdMiddleware);
app.use(issueCsrfCookieMiddleware);
app.use(resolveUserMiddleware);
app.use(csrfMiddleware);
app.use(auditMiddleware);

app.get('/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/stream', (req, res, next) => {
	res.locals.canSubscribe = async (topic: RealtimeTopic, entityId: string): Promise<boolean> => {
		const userId = req.userId ?? null;
		if (!userId) return false;
		if (topic === 'playlist') return canReadPlaylist(entityId, userId);
		if (topic === 'event') return canReadEvent(entityId, userId);
		if (topic === 'device') return canManageDevice(entityId, userId);
		return false;
	};
	sseHandler(req, res, next);
});

createApiRouter()
	.then((apiRouter) => {
		app.use('/api', apiRouter);

		const printRoutes = (stack: any[], prefix = '') => {
			stack.forEach((layer: any) => {
				if (layer.route) {
					const methods = Object.keys(layer.route.methods)
						.map((m) => m.toUpperCase())
						.join(',');
					console.log(`${methods.padEnd(8)} ${prefix}${layer.route.path}`);
				} else if (layer.handle?.stack) {
					const seg =
						layer.regexp?.source
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

		app.listen(PORT, () => {});
	})
	.catch((err) => {
		console.error('Failed to create API router:', err);
	});
