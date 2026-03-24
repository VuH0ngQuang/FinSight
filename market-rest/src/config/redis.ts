import { createClient } from 'redis';
import { config } from './env';

const getRedisUrl = (): string => {
    const auth = config.redis.password ? `:${config.redis.password}@` : '';
    return `redis://${auth}${config.redis.host}:${config.redis.port}/${config.redis.db}`;
};

const redisClient = createClient({
    url: getRedisUrl(),
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

export { redisClient };
