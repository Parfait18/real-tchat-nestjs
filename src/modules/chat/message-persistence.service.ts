import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { CHAT_QUEUE } from '../rabbitmq/queues';
import { Message } from './entities/message.entity';
import { ChatMessage } from './interfaces/chat-message.interface';

/**
 * The other half of the write path. The gateway answers the sender as soon as the message is
 * cached and queued; durable storage happens here, off the delivery path. If Postgres is down
 * the queue holds the backlog instead of the chat breaking.
 */
@Injectable()
export class MessagePersistenceService implements OnModuleInit {
  private readonly logger = new Logger(MessagePersistenceService.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    @InjectRepository(Message)
    private readonly messages: Repository<Message>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.rabbitMQService.consumeMessages(CHAT_QUEUE, (message) => this.persist(message));
  }

  async persist(message: ChatMessage): Promise<void> {
    await this.messages.save({
      id: message.id,
      room: message.room,
      sender: message.sender,
      content: message.content,
      timestamp: message.timestamp,
    });

    this.logger.debug(`persisted ${message.id} from room ${message.room}`);
  }
}
