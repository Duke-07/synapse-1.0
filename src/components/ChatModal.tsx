'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, BookOpen, AlertCircle, X } from 'lucide-react';
import { sendChatMessage } from '../lib/api';

export interface ChatModalProps {
  analysisId?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ analysisId, isOpen = true, onClose }) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content:
        'Hello! I am Synapse-Voice’s literature assistant. Feel free to ask about your specific acoustic biomarkers, research methodologies, or why Pitch Period Entropy (PPE) and Harmonics-to-Noise Ratio (HNR) matter in Parkinsonian screening.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (isOpen === false) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const res = await sendChatMessage(userText, analysisId);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I encountered an error retrieving literature passages. Please ensure the backend is connected and try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col w-full max-w-lg">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Ask Questions About Your Results
            </h3>
            <p className="text-[11px] text-slate-400">
              Literature-grounded assistant (RAG layer)
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Message history */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1 mb-4 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                m.role === 'user'
                  ? 'bg-cyan-600 text-white font-medium rounded-tr-none'
                  : 'bg-slate-800 text-slate-200 rounded-tl-none leading-relaxed'
              }`}
            >
              <div dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, '<br/>') }} />
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl rounded-tl-none px-4 py-2.5 text-slate-400 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Searching indexed research corpus...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Why is my HNR value lower than normal?"
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          Send
        </button>
      </form>
    </div>
  );

  if (onClose) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        {modalContent}
      </div>
    );
  }

  return modalContent;
};

export default ChatModal;
