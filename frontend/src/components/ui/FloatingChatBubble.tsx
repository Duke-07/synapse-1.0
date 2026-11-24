'use client';

import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { ChatModal } from '@/components/ChatModal';

export const FloatingChatBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Clinical Assistant'}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-6 sm:right-8 z-50 w-14 h-14 rounded-full bg-[#116466] hover:bg-[#0c4b4d] text-white shadow-[0_8px_24px_rgba(17,100,102,0.35)] flex items-center justify-center cursor-pointer transition-colors"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-6 h-6 fill-current text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FFCB9A] border-2 border-[#116466]" />
          </div>
        )}
      </motion.button>

      {isOpen && (
        <ChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
};

export default FloatingChatBubble;
