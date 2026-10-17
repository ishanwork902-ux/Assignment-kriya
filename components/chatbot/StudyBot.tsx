"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, X, MessageSquare, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  file?: string;
}

export const StudyBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: '1',
        text: "Hi! I'm StudyBot. Upload your assignment file or ask me anything, and I'll help you solve it! 📚",
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Helper to convert file to Base64 for Gemini
  const fileToGenerativePart = async (file: File) => {
    return new Promise<{ inlineData: { data: string, mimeType: string } }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = (reader.result as string).split(',')[1];
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type,
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSend = async () => {
    if (!input.trim() && !attachedFile) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
      file: attachedFile ? attachedFile.name : undefined,
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    const currentFile = attachedFile;
    setInput('');
    setAttachedFile(null);
    setIsTyping(true);

    try {
      let fileData = null;
      if (currentFile) {
        fileData = await fileToGenerativePart(currentFile);
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          fileData: fileData
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        text: data.text,
        sender: 'bot',
        timestamp: new Date(),
      }]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        text: `Sorry, I ran into an error: ${error.message}. Please make sure your API key is set correctly!`,
        sender: 'bot',
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachedFile(file);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="p-4 bg-indigo-600 text-white rounded-full shadow-2xl cursor-pointer flex items-center justify-center"
          >
            <MessageSquare size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="bg-white w-80 md:w-96 h-[500px] rounded-3xl shadow-2xl border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-indigo-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold">StudyBot AI</h3>
                  <p className="text-xs text-indigo-200">Online | Powered by Gemini</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border rounded-tl-none shadow-sm'
                  }`}>
                    {msg.file && (
                      <div className="flex items-center gap-2 p-2 mb-2 bg-black/10 rounded-lg text-xs italic">
                        <Paperclip size={12} /> {msg.file}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none border shadow-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-indigo-600" />
                    <span className="text-xs text-slate-500">StudyBot is thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t">
              {attachedFile && (
                <div className="flex items-center justify-between p-2 mb-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs border border-indigo-100">
                  <span className="flex items-center gap-2 truncate">
                    <Paperclip size={12} /> {attachedFile.name}
                  </span>
                  <button onClick={() => setAttachedFile(null)} className="hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <label className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
                  <Paperclip size={20} />
                  <input type="file" className="hidden" onChange={handleFileChange} />
                </label>
                <input
                  className="flex-1 p-2 bg-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="Ask a question..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() && !attachedFile}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
