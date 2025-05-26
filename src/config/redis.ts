import Redis from 'ioredis';
import { config } from './config.js';

class RedisClient {
  private client: Redis | null;
  private isConnected: boolean;

  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Opción 1: Usando URL completa
      if (config.redis.url && config.redis.url !== 'redis://localhost:6379') {
        this.client = new Redis(config.redis.url);
      } 
      // Opción 2: Usando configuración detallada
      else {
        this.client = new Redis({
          host: config.redis.host,
          port: Number(config.redis.port),
          password: config.redis.password,
          db: Number(config.redis.db),
          maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
          lazyConnect: config.redis.lazyConnect,
        });
      }

      // Event listeners
      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis connection error:', err);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        console.log('🔌 Redis connection closed');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });

      // Test the connection
      await this.client.ping();
      console.log('🏓 Redis ping successful');

      return this.client;
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  getClient() {
    if (!this.client) {
      throw new Error('Redis client not initialized. Call connect() first.');
    }
    return this.client;
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
    }
  }

  // Métodos de utilidad
async set(key: string, value: unknown, expireInSeconds: number | null = null): Promise<'OK' | null> {
    const client = this.getClient();
    if (expireInSeconds) {
        return await client.setex(key, expireInSeconds, JSON.stringify(value));
    }
    return await client.set(key, JSON.stringify(value));
}

async get<T = unknown>(key: string): Promise<T | null> {
    const client = this.getClient();
    const value = await client.get(key);
    return value ? JSON.parse(value) as T : null;
}

async del(key: string): Promise<number> {
    const client = this.getClient();
    return await client.del(key);
}

async exists(key: string): Promise<number> {
    const client = this.getClient();
    return await client.exists(key);
}

  async flushall() {
    const client = this.getClient();
    return await client.flushall();
  }
}

// Singleton instance
export const redisClient = new RedisClient();