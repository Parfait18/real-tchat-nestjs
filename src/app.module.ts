import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './modules/chat/chat.module';
import { RedisModule } from './modules/redis/redis.module';
import { RabbitMQModule } from './modules/rabbitmq/rabbitmq.module';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    ChatModule,
    RedisModule,
    RabbitMQModule
  ],
})
export class AppModule {}