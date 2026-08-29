import { RabbitMQService } from './rabbitmq.service';

/**
 * The connection is built in onModuleInit, so the channel can be replaced here and the
 * acknowledgement policy tested without a broker.
 */
describe('RabbitMQService', () => {
  let service: RabbitMQService;
  let channel: { consume: jest.Mock; ack: jest.Mock; nack: jest.Mock };

  const rawMessage = { content: Buffer.from(JSON.stringify({ id: 'abc' })) };

  beforeEach(() => {
    channel = { consume: jest.fn(), ack: jest.fn(), nack: jest.fn() };
    service = new RabbitMQService({ get: () => 'amqp://localhost:5672' } as any);
    (service as any).channelWrapper = channel;
  });

  async function deliver(handler: (message: any) => Promise<void>) {
    await service.consumeMessages('chat_messages', handler);
    const registered = channel.consume.mock.calls[0][1];
    await registered(rawMessage);
  }

  it('should acknowledge the message when the handler succeeds', async () => {
    await deliver(async () => undefined);

    expect(channel.ack).toHaveBeenCalledWith(rawMessage);
    expect(channel.nack).not.toHaveBeenCalled();
  });

  it('should reject without requeue when the handler throws', async () => {
    await deliver(async () => {
      throw new Error('postgres unavailable');
    });

    expect(channel.nack).toHaveBeenCalledWith(rawMessage, false, false);
    expect(channel.ack).not.toHaveBeenCalled();
  });

  it('should ignore an empty delivery', async () => {
    await service.consumeMessages('chat_messages', async () => undefined);
    const registered = channel.consume.mock.calls[0][1];

    await registered(null);

    expect(channel.ack).not.toHaveBeenCalled();
    expect(channel.nack).not.toHaveBeenCalled();
  });
});
