
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, MessageSquare, X, Send, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { ChatMessage } from '@/types';
import { generateChatbotResponse } from '@/services/chatbotService';
import { useToast } from '@/hooks/use-toast';

const ChatbotWidget: React.FC = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI advertising assistant. How can I help you today with your TV advertising needs?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus on input when chat is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setHasError(false);
    
    try {
      // Get the last 6 messages for context
      const recentHistory = [...messages.slice(-6), userMessage];
      
      // Use the chatbot service
      const responseText = await generateChatbotResponse(input, recentHistory);
      
      // Add AI response
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      setHasError(true);
      
      // Show error toast
      toast({
        title: "Connection Error",
        description: "Failed to connect to the AI service. Please try again later.",
        variant: "destructive",
      });
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please try again later.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const retryConnection = () => {
    if (messages.length > 1) {
      const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
      if (lastUserMessage) {
        setInput(lastUserMessage.content);
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <Card className="w-80 md:w-96 shadow-lg mb-2 border bg-card">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-md font-medium">Ad Assistant</CardTitle>
            <Button variant="ghost" size="icon" onClick={toggleChat}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <div className="h-[350px] px-4 overflow-y-auto" ref={scrollAreaRef}>
            <CardContent className="pt-0 pb-3">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-muted flex items-center">
                      <Loader2 className="h-3 w-3 animate-spin mr-2" />
                      Thinking...
                    </div>
                  </div>
                )}
                {hasError && !isLoading && (
                  <div className="flex justify-center my-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={retryConnection}
                      className="text-xs flex items-center gap-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      Connection error. Click to retry
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </div>
          <CardFooter className="p-3 border-t">
            <form onSubmit={sendMessage} className="flex w-full gap-2">
              <Textarea
                ref={inputRef}
                placeholder="Type your message..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1 min-h-[40px] max-h-[120px]"
                rows={1}
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={isLoading || !input.trim()}
                className="h-10 w-10"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
      <Button
        onClick={toggleChat}
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default ChatbotWidget;
