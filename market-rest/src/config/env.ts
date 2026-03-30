import path from 'path';
import dotenv from 'dotenv';

const envFile =
  process.env.NODE_ENV === 'test' ? '.env.test' : process.env.ENV_FILE ?? '.env';

dotenv.config({
  path: path.resolve(process.cwd(), envFile),
});

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const optionalEnv = (key: string, fallback: string): string => {
  return process.env[key] ?? fallback;
};

export const config = {
  nodeEnv: optionalEnv('NODE_ENV', 'development'),
  port: Number(optionalEnv('PORT', '3000')),
  hostname: requireEnv('HOSTNAME'),
  database: {
    host: requireEnv('DB_HOST'),
    port: Number(optionalEnv('DB_PORT', '3306')),
    user: requireEnv('DB_USER'),
    password: requireEnv('DB_PASSWORD'),
    name: requireEnv('DB_NAME'),
  },
  kafka: {
    brokers: requireEnv('KAFKA_URLS').split(',').map((url) => url.trim()),
    groupId: requireEnv('KAFKA_GROUP_ID'),
    clientId: optionalEnv('CLUSTER_ID', 'market-rest'),
    requestTimeoutMs: Number(optionalEnv('KAFKA_REQUEST_TIMEOUT_MS', '15000')),
    topics: {
      rest: requireEnv('KAFKA_REST_TOPIC'),
    },
  },
  redis: {
    host: optionalEnv('REDIS_HOST', 'localhost'),
    port: Number(optionalEnv('REDIS_PORT', '6379')),
    password: optionalEnv('REDIS_PASSWORD', ''),
    db: Number(optionalEnv('REDIS_DB', '0')),
    cacheTtl: Number(optionalEnv('REDIS_CACHE_TTL', '3600')),
  },
  uri: {
    user: {
      create: '/user/create',
      update: '/user/update',
      delete: '/user/delete',
      updatePassword: '/user/updatePassword',
      login: '/user/login',
      addFavoriteStock: '/user/addFavoriteStock',
      removeFavoriteStock: '/user/removeFavoriteStock',
      favoriteStocks: '/user/favoriteStocks',
    },
    stock: {
      create: '/stock/create',
      update: '/stock/update',
      delete: '/stock/delete',
      updateIndustryRatios: '/stock/updateIndustryRatios',
      recalculateValuations: '/stock/recalculateValuations',
      updateMatchPrice: '/stock/updateMatchPrice/',
    },
    subscription: {
      create: '/subscription/create',
      update: '/subscription/update',
      delete: '/subscription/delete',
    },
    ahpConfig: {
      create: '/ahpConfig/create',
      update: '/ahpConfig/update',
    },
    stockYearData: {
      create: '/stockYearData/create/',
      update: '/stockYearData/update/',
      delete: '/stockYearData/delete',
    },
    portfolio: {
      allocate: '/portfolio/allocate',
    },
  },
};

export type AppConfig = typeof config;

