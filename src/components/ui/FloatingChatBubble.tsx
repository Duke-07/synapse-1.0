'use client';

import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatModal } from '@/components/ChatModal';

export const FloatingChatBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Literature Assistant"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4, ease: [0.2, 1.3, 0.4, 1] }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#1D63FF] text-white shadow-[0_8px_24px_rgba(29,99,255,0.4)] flex items-center justify-center cursor-pointer hover:bg-[#1453E6] transition-colors"
      >
        <MessageSquare className="w-6 h-6 fill-current text-white" />
      </motion.button>

      {isOpen && (
        <ChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
};

export default FloatingChatBubble;
