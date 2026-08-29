export interface ChatMessage {
  id: string;
  room: string;
  sender: string;
  content: string;
  timestamp: number;
}