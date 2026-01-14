import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Send, Paperclip, Smile, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useStore } from '../../store/useStore';
import type { Attachment } from '../../store/useStore';

const EMOJI_CATEGORIES = [
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕']
  },
  {
    name: 'Hands & People',
    emojis: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾']
  },
  {
    name: 'Hearts & Symbols',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈️', '♉️', '♊️', '♋️', '♌️', '♍️', '♎️', '♏️', '♐️', '♑️', '♒️', '♓️', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚️', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆓', '🆔', '🅾️', '🆗', '🅿️', '🆖', '🆙', '🆓', '🆕', '🆒', '🆓', '🆎', '🆑', '🆘', '📍', '🚩']
  },
  {
    name: 'Transport & Logistics',
    emojis: ['🚚', '🚛', '📦', '🏗️', '⛽', '🛣️', '🏢', '🏗️', '🗺️', '🚢', '✈️', '🚂', '🚲', '🚜', '🛠️', '🧰', '🔧', '🧱', '🏗️', '🚦', '⚓', '⛽', '🚨']
  },
];

interface MessageInputProps {
  onSend: (content: string, attachments?: Attachment[]) => void;
}

export const MessageInput = ({ onSend }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const { replyTo, setReplyTo } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || attachments.length > 0) {
      onSend(message.trim(), attachments);
      setMessage('');
      setAttachments([]);
    }
  };

  const addEmoji = (emoji: string) => {
    const input = inputRef.current;
    if (!input) {
      setMessage(prev => prev + emoji);
      return;
    }

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const newMessage = message.substring(0, start) + emoji + message.substring(end);

    setMessage(newMessage);

    // Set cursor position after insertion
    setTimeout(() => {
      input.focus();
      const newCursorPos = start + emoji.length;
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newAttachments: Attachment[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const attachment: Attachment = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file),
          size: file.size
        };
        newAttachments.push(attachment);
      }

      setAttachments(prev => [...prev, ...newAttachments]);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== id));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 relative">
      {/* Reply Preview */}
      {replyTo && (
        <div className="flex items-center justify-between p-2 bg-muted/80 backdrop-blur-sm border-l-4 border-[#ba0b0b] rounded-t-lg animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#ba0b0b] uppercase tracking-wider">Replying to {replyTo.senderName}</p>
            <p className="text-xs text-muted-foreground truncate">{replyTo.content}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={() => setReplyTo(null)}
          >
            <X size={12} />
          </Button>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border border-dashed border-border rounded-lg">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center gap-2 bg-muted p-2 rounded-md">
              <span className="text-sm truncate max-w-30">{attachment.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(attachment.id)}
                className="text-destructive hover:text-destructive/80"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
          accept="*/*"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip size={16} />
        </Button>

        {/* Emoji Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="hover:bg-muted"
            >
              <Smile size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            className="w-80 p-0 overflow-hidden border-border bg-background/95 backdrop-blur-md shadow-2xl rounded-xl"
          >
            <div className="h-72 overflow-y-auto scrollbar-hide p-2 bg-gradient-to-br from-background to-muted/30">
              {EMOJI_CATEGORIES.map((category) => (
                <div key={category.name} className="mb-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-2 flex items-center gap-2">
                    <span className="w-1 h-1 bg-[#ba0b0b] rounded-full" />
                    {category.name}
                  </h4>
                  <div className="grid grid-cols-8 gap-1">
                    {category.emojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => addEmoji(emoji)}
                        className="text-xl hover:bg-muted p-1.5 rounded-lg transition-all hover:scale-125 hover:rotate-6 active:scale-95 duration-200"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-border bg-muted/20 text-[10px] text-center text-muted-foreground font-medium italic">
              ProLink Expressive Toolkit 🚚 Express yourself!
            </div>
          </PopoverContent>
        </Popover>

        <Input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-muted/30 border-muted focus-visible:ring-[#ba0b0b]"
        />
        <Button type="submit" size="icon" className="bg-[#ba0b0b] hover:bg-[#950606] shadow-lg active:scale-95 transition-all" disabled={!message.trim() && attachments.length === 0}>
          <Send size={16} />
        </Button>
      </div>
    </form>
  );
};
