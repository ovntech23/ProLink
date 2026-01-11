import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { MessageBubble } from '../components/messages/MessageBubble';
import { MessageInput } from '../components/messages/MessageInput';
import { ConversationList } from '../components/messages/ConversationList';
import { useIsMobile } from '../hooks/use-mobile';
import { ArrowLeft, Plus } from 'lucide-react';
import type { User } from '../store/useStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';

export const MessagesPage = () => {
  const { currentUser, users, onlineUsers, getConversations, getMessagesBetweenUsers, markMessageAsRead, sendMessage } = useStore();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const isMobile = useIsMobile();

  // Update conversations and messages when store changes
  useEffect(() => {
    if (currentUser) {
      // Update conversations
      const userConversations = getConversations(currentUser.id);
      setConversations(userConversations);

      // If there's a selected user, update messages
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

  // Listen for real-time message updates
  useEffect(() => {
    // This effect will run whenever the messages in the store change
    // The store's sendMessage function now uses WebSockets, so messages
    // will be updated in real-time
    if (currentUser && selectedUser) {
      const userMessages = getMessagesBetweenUsers(currentUser.id, selectedUser.id);
      setMessages(userMessages);

      // Update conversations as well since last message might have changed
      const userConversations = getConversations(currentUser.id);
      setConversations(userConversations);
    }
  }, [currentUser, selectedUser, getMessagesBetweenUsers, getConversations]);

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

  const handleSelectNewUser = (user: User) => {
    setSelectedUser(user);
    setIsNewMessageOpen(false);
  };

  // Get users that can be messaged (exclude current user)
  const availableUsers = users.filter(u => u.id !== currentUser?.id);

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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Messages</h2>
              <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-[#950606] hover:bg-[#7a0505]">
                    <Plus className="h-4 w-4 mr-1" /> New
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Message</DialogTitle>
                  </DialogHeader>
                  <div className="max-h-96 overflow-y-auto">
                    {availableUsers.map((user) => (
                      <div
                        key={user.id}
                        className="p-3 hover:bg-muted cursor-pointer rounded-lg transition-colors"
                        onClick={() => handleSelectNewUser(user)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-[#ba0b0b] text-white">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <ConversationList
            conversations={conversations}
            onSelectUser={handleSelectUser}
            currentUser={currentUser}
            onlineUsers={onlineUsers}
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Messages</h2>
              <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-[#950606] hover:bg-[#7a0505]">
                    <Plus className="h-4 w-4 mr-1" /> New
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Message</DialogTitle>
                  </DialogHeader>
                  <div className="max-h-96 overflow-y-auto">
                    {availableUsers.map((user) => (
                      <div
                        key={user.id}
                        className="p-3 hover:bg-muted cursor-pointer rounded-lg transition-colors"
                        onClick={() => handleSelectNewUser(user)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-[#ba0b0b] text-white">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <ConversationList
            conversations={conversations}
            onSelectUser={handleSelectUser}
            currentUser={currentUser}
            onlineUsers={onlineUsers}
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
