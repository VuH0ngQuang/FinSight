import express, { Application, Request, Response } from 'express';
import routes from './routes';

/**
 * Creates and configures the Express application instance.
 */
export const createApp = (): Application => {
  const app = express();

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

