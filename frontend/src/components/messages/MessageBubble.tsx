import type { Message } from '../../store/useStore';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export const MessageBubble = ({ message, isCurrentUser }: MessageBubbleProps) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
        isCurrentUser 
          ? 'bg-[#ba0b0b] text-white rounded-br-none' 
          : 'bg-muted text-foreground rounded-bl-none'
      }`}>
        <p className="text-sm">{message.content}</p>
        <div className={`text-xs mt-1 ${isCurrentUser ? 'text-white/80' : 'text-muted-foreground'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};
