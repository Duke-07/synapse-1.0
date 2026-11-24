'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  RotateCcw,
  X,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendChatMessage } from '@/lib/api';

export interface ChatModalProps {
  analysisId?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: Array<{
    title: string;
    authors: string;
    year: number;
    journal: string;
    doi: string;
  }>;
  suggestedQuestions?: string[];
}

const INITIAL_SUGGESTIONS = [
  'What are the earliest signs of Parkinson’s?',
  'Why does voice become quiet or hoarse in PD?',
  'How does Levodopa (Sinemet) work in the brain?',
  'What is Pitch Period Entropy (PPE) & HNR?',
  'How does LSVT LOUD therapy restore vocal loudness?',
  'What is the difference between Essential Tremor & PD?',
];

export const ChatModal: React.FC<ChatModalProps> = ({
  analysisId,
  isOpen = true,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        `Hello! I am your **Synapse-Voice Clinical Research Assistant**.\n\n` +
        `I have comprehensive clinical knowledge of Parkinson's disease, hypokinetic dysarthria, and acoustic voice screening. ` +
        `You can ask me **anything** about:\n` +
        `* **Early Symptoms**: Resting tremor, bradykinesia, loss of smell, and sleep disorders.\n` +
        `* **Vocal Biomarkers**: Pitch Period Entropy (PPE), Jitter, Shimmer, and Harmonics-to-Noise Ratio (HNR).\n` +
        `* **Medications & Surgery**: Levodopa/Carbidopa, dopamine agonists, and Deep Brain Stimulation (DBS).\n` +
        `* **Speech Rehabilitation**: LSVT LOUD® voice exercises and neuroplastic physical training.`,
      suggestedQuestions: INITIAL_SUGGESTIONS,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, loading]);

  if (!isOpen) return null;

  const handleSendText = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const res = await sendChatMessage(text, analysisId);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply,
          citations: res.citations as any,
          suggestedQuestions: (res as any).suggestedQuestions,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I encountered a brief connection error, but I can still answer any questions about Parkinson’s disease symptoms, vocal biomarkers, treatments, or therapy. Please try asking again!',
          suggestedQuestions: INITIAL_SUGGESTIONS.slice(0, 3),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendText(input);
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          `Conversation reset. What would you like to know about Parkinson's disease, acoustic voice screening, or treatments?`,
        suggestedQuestions: INITIAL_SUGGESTIONS,
      },
    ]);
  };

  const formatMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-serif text-base font-normal text-[#2C3531] mt-2.5 mb-1 tracking-tight">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('#### ')) {
        return (
          <h5 key={idx} className="font-display text-xs sm:text-sm font-semibold text-[#116466] uppercase tracking-wider mt-2 mb-0.5">
            {line.replace('#### ', '')}
          </h5>
        );
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const bulletText = line.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-xs sm:text-sm text-[#2C3531]/85 my-0.5 leading-relaxed font-sans">
            <span dangerouslySetInnerHTML={{ __html: renderInlineFormatting(bulletText) }} />
          </li>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="text-xs sm:text-sm text-[#2C3531]/90 leading-relaxed my-0.5 font-sans">
          <span dangerouslySetInnerHTML={{ __html: renderInlineFormatting(line) }} />
        </p>
      );
    });
  };

  const renderInlineFormatting = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-[#2C3531]">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-[#116466]">$1</em>')
      .replace(/\$(.*?)\$/g, '<code class="bg-[#D1E8E2]/60 px-1 py-0.5 rounded text-[11px] font-mono text-[#116466]">$1</code>');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
        className="fixed bottom-24 right-4 sm:right-7 z-50 w-[92vw] sm:w-[420px] max-w-[440px] h-[580px] max-h-[82vh] flex flex-col bg-white rounded-3xl shadow-[0_20px_50px_rgba(44,53,49,0.22)] border border-[#D9B08C]/40 overflow-hidden"
        style={{ pointerEvents: 'auto' }}
      >
        {/* Header (Architectural Dark Charcoal) */}
        <div className="bg-[#2C3531] text-[#EBF4F1] px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-[#D9B08C]/30 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#116466] text-[#EBF4F1] flex items-center justify-center font-bold shadow-xs shrink-0">
              <Sparkles className="w-4 h-4 text-[#FFCB9A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-normal tracking-tight text-[#EBF4F1] leading-tight">
                  Synapse Intelligence
                </h3>
                <span className="w-2 h-2 rounded-full bg-[#116466] ring-2 ring-[#D1E8E2]/40 animate-pulse" title="Ready to answer" />
              </div>
              <p className="text-[11px] text-[#D1E8E2]/80 font-sans leading-tight">
                Parkinson&apos;s &amp; Acoustic Voice Research
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReset}
              title="Reset conversation"
              aria-label="Reset conversation"
              className="p-1.5 rounded-full text-[#D1E8E2]/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                title="Minimize assistant"
                aria-label="Minimize assistant"
                className="p-1.5 rounded-full text-[#D1E8E2]/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F7FAF9]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl p-3.5 ${
                  m.role === 'user'
                    ? 'bg-[#116466] text-white rounded-tr-none shadow-xs text-xs sm:text-sm font-medium'
                    : 'bg-white text-[#2C3531] rounded-tl-none border border-[#D9B08C]/35 shadow-[0_2px_8px_rgba(44,53,49,0.04)]'
                }`}
              >
                {m.role === 'user' ? (
                  <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                ) : (
                  <div>{formatMarkdown(m.content)}</div>
                )}
              </div>

              {/* Citations block for assistant responses */}
              {m.role === 'assistant' && m.citations && m.citations.length > 0 && (
                <div className="mt-2 space-y-1 max-w-[90%]">
                  <div className="flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase text-[#116466]">
                    <BookOpen className="w-3 h-3" />
                    <span>Verified Clinical Literature ({m.citations.length})</span>
                  </div>
                  <div className="space-y-1">
                    {m.citations.map((c, cIdx) => (
                      <div
                        key={cIdx}
                        className="bg-[#D1E8E2]/40 border border-[#116466]/20 rounded-xl px-2.5 py-1.5 text-[11px] text-[#2C3531]/80 flex items-center justify-between gap-2"
                      >
                        <div className="truncate">
                          <span className="font-semibold text-[#2C3531]">{c.authors}</span> ({c.year}):{' '}
                          <span className="italic">{c.title}</span> &mdash; <strong className="font-semibold">{c.journal}</strong>
                        </div>
                        {c.doi && (
                          <a
                            href={c.doi.startsWith('http') ? c.doi : `https://doi.org/${c.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-[#116466] hover:underline flex items-center gap-0.5 font-medium"
                          >
                            <span>DOI</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Questions Chips */}
              {m.role === 'assistant' && m.suggestedQuestions && m.suggestedQuestions.length > 0 && idx === messages.length - 1 && (
                <div className="mt-2.5 pt-2 border-t border-[#D9B08C]/30 w-full space-y-1.5">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-[#2C3531]/60">
                    Suggested Inquiries:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {m.suggestedQuestions.map((sq, sqIdx) => (
                      <button
                        key={sqIdx}
                        onClick={() => handleSendText(sq)}
                        disabled={loading}
                        className="text-left text-[11px] bg-white hover:bg-[#D1E8E2]/60 text-[#2C3531] hover:text-[#116466] border border-[#D9B08C]/40 hover:border-[#116466]/40 rounded-full px-3 py-1 transition-all duration-150 active:scale-95 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {sq}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start">
              <div className="bg-white border border-[#D9B08C]/30 rounded-2xl rounded-tl-none p-3 shadow-xs flex items-center gap-2 text-xs text-[#2C3531]/70">
                <span className="w-2 h-2 rounded-full bg-[#116466] animate-pulse" />
                <span>Synthesizing clinical literature &amp; neurology evidence...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-3 bg-white border-t border-[#D9B08C]/30 space-y-2 shrink-0">
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about Parkinson's, biomarkers, therapies..."
              disabled={loading}
              className="flex-1 bg-[#F7FAF9] border border-[#D9B08C]/40 focus:border-[#116466] focus:bg-white rounded-full px-4 py-2.5 text-xs sm:text-sm text-[#2C3531] placeholder-[#2C3531]/50 focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="w-10 h-10 rounded-full bg-[#116466] hover:bg-[#0c4b4d] disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[10px] text-[#2C3531]/60 text-center font-normal leading-tight">
            Academic pre-clinical AI assistant &middot; Not a substitute for professional neurological diagnosis
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatModal;
