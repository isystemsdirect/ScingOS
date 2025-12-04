import { MicrophoneIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

interface VoiceButtonProps {
  isListening: boolean;
  onClick: () => void;
}

export function VoiceButton({ isListening, onClick }: VoiceButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        relative w-24 h-24 rounded-full flex items-center justify-center
        transition-all duration-300 shadow-lg
        ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-primary-600 hover:bg-primary-700'}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isListening && (
        <motion.div
          className="absolute inset-0 rounded-full bg-red-400 opacity-50"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      
      <MicrophoneIcon className="w-12 h-12 text-white relative z-10" />
    </motion.button>
  );
}