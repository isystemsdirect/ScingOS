'use client';
import React, { useState } from 'react';
import { NewCaptureWizard } from './NewCaptureWizard';
import { motion } from 'framer-motion';
import { Plus, Zap, Camera, Radar } from 'lucide-react';

interface NewCaptureButtonProps {
  position?: 'floating' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'gradient' | 'glass';
}

export const NewCaptureButton: React.FC<NewCaptureButtonProps> = ({
  position = 'floating',
  size = 'lg',
  variant = 'gradient'
}) => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-base', 
    lg: 'w-20 h-20 text-lg'
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    gradient: 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800',
    glass: 'bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30'
  };

  const positionClasses = position === 'floating' 
    ? 'fixed bottom-8 left-8 z-40'
    : '';

  return (
    <>
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsWizardOpen(true)}
        className={`
          ${positionClasses}
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          rounded-full shadow-2xl text-white font-bold transition-all duration-300
          flex items-center justify-center group relative overflow-hidden
        `}
      >
        {/* Animated Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        
        {/* Main Icon */}
        <div className="relative flex flex-col items-center">
          <Plus className={`${size === 'lg' ? 'w-8 h-8' : size === 'md' ? 'w-6 h-6' : 'w-4 h-4'} mb-1`} />
          {size === 'lg' && (
            <span className="text-xs font-semibold">NEW CAPTURE</span>
          )}
        </div>

        {/* Floating Icons Animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute"
          >
            <Camera className="w-4 h-4 absolute -top-8 left-0 text-white/60" />
            <Radar className="w-4 h-4 absolute -right-8 top-0 text-white/60" />
            <Zap className="w-4 h-4 absolute -bottom-8 right-0 text-white/60" />
          </motion.div>
        </div>

        {/* Pulse Effect */}
        {position === 'floating' && (
          <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" />
        )}
      </motion.button>

      {/* New Capture Wizard Modal */}
      <NewCaptureWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </>
  );
};
