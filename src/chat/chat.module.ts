import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { RedisModule } from '../redis/redis.module';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RedisModule, RabbitMQModule],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}