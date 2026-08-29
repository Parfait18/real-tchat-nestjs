import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper } from 'amqp-connection-manager';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.AmqpConnectionManager;
  private channelWrapper: ChannelWrapper;

  constructor() {
    this.connection = amqp.connect(['amqp://localhost:5672']);
    
    this.channelWrapper = this.connection.createChannel({
      setup: (channel) => {
        return Promise.all([
          channel.assertQueue('chat_messages', { durable: true }),
          channel.prefetch(100) // Process 100 messages at a time
        ]);
      },
    });
  }

  async onModuleInit() {
    await this.channelWrapper.waitForConnect();
  }

  async onModuleDestroy() {
    await this.channelWrapper.close();
    await this.connection.close();
  }

  async publishMessage(queue: string, message: any): Promise<void> {
    await this.channelWrapper.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
  }

  async consumeMessages(queue: string, callback: (message: any) => Promise<void>): Promise<void> {
    await this.channelWrapper.consume(queue, async (message) => {
      if (message) {
        try {
          const content = JSON.parse(message.content.toString());
          await callback(content);
          this.channelWrapper.ack(message);
        } catch (error) {
          console.error('Error processing message:', error);
          this.channelWrapper.nack(message, false, false);
        }
      }
    });
  }
}