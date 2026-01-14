import type { Message } from '../../store/useStore';
import type { Attachment } from '../../store/useStore';
import { CheckCheck, Reply, Smile } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useStore } from '../../store/useStore';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  senderAvatar?: string;
  senderName?: string;
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

const AttachmentPreview = ({ attachment }: { attachment: Attachment }) => {
  // Check if it's an image
  if (attachment.type.startsWith('image/')) {
    return (
      <div className="mt-2 text-left">
        <img
          src={attachment.url}
          alt={attachment.name}
          className="max-w-full max-h-48 rounded-md object-contain"
        />
        <div className="text-[10px] mt-1 opacity-70 truncate">{attachment.name}</div>
      </div>
    );
  }

  // For other file types, show a file icon representation
  return (
    <div className="mt-2 flex items-center gap-2 p-2 bg-black/10 rounded-md text-left">
      <div className="w-8 h-8 flex items-center justify-center bg-black/20 rounded">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs truncate">{attachment.name}</div>
        {attachment.size && (
          <div className="text-[10px] opacity-70">
            {(attachment.size / 1024).toFixed(1)} KB
          </div>
        )}
      </div>
      <a
        href={attachment.url}
        download={attachment.name}
        className="text-inherit hover:underline text-xs font-bold"
      >
        Download
      </a>
    </div>
  );
};

export const MessageBubble = ({ message, isCurrentUser, senderAvatar, senderName }: MessageBubbleProps) => {
  const { setReplyTo, addReaction, currentUser } = useStore();

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleReply = () => {
    setReplyTo({
      messageId: message.id,
      content: message.content,
      senderName: senderName || (isCurrentUser ? 'You' : 'User')
    });
  };

  const handleReact = (emoji: string) => {
    addReaction(message.id, emoji);
  };

  const UserAvatar = () => (
    <Avatar className="w-8 h-8 shrink-0">
      <AvatarImage src={senderAvatar} alt={senderName || 'User'} className="object-cover" />
      <AvatarFallback className="bg-[#ba0b0b] text-white text-xs">
        {senderName ? senderName.charAt(0) : '?'}
      </AvatarFallback>
    </Avatar>
  );

  // Group reactions by emoji
  const reactionsMap = (message.reactions || []).reduce((acc, curr) => {
    acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const hasReacted = (emoji: string) =>
    message.reactions?.some(r => r.user === currentUser?.id && r.emoji === emoji);

  return (
    <div className={`flex flex-col gap-1 ${isCurrentUser ? 'items-end' : 'items-start'} mb-4 group`}>
      <div className={`flex items-end gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <UserAvatar />

        <div className="relative flex flex-col gap-1">
          {/* Action Menu (Reply/React) */}
          <div className={`absolute top-0 ${isCurrentUser ? '-left-12' : '-right-12'} opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleReply}>
              <Reply size={14} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <Smile size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isCurrentUser ? 'end' : 'start'} className="flex p-1">
                {EMOJIS.map(emoji => (
                  <DropdownMenuItem
                    key={emoji}
                    className="cursor-pointer p-2 text-lg hover:bg-muted"
                    onClick={() => handleReact(emoji)}
                  >
                    {emoji}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${isCurrentUser
            ? 'bg-[#ba0b0b] text-white rounded-tr-none'
            : 'bg-muted text-foreground rounded-tl-none'
            }`}>
            {/* Reply Context */}
            {message.replyTo && (
              <div className="mb-2 p-2 bg-black/10 rounded-md border-l-2 border-white/50 text-xs italic opacity-80 truncate">
                <p className="font-bold not-italic">{message.replyTo.senderName}</p>
                {message.replyTo.content}
              </div>
            )}

            {message.content && <p className="text-sm leading-relaxed">{message.content}</p>}

            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment) => (
                  <AttachmentPreview key={attachment.id} attachment={attachment} />
                ))}
              </div>
            )}

            <div className={`flex items-center gap-1 text-[10px] mt-1 ${isCurrentUser ? 'text-white/70' : 'text-muted-foreground'}`}>
              {formatTime(message.timestamp)}
              {isCurrentUser && message.read && (
                <CheckCheck size={12} className="text-blue-400" />
              )}
            </div>
          </div>

          {/* Reactions Display */}
          {Object.keys(reactionsMap).length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
              {Object.entries(reactionsMap).map(([emoji, count]) => (
                <Badge
                  key={emoji}
                  variant="outline"
                  className={`px-1.5 py-0.5 text-xs gap-1 cursor-pointer hover:bg-muted transition-colors border-muted-foreground/20 rounded-full
                    ${hasReacted(emoji) ? 'bg-[#ba0b0b]/10 border-[#ba0b0b]/30' : 'bg-background'}
                  `}
                  onClick={() => handleReact(emoji)}
                >
                  <span>{emoji}</span>
                  {count > 1 && <span className="font-bold opacity-70">{count}</span>}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
