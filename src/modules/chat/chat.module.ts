import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { MessagePersistenceService } from './message-persistence.service';
import { Message } from './entities/message.entity';
import { RedisModule } from '../redis/redis.module';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), RedisModule, RabbitMQModule],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, MessagePersistenceService],
})
export class ChatModule {}
