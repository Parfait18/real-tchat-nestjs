import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper } from 'amqp-connection-manager';
import { CHAT_QUEUE } from './queues';

/**
 * Connection and channel are built in onModuleInit rather than in the constructor: a
 * constructor that opens sockets cannot be instantiated in a test.
 */
@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.AmqpConnectionManager;
  private channelWrapper: ChannelWrapper;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const url = this.configService.get<string>('app.rabbitmq.url');

    this.connection = amqp.connect([url]);
    this.channelWrapper = this.connection.createChannel({
      setup: (channel) =>
        Promise.all([
          channel.assertQueue(CHAT_QUEUE, { durable: true }),
          // One hundred unacknowledged messages in flight per consumer.
          channel.prefetch(100),
        ]),
    });

    await this.channelWrapper.waitForConnect();
    this.logger.log(`connected to ${url}`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.channelWrapper?.close();
    await this.connection?.close();
  }

  async publishMessage(queue: string, message: unknown): Promise<void> {
    await this.channelWrapper.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
  }

  /**
   * Acknowledges on success. On failure the message is rejected without requeue — redelivering
   * a message that already threw would loop; a dead-letter exchange is the next step.
   */
  async consumeMessages(
    queue: string,
    handler: (message: any) => Promise<void>,
  ): Promise<void> {
    await this.channelWrapper.consume(queue, async (message) => {
      if (!message) return;

      try {
        await handler(JSON.parse(message.content.toString()));
        this.channelWrapper.ack(message);
      } catch (error) {
        this.logger.error(`rejecting message from ${queue}`, error);
        this.channelWrapper.nack(message, false, false);
      }
    });
  }
}
