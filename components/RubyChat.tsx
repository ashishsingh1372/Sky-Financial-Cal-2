import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, Bot } from 'lucide-react';
import { ChatMessage, LoadingState } from '../types';
import { sendMessageToRuby, initializeChat } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const RubyChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Namaste! I'm **Ruby**, your personal financial assistant. Ask me about SIPs, Loans, Tax planning, or any other financial topic!",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat on mount
  useEffect(() => {
    initializeChat();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputText.trim() || loadingState !== LoadingState.IDLE) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoadingState(LoadingState.STREAMING);

    // Placeholder for AI response
    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: aiMsgId,
      role: 'model',
      text: '',
      timestamp: new Date()
    }]);

    try {
      let fullText = '';
      const stream = sendMessageToRuby(userMsg.text);
      
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === aiMsgId ? { ...msg, text: fullText } : msg
        ));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingState(LoadingState.IDLE);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-105 duration-300 flex items-center gap-2 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="font-medium pr-1">Ask Ruby</span>
      </button>

      {/* Chat Window */}
      <div className={`fixed z-50 bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[400px] h-[100dvh] sm:h-[600px] bg-white sm:rounded-2xl shadow-2xl flex flex-col transition-all duration-300 transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-[110%] opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:rounded-t-2xl flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
               <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Ruby</h3>
              <p className="text-xs text-indigo-100 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Financial Advisor
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                }`}
              >
                 {msg.role === 'model' ? (
                   <div className="markdown prose prose-sm max-w-none prose-p:my-1 prose-a:text-indigo-600 prose-strong:text-slate-900">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                      {msg.text === '' && <span className="animate-pulse">Thinking...</span>}
                   </div>
                 ) : (
                   msg.text
                 )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100 sm:rounded-b-2xl">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about SIP, Loans, Tax..."
              className="flex-1 bg-transparent outline-none text-slate-700 placeholder-slate-400 text-sm"
              disabled={loadingState !== LoadingState.IDLE}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || loadingState !== LoadingState.IDLE}
              className={`p-2 rounded-full ${
                inputText.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400'
              } transition-colors`}
            >
              {loadingState !== LoadingState.IDLE ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
           <div className="text-center mt-2">
            <span className="text-[10px] text-slate-400">Ruby can make mistakes. Verify critical financial data.</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default RubyChat;
