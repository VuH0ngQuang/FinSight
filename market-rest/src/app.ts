import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import routes from './routes';
import {config} from './config/env'

/**
 * Creates and configures the Express application instance.
 */
export const createApp = (): Application => {
  const app = express();

  // Configure CORS so that the frontend (e.g. Vite on localhost:5173) can call this API,
  // including when credentials (cookies/auth) are used.
  app.use(
    cors({
      origin: ['http://'+config.hostname+':5173', 'http://'+config.hostname+':3000'],
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api', routes);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: 'Not Found' });
  });

  return app;
};

export default createApp;

