import Redis from 'ioredis';

// Puedes usar una variable de entorno para configurar la URL de Redis
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = new Redis(redisUrl);

export class RedisService {
  private client: Redis;

  constructor(client: Redis) {
    this.client = client;
  }

  async setLocation(deliveryId: string, latitude: number, longitude: number): Promise<void> {
    const key = `location:${deliveryId}`;
    await this.client.hset(key, 'latitude', latitude.toString());
    await this.client.hset(key, 'longitude', longitude.toString());
    await this.client.hset(key, 'timestamp', Date.now().toString());
  }

  async getLocation(deliveryId: string): Promise<{ latitude: number; longitude: number; timestamp: number } | null> {
    const key = `location:${deliveryId}`;
    const data = await this.client.hgetall(key);
    if (!data || !data.latitude || !data.longitude) {
      return null;
    }

    return {
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      timestamp: Number(data.timestamp),
    };
  }

  get clientInstance(): Redis {
    return this.client;
  }
}

const redisService = new RedisService(redisClient);

export { redisService };
