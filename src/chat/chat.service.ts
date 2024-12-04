import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { ChatMessage } from './interfaces/chat-message.interface';

@Injectable()
export class ChatService {
  constructor(
    private readonly redisService: RedisService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async handleMessage(message: ChatMessage): Promise<void> {
    // Store message in Redis cache
    await this.cacheMessage(message);
    
    // Send message to RabbitMQ for processing
    await this.rabbitMQService.publishMessage('chat_messages', message);
  }

  private async cacheMessage(message: ChatMessage): Promise<void> {
    const roomKey = `room:${message.room}:messages`;
    await this.redisService.lpush(roomKey, JSON.stringify(message));
    // Keep only last 100 messages per room
    await this.redisService.ltrim(roomKey, 0, 99);
  }

  async getRoomMessages(room: string): Promise<ChatMessage[]> {
    const messages = await this.redisService.lrange(`room:${room}:messages`, 0, -1);
    return messages.map(msg => JSON.parse(msg));
  }
}