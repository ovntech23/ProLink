import type { Message } from '../../store/useStore';
import type { Attachment } from '../../store/useStore';
import { CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

const AttachmentPreview = ({ attachment }: { attachment: Attachment }) => {
  // Check if it's an image
  if (attachment.type.startsWith('image/')) {
    return (
      <div className="mt-2">
        <img 
          src={attachment.url} 
          alt={attachment.name}
          className="max-w-full max-h-48 rounded-md object-contain"
        />
        <div className="text-xs mt-1 text-muted-foreground truncate">{attachment.name}</div>
      </div>
    );
  }
  
  // For other file types, show a file icon representation
  return (
    <div className="mt-2 flex items-center gap-2 p-2 bg-background/50 rounded-md">
      <div className="w-8 h-8 flex items-center justify-center bg-muted rounded">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm truncate">{attachment.name}</div>
        {attachment.size && (
          <div className="text-xs text-muted-foreground">
            {(attachment.size / 1024).toFixed(1)} KB
          </div>
        )}
      </div>
      <a 
        href={attachment.url} 
        download={attachment.name}
        className="text-primary hover:underline text-sm"
      >
        Download
      </a>
    </div>
  );
};

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
        {message.content && <p className="text-sm">{message.content}</p>}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map((attachment) => (
              <AttachmentPreview key={attachment.id} attachment={attachment} />
            ))}
          </div>
        )}
        <div className={`flex items-center gap-1 text-xs mt-1 ${isCurrentUser ? 'text-white/80' : 'text-muted-foreground'}`}>
          {formatTime(message.timestamp)}
          {isCurrentUser && message.read && (
            <CheckCheck size={14} className="text-blue-400" />
          )}
        </div>
      </div>
    </div>
  );
};
