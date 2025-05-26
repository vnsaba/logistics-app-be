export const config = {
  app: {
    port: process.env.PORT || 3000,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB || 0,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  }
};