import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Loader2,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  typing?: boolean;
}

interface ChatBotProps {
  variant?: 'floating' | 'embedded';
  className?: string;
}

const QUICK_QUESTIONS = [
  "How do I optimize my CV for ATS?",
  "What's B-BBEE compliance for CVs?",
  "How does job matching work?",
  "What are your pricing plans?",
  "How do I upload my CV?",
  "What makes a good SA resume?"
];

const GREETING_MESSAGES = [
  "Hi! I'm your AI career assistant. How can I help optimize your job search today?",
  "Hello! Ready to boost your career? Ask me anything about CV optimization or job searching in South Africa.",
  "Welcome! I'm here to help with CV analysis, job matching, and career advice. What would you like to know?"
];

export default function ChatBot({ variant = 'floating', className = '' }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [sessionId] = useState(() => `chat_${Date.now()}_${Math.random()}`);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with greeting message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = GREETING_MESSAGES[Math.floor(Math.random() * GREETING_MESSAGES.length)];
      setMessages([{
        id: 'greeting',
        content: greeting,
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  }, [isOpen, messages.length]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; sessionId: string }) => {
      return await apiRequest('/api/chat/message', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (response) => {
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => !msg.typing));
      
      // Add bot response
      setMessages(prev => [...prev, {
        id: `bot_${Date.now()}`,
        content: response.message,
        sender: 'bot',
        timestamp: new Date()
      }]);
    },
    onError: (error) => {
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => !msg.typing));
      
      // Add error message
      setMessages(prev => [...prev, {
        id: `error_${Date.now()}`,
        content: "I'm having trouble responding right now. Please try again or contact support if the issue persists.",
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  });

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || chatMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      content: currentMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    const typingMessage: ChatMessage = {
      id: 'typing',
      content: '',
      sender: 'bot',
      timestamp: new Date(),
      typing: true
    };

    setMessages(prev => [...prev, userMessage, typingMessage]);
    setCurrentMessage('');

    // Send to API
    chatMutation.mutate({
      message: userMessage.content,
      sessionId
    });
  };

  const handleQuickQuestion = (question: string) => {
    setCurrentMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (variant === 'floating') {
    return (
      <>
        {/* Floating Chat Button */}
        {!isOpen && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
              <MessageCircle className="h-6 w-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </Button>
          </div>
        )}

        {/* Chat Window */}
        {isOpen && (
          <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] max-h-[600px]">
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-md">
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Bot className="h-6 w-6" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">Career Assistant</CardTitle>
                      <p className="text-sm text-blue-100">AI-powered career guidance</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMinimized(!isMinimized)}
                      className="text-white hover:bg-white/20 h-8 w-8 p-0"
                    >
                      {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="text-white hover:bg-white/20 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {!isMinimized && (
                <CardContent className="p-0">
                  {/* Messages Area */}
                  <ScrollArea className="h-80 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              message.sender === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
                            }`}>
                              {message.sender === 'user' ? (
                                <User className="h-4 w-4" />
                              ) : (
                                <Bot className="h-4 w-4" />
                              )}
                            </div>
                            <div className={`rounded-lg px-3 py-2 ${
                              message.sender === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              {message.typing ? (
                                <div className="flex items-center space-x-1">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  <span className="text-sm">Thinking...</span>
                                </div>
                              ) : (
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div ref={messagesEndRef} />
                  </ScrollArea>

                  {/* Quick Questions */}
                  {messages.length <= 1 && (
                    <div className="p-4 border-t bg-gray-50">
                      <p className="text-xs text-gray-600 mb-2 flex items-center">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Quick questions to get started:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {QUICK_QUESTIONS.slice(0, 3).map((question, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickQuestion(question)}
                            className="text-xs h-6 px-2 bg-white hover:bg-blue-50 hover:border-blue-300"
                          >
                            {question}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input Area */}
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Input
                        ref={inputRef}
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about CV optimization, jobs, or career advice..."
                        className="flex-1 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        disabled={chatMutation.isPending}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!currentMessage.trim() || chatMutation.isPending}
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0"
                      >
                        {chatMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        )}
      </>
    );
  }

  // Embedded variant for in-page use
  return (
    <div className={`w-full ${className}`}>
      <Card className="border shadow-lg">
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center space-x-2">
            <Bot className="h-6 w-6" />
            <div>
              <CardTitle className="text-lg">AI Career Assistant</CardTitle>
              <p className="text-sm text-blue-100">Get instant answers about your career journey</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-96 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div className={`rounded-lg px-3 py-2 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {message.typing ? (
                        <div className="flex items-center space-x-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="p-4 border-t bg-gray-50">
              <p className="text-sm text-gray-600 mb-3 flex items-center">
                <HelpCircle className="h-4 w-4 mr-2" />
                Popular questions:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUICK_QUESTIONS.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickQuestion(question)}
                    className="text-left justify-start h-auto py-2 px-3 bg-white hover:bg-blue-50 hover:border-blue-300"
                  >
                    <span className="text-xs">{question}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about CV optimization, jobs, or career advice..."
                className="flex-1"
                disabled={chatMutation.isPending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || chatMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {chatMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}