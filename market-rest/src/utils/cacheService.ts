import { redisClient } from '../config/redis';

class CacheService {
    /**
     * Scan hash fields matching a pattern (e.g. `${stockId}:*` in STOCKYEARDATA).
     */
    async hScanMatch(hashKey: string, match: string): Promise<Array<{ field: string; value: string }>> {
        const results: Array<{ field: string; value: string }> = [];
        try {
            for await (const chunk of redisClient.hScanIterator(hashKey, { MATCH: match, COUNT: 200 })) {
                for (const entry of chunk) {
                    results.push({
                        field: String(entry.field),
                        value: String(entry.value),
                    });
                }
            }
        } catch (error) {
            console.error(`Cache hScan error [${hashKey} MATCH ${match}]:`, error);
        }
        return results;
    }

    async hget<T>(hashKey: string, field: string): Promise<T | null> {
        try {
            const data = await redisClient.hGet(hashKey, field);
            if (!data) return null;
            return JSON.parse(data) as T;
        } catch (error) {
            console.error(`Cache hget error [${hashKey}:${field}]:`, error);
            return null;
        }
    }

    async hset<T>(hashKey: string, field: string, value: T): Promise<void> {
        try {
            await redisClient.hSet(hashKey, field, JSON.stringify(value));
        } catch (error) {
            console.error(`Cache hset error [${hashKey}:${field}]:`, error);
        }
    }

    async hdel(hashKey: string, field: string): Promise<void> {
        try {
            await redisClient.hDel(hashKey, field);
        } catch (error) {
            console.error(`Cache hdel error [${hashKey}:${field}]:`, error);
        }
    }
}

export const cacheService = new CacheService();
