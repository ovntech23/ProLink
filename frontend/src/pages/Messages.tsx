import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { MessageBubble } from '../components/messages/MessageBubble';
import { MessageInput } from '../components/messages/MessageInput.tsx';
import { ConversationList } from '../components/messages/ConversationList';
import { useIsMobile } from '../hooks/use-mobile';
import { ArrowLeft } from 'lucide-react';
import type { User } from '../store/useStore';

export const MessagesPage = () => {
  const { currentUser, getConversations, getMessagesBetweenUsers, markMessageAsRead, sendMessage } = useStore();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (currentUser) {
      const userConversations = getConversations(currentUser.id);
      setConversations(userConversations);
      
      // If there's a selected user, load messages
      if (selectedUser) {
        const userMessages = getMessagesBetweenUsers(currentUser.id, selectedUser.id);
        setMessages(userMessages);
        
        // Mark messages as read
        userMessages
          .filter(m => m.recipientId === currentUser.id && !m.read)
          .forEach(m => markMessageAsRead(m.id));
      }
    }
  }, [currentUser, selectedUser, getConversations, getMessagesBetweenUsers, markMessageAsRead]);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    
    if (currentUser) {
      const userMessages = getMessagesBetweenUsers(currentUser.id, user.id);
      setMessages(userMessages);
      
      // Mark messages as read
      userMessages
        .filter(m => m.recipientId === currentUser.id && !m.read)
        .forEach(m => markMessageAsRead(m.id));
      
      // Refresh conversations
      const updatedConversations = getConversations(currentUser.id);
      setConversations(updatedConversations);
    }
  };

  const handleSendMessage = (content: string, attachments?: any[]) => {
    if (!currentUser || !selectedUser) return;

    // Send message through store
    sendMessage(selectedUser.id, content, attachments);

    // Refresh messages and conversations
    if (currentUser) {
      const userMessages = getMessagesBetweenUsers(currentUser.id, selectedUser.id);
      setMessages(userMessages);

      const updatedConversations = getConversations(currentUser.id);
      setConversations(updatedConversations);
    }
  };

  if (!currentUser) {
    return <div className="p-8 text-center">Please log in to view messages.</div>;
  }

  if (isMobile) {
    if (selectedUser) {
      // Show thread with back button
      return (
        <div className="flex h-[calc(100vh-2rem)] bg-white rounded-xl shadow-lg overflow-hidden flex-col">
          <div className="p-4 border-b border-border bg-muted flex items-center gap-2">
            <button onClick={() => setSelectedUser(null)} className="p-1 hover:bg-muted rounded">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h3 className="font-semibold text-foreground">{selectedUser.name}</h3>
              <p className="text-sm text-muted-foreground capitalize">{selectedUser.role}</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isCurrentUser={message.senderId === currentUser.id}
              />
            ))}
          </div>
          <div className="p-4 border-t border-border">
            <MessageInput onSend={handleSendMessage} />
          </div>
        </div>
      );
    } else {
      // Show conversation list
      return (
        <div className="h-[calc(100vh-2rem)] bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Messages</h2>
          </div>
          <ConversationList
            conversations={conversations}
            onSelectUser={handleSelectUser}
            currentUser={currentUser}
          />
        </div>
      );
    }
  } else {
    // Desktop layout
    return (
      <div className="flex h-[calc(100vh-2rem)] bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Conversation List */}
        <div className="w-1/3 border-r border-border">
          <div className="p-4 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Messages</h2>
          </div>
          <ConversationList
            conversations={conversations}
            onSelectUser={handleSelectUser}
            currentUser={currentUser}
          />
        </div>

        {/* Message Thread */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              <div className="p-4 border-b border-border bg-muted">
                <h3 className="font-semibold text-foreground">{selectedUser.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{selectedUser.role}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isCurrentUser={message.senderId === currentUser.id}
                  />
                ))}
              </div>
              <div className="p-4 border-t border-border">
                <MessageInput onSend={handleSendMessage} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    );
  }
};
