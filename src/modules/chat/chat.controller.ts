import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatMessage } from './interfaces/chat-message.interface';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('room/:roomId/messages')
  @ApiOperation({ summary: 'Get messages from a specific room' })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of messages from the specified room',
    type: [ChatMessage]
  })
  async getRoomMessages(@Param('roomId') roomId: string): Promise<ChatMessage[]> {
    return this.chatService.getRoomMessages(roomId);
  }
}