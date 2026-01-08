import type { User } from '../../store/useStore';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface Conversation {
  user: User;
  lastMessage: any;
  unreadCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  onSelectUser: (user: User) => void;
  currentUser: User | null;
}

export const ConversationList = ({ conversations, onSelectUser, currentUser }: ConversationListProps) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="overflow-y-auto h-[calc(100vh-6rem)]">
      {conversations.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          <p>No conversations yet</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {conversations.map((conversation) => {
            const { user, lastMessage, unreadCount } = conversation;
            const isCurrentUserSender = lastMessage.senderId === currentUser?.id;
            
            return (
              <div
                key={user.id}
                className="p-4 hover:bg-muted cursor-pointer transition-colors"
                onClick={() => onSelectUser(user)}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-[#ba0b0b] text-white">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-medium text-foreground truncate">{user.name}</h4>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(lastMessage.timestamp)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground truncate">
                        {isCurrentUserSender ? `You: ${lastMessage.content}` : lastMessage.content}
                      </p>
                      {unreadCount > 0 && (
<span className="bg-[#ba0b0b] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shrink-0">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
