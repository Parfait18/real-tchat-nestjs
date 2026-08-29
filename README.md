# real-tchat-nestjs

[![CI](https://github.com/Parfait18/real-tchat-nestjs/actions/workflows/ci.yml/badge.svg)](https://github.com/Parfait18/real-tchat-nestjs/actions/workflows/ci.yml)

**Delivery and durability are separated.** A chat message reaches the other clients as soon as
it is cached and queued; writing it to Postgres happens on the other side of a queue, off the
delivery path. If the database is slow or down, the backlog grows in RabbitMQ — the chat keeps
working.

That trade-off is the whole point of this repository. Everything else is the smallest code that
demonstrates it honestly.

## The write path

```
  client ──socket──► ChatGateway ──► ChatService ──┬──► Redis     LPUSH + LTRIM 0 99
                                                   │              (room history, read path)
                                                   │
                                                   └──► RabbitMQ  chat_messages, durable
                                                              │
                                                              ▼
                                              MessagePersistenceService
                                                   prefetch 100, ack on success
                                                   nack(requeue = false) on failure
                                                              │
                                                              ▼
                                                         PostgreSQL
```

**Reads never touch Postgres.** Joining a room replays the last hundred messages from the Redis
list. Postgres holds the full history for everything that is not the live conversation.

**A failed message is rejected without requeue.** Redelivering a message that already threw
loops forever. A dead-letter exchange is the correct next step and is not implemented here —
saying so is more useful than pretending otherwise.

## Running it

```bash
docker compose up -d          # postgres, redis, rabbitmq
cp .env.example .env
npm install
npm run start:dev
```

- API and Swagger: `http://localhost:3000/api`
- RabbitMQ management: `http://localhost:15672` (guest / guest)

`DB_SYNCHRONIZE=true` in `.env.example` builds the schema from the entities at boot. It is
convenient locally and unacceptable against a real database; the production path is a migration.

## WebSocket events

| Event | Direction | Payload |
|---|---|---|
| `sendMessage` | client → server | `ChatMessage` |
| `newMessage` | server → clients | `ChatMessage` |
| `joinRoom` | client → server | room name — replies with `previousMessages` |
| `leaveRoom` | client → server | room name |

## Layout

```
src/modules/chat/        gateway, service, controller, entity, persistence consumer
src/modules/redis/       room history cache
src/modules/rabbitmq/    connection, publication, acknowledgement policy
src/modules/database/    TypeORM wiring
src/config/              configuration read from the environment
```

## Tests

```bash
npm test
```

Unit tests, no broker or database required — the connection is built in `onModuleInit` rather
than in the constructor, precisely so the channel can be replaced in a test.

- `ChatService` caches **and** publishes, and truncates a room to a hundred messages
- `MessagePersistenceService` subscribes to the queue and persists what it receives
- `RabbitMQService` acknowledges on success, rejects without requeue on failure

## What is not here

Stated rather than implied:

- **No authentication.** The gateway accepts any connection and CORS is open.
- **No dead-letter exchange.** A message that fails persistence is dropped after being logged.
- **No delivery guarantee to clients.** Socket.IO emits; nothing confirms receipt.
- **No load figure.** Nothing in this repository measures throughput, so no throughput is claimed.

## Stack

NestJS 10 · TypeScript 5 · Socket.IO 4 · Redis 4 · amqp-connection-manager 4 · TypeORM 0.3 ·
PostgreSQL · Swagger

## License

MIT
