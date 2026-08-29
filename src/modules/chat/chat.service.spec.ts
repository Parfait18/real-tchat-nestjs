import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { RedisService } from '../redis/redis.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { CHAT_QUEUE } from '../rabbitmq/queues';
import { ChatMessage } from './interfaces/chat-message.interface';

describe('ChatService', () => {
  let service: ChatService;
  let redis: { lpush: jest.Mock; ltrim: jest.Mock; lrange: jest.Mock };
  let rabbit: { publishMessage: jest.Mock };

  const message: ChatMessage = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    room: 'general',
    sender: 'parfait',
    content: 'hello',
    timestamp: 1700000000000,
  };

  beforeEach(async () => {
    redis = { lpush: jest.fn(), ltrim: jest.fn(), lrange: jest.fn() };
    rabbit = { publishMessage: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: RedisService, useValue: redis },
        { provide: RabbitMQService, useValue: rabbit },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should cache the message and publish it when a message is handled', async () => {
    await service.handleMessage(message);

    expect(redis.lpush).toHaveBeenCalledWith('room:general:messages', JSON.stringify(message));
    expect(rabbit.publishMessage).toHaveBeenCalledWith(CHAT_QUEUE, message);
  });

  it('should keep only the last hundred messages when a room is written to', async () => {
    await service.handleMessage(message);

    expect(redis.ltrim).toHaveBeenCalledWith('room:general:messages', 0, 99);
  });

  it('should return the parsed history when a room is read', async () => {
    redis.lrange.mockResolvedValue([JSON.stringify(message)]);

    await expect(service.getRoomMessages('general')).resolves.toEqual([message]);
    expect(redis.lrange).toHaveBeenCalledWith('room:general:messages', 0, -1);
  });
});
