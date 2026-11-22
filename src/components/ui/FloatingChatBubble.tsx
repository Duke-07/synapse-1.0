'use client';

import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { ChatModal } from '@/components/ChatModal';

export const FloatingChatBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Trigger Button in Bottom-Right */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Clinical Assistant'}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.35, ease: [0.2, 1.3, 0.4, 1] }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-6 right-6 sm:right-8 z-50 w-14 h-14 rounded-full bg-[#0060ca] hover:bg-[#090089] text-white shadow-[0_8px_24px_rgba(0,96,202,0.45)] flex items-center justify-center cursor-pointer transition-colors"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-6 h-6 fill-current text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#fcdc74] border-2 border-[#0060ca]" />
          </div>
        )}
      </motion.button>

      {/* Modern Bottom-Right Anchored AI Assistant Widget */}
      {isOpen && (
        <ChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
};

export default FloatingChatBubble;
