import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { CHAT_QUEUE } from '../rabbitmq/queues';
import { ChatMessage } from './interfaces/chat-message.interface';

/** Recent history kept per room in Redis. Older messages live in Postgres. */
const ROOM_HISTORY_SIZE = 100;

@Injectable()
export class ChatService {
  constructor(
    private readonly redisService: RedisService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  /**
   * The write path is deliberately split: the cache write is what the sender waits on, the
   * queue publication is what eventually reaches Postgres. Persistence never blocks delivery.
   */
  async handleMessage(message: ChatMessage): Promise<void> {
    await this.cacheMessage(message);
    await this.rabbitMQService.publishMessage(CHAT_QUEUE, message);
  }

  private async cacheMessage(message: ChatMessage): Promise<void> {
    const roomKey = this.roomKey(message.room);

    await this.redisService.lpush(roomKey, JSON.stringify(message));
    await this.redisService.ltrim(roomKey, 0, ROOM_HISTORY_SIZE - 1);
  }

  async getRoomMessages(room: string): Promise<ChatMessage[]> {
    const messages = await this.redisService.lrange(this.roomKey(room), 0, -1);
    return messages.map((message) => JSON.parse(message));
  }

  private roomKey(room: string): string {
    return `room:${room}:messages`;
  }
}
