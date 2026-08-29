import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

/**
 * Recent history of each room. Redis is the read path: a client joining a room gets the last
 * hundred messages from here, never from Postgres.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const host = this.configService.get<string>('app.redis.host');
    const port = this.configService.get<number>('app.redis.port');

    this.client = createClient({ url: `redis://${host}:${port}` });
    this.client.on('error', (error) => this.logger.error('redis client error', error));

    await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.quit();
  }

  async lpush(key: string, value: string): Promise<number> {
    return this.client.lPush(key, value);
  }

  async ltrim(key: string, start: number, stop: number): Promise<string> {
    return this.client.lTrim(key, start, stop);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.lRange(key, start, stop);
  }
}
