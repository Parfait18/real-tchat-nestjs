import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { Message } from './entities/message.entity';
import { ChatMessage } from './interfaces/chat-message.interface';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('room/:roomId/messages')
  @ApiOperation({ summary: 'Recent messages of a room, served from the Redis cache' })
  @ApiResponse({
    status: 200,
    description: 'The last hundred messages of the room, most recent first',
    // Message, not ChatMessage: an interface does not exist at runtime and Swagger
    // needs a class to read its decorated properties from.
    type: [Message],
  })
  async getRoomMessages(@Param('roomId') roomId: string): Promise<ChatMessage[]> {
    return this.chatService.getRoomMessages(roomId);
  }
}
