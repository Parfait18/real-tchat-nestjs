## High-Performance Chat Application Backend

A scalable real-time chat application backend built with NestJS, featuring PostgreSQL database, Redis caching, WebSocket communication, RabbitMQ message queuing, and notification services.

### Features

- Real-time messaging using WebSockets
- PostgreSQL database for message persistence
- Message caching with Redis
- Message queue processing with RabbitMQ
- Email notifications via SendGrid
- SMS notifications via Twilio
- REST API with Swagger documentation
- TypeScript support
- Scalable architecture

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- Redis server
- RabbitMQ server
- SendGrid account (for email notifications)
- Twilio account (for SMS notifications)

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file in the root directory using the provided `.env.example` as a template.

### Database Setup

```bash
# Generate a new migration
npm run migration:generate -- src/migrations/InitialMigration

# Run migrations
npm run migration:run
```

### Running the Application

Development mode:
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

### API Documentation

Swagger documentation is available at: `http://localhost:3000/api`

### WebSocket Events

1. Connection Events:
   - `connection`: Client connects to the server
   - `disconnect`: Client disconnects from the server

2. Message Events:
   - `sendMessage`: Send a new message
   - `newMessage`: Receive a new message
   - `joinRoom`: Join a chat room
   - `leaveRoom`: Leave a chat room

### Architecture

The application is built with a modular architecture:

1. Database Module:
   - PostgreSQL for persistent storage
   - TypeORM for database operations
   - Migration support

2. Chat Module:
   - Handles real-time communication
   - Manages room operations
   - Processes messages

3. Redis Module:
   - Caches recent messages
   - Provides fast message retrieval
   - Manages room state

4. RabbitMQ Module:
   - Handles message queuing
   - Ensures message persistence
   - Manages high-load scenarios

5. Notification Modules:
   - Email notifications via SendGrid
   - SMS notifications via Twilio

### Performance

- Handles 1000+ messages per minute
- Message caching for quick retrieval
- Load balancing through message queuing
- Optimized WebSocket connections
- Database indexing and optimization

### Testing

```bash
npm run test
```

### Documentation Generation

Generate detailed documentation:
```bash
npm run doc:generate
```

### License

MIT