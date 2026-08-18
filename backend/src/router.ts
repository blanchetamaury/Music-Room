import { Router, Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import { dirname, join, resolve } from 'path';
import { readdirSync } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = require.resolve('.');
const __dirname = dirname(__filename);

interface WebResponse {
  status: number;
  headers: Headers;
  text(): Promise<string>;
  json(): Promise<any>;
}

interface RouteHandler {
  GET?: (req: Request) => Promise<WebResponse>;
  POST?: (req: Request) => Promise<WebResponse>;
  PUT?: (req: Request) => Promise<WebResponse>;
  DELETE?: (req: Request) => Promise<WebResponse>;
  PATCH?: (req: Request) => Promise<WebResponse>;
}

function convertToExpressHandler(handler: (req: Request) => Promise<WebResponse>) {
  return async (expressReq: ExpressRequest, expressRes: ExpressResponse, next: NextFunction) => {
    try {
      const webReq = createWebRequest(expressReq);
      const webRes = await handler(webReq);
      
      expressRes.status(webRes.status);
      webRes.headers.forEach((value, key) => {
        expressRes.setHeader(key, value);
      });
      const body = await webRes.text();
      if (body) {
        expressRes.send(body);
      } else {
        expressRes.end();
      }
    } catch (error) {
      next(error);
    }
  };
}

function createWebRequest(expressReq: ExpressRequest): Request {
  const url = `${expressReq.protocol}://${expressReq.get('host')}${expressReq.originalUrl}`;
  const headers = new Headers();
  
  for (const [key, value] of Object.entries(expressReq.headers)) {
    if (value !== undefined) {
      headers.append(key, Array.isArray(value) ? value.join(', ') : value);
    }
  }

  const body = expressReq.body ? JSON.stringify(expressReq.body) : undefined;

  return new Request(url, {
    method: expressReq.method,
    headers,
    body,
  });
}

async function loadRoutes(dir: string, prefix = ''): Promise<Router> {
  const router = Router();
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      const subRouter = await loadRoutes(fullPath, join(prefix, entry.name));
      console.log(`Mounting sub-router at /${entry.name} with prefix ${join(prefix, entry.name)}`);
      router.use(`/${entry.name}`, subRouter);
    } else if (entry.name.endsWith('+api.ts') || entry.name.endsWith('+api.js')) {
      const methodName = entry.name.replace('+api.ts', '').replace('+api.js', '');
      
      try {
        const modulePath = resolve(fullPath);
        const module = await import(modulePath);
        const handlers: RouteHandler = {};
        
        for (const [httpMethod, handler] of Object.entries(module)) {
          if (['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(httpMethod.toUpperCase())) {
            handlers[httpMethod.toUpperCase() as keyof RouteHandler] = convertToExpressHandler(handler as (req: Request) => Promise<WebResponse>);
          }
        }

        const finalPath = methodName === 'index' ? '/' : `/${methodName}`;
        
        for (const [httpMethod, handler] of Object.entries(handlers)) {
          if (handler) {
            (router as any)[httpMethod.toLowerCase()](finalPath, handler);
            const fullRoute = join(prefix, methodName).replace(/\\/g, '/');
            console.log(`Registered route: ${httpMethod.toUpperCase()} ${finalPath} (full: /api/${fullRoute})`);
          }
        }
      } catch (error) {
        console.error(`Failed to load route ${fullPath}:`, error);
      }
    }
  }

  // Debug: print all routes in this router
  router.stack.forEach((layer: any) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
      console.log(`  Router ${prefix}: ${methods} ${layer.route.path}`);
    } else if (layer.name === 'router') {
      console.log(`  Router ${prefix}: mounted sub-router at ${layer.regexp}`);
    }
  });

  return router;
}

export async function createApiRouter(): Promise<Router> {
  const apiDir = join(__dirname, 'api');
  return loadRoutes(apiDir);
}