import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { createCache, Cache, memoryStore } from 'cache-manager';

@Injectable()
export class CacheService implements OnModuleInit {
  private cache: Cache;
  private readonly logger = new Logger(CacheService.name);

  async onModuleInit() {
    this.cache = createCache(memoryStore(), {
      max: 500,
      ttl: 60 * 1000, // 60s default
    });
    this.logger.log('Cache initialized (in-memory, max=500)');
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get<T>(key);
  }

  async set(key: string, value: unknown, ttlMs?: number): Promise<void> {
    await this.cache.set(key, value, ttlMs);
  }

  async del(key: string): Promise<void> {
    await this.cache.del(key);
  }

  async wrap<T>(key: string, fn: () => Promise<T>, ttlMs?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined && cached !== null) {
      this.logger.debug(`Cache HIT: ${key}`);
      return cached;
    }
    this.logger.debug(`Cache MISS: ${key}`);
    const result = await fn();
    await this.set(key, result, ttlMs);
    return result;
  }

  async invalidateByPrefix(prefix: string): Promise<void> {
    // cache-manager v5 memoryStore supports reset()
    // For prefix-based invalidation, we reset all (simple but effective for v1)
    await this.cache.reset();
    this.logger.debug(`Cache invalidated (prefix: ${prefix})`);
  }

  async reset(): Promise<void> {
    await this.cache.reset();
    this.logger.debug('Cache fully reset');
  }
}
