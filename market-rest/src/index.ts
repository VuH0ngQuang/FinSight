import { createApp } from './app';
import { config } from './config/env';
import { initDatabase } from './config/database';
import {redisClient} from "./config/redis";

const app = createApp();

const startServer = async () => {
  try {
    await initDatabase();
    await redisClient.connect();

    app.listen(config.port, () => {
      console.log(`Server listening on port ${config.port}`);
      console.log('KAFKA_BROKER =', process.env.KAFKA_URLS)
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

const shutdown = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());

void startServer();


