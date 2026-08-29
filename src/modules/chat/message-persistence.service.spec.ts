import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MessagePersistenceService } from './message-persistence.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { CHAT_QUEUE } from '../rabbitmq/queues';
import { Message } from './entities/message.entity';
import { ChatMessage } from './interfaces/chat-message.interface';

describe('MessagePersistenceService', () => {
  let service: MessagePersistenceService;
  let rabbit: { consumeMessages: jest.Mock };
  let repository: { save: jest.Mock };

  const message: ChatMessage = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    room: 'general',
    sender: 'parfait',
    content: 'hello',
    timestamp: 1700000000000,
  };

  beforeEach(async () => {
    rabbit = { consumeMessages: jest.fn() };
    repository = { save: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagePersistenceService,
        { provide: RabbitMQService, useValue: rabbit },
        { provide: getRepositoryToken(Message), useValue: repository },
      ],
    }).compile();

    service = module.get<MessagePersistenceService>(MessagePersistenceService);
  });

  it('should subscribe to the chat queue on startup', async () => {
    await service.onModuleInit();

    expect(rabbit.consumeMessages).toHaveBeenCalledWith(CHAT_QUEUE, expect.any(Function));
  });

  it('should persist the message it receives from the queue', async () => {
    await service.persist(message);

    expect(repository.save).toHaveBeenCalledWith({
      id: message.id,
      room: message.room,
      sender: message.sender,
      content: message.content,
      timestamp: message.timestamp,
    });
  });

  it('should persist through the handler registered on the queue', async () => {
    await service.onModuleInit();
    const handler = rabbit.consumeMessages.mock.calls[0][1];

    await handler(message);

    expect(repository.save).toHaveBeenCalledTimes(1);
  });
});
