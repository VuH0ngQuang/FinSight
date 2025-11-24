import { createApp } from './app';
import { config } from './config/env';
import { initDatabase } from './config/database';

const app = createApp();

const startServer = async () => {
  try {
    await initDatabase();

    app.listen(config.port, () => {
      console.log(`Server listening on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

void startServer();


