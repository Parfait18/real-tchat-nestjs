import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Unique identifier for the message',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'The room where the message is sent',
    example: 'general'
  })
  @IsString()
  @IsNotEmpty()
  room: string;

  @ApiProperty({
    description: 'The sender of the message',
    example: 'John Doe'
  })
  @IsString()
  @IsNotEmpty()
  sender: string;

  @ApiProperty({
    description: 'The content of the message',
    example: 'Hello, everyone!'
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Timestamp of when the message was sent',
    example: 1630948800000
  })
  timestamp: number;
}