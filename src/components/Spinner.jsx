import React from 'react';
import { motion } from 'framer-motion';

export const Spinner = ({ 
  size = 'md', 
  color = 'white', 
  className = '',
  text = '',
  variant = 'circle'
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const colorClasses = {
    white: 'border-white border-t-transparent',
    blue: 'border-blue-600 border-t-transparent',
    gray: 'border-gray-600 border-t-transparent',
    green: 'border-green-600 border-t-transparent',
    red: 'border-red-600 border-t-transparent'
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  if (variant === 'dots') {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={`${sizeClasses[size]} bg-current rounded-full`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.2
            }}
          />
        ))}
        {text && (
          <span className={`ml-2 ${textSizeClasses[size]}`}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <motion.div
          className={`${sizeClasses[size]} bg-current rounded-full`}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        {text && (
          <span className={`${textSizeClasses[size]}`}>
            {text}
          </span>
        )}
      </div>
    );
  }

  // Default circle spinner
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-2 ${colorClasses[color]} rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      {text && (
        <span className={`${textSizeClasses[size]} ${color === 'white' ? 'text-white' : 'text-gray-700'}`}>
          {text}
        </span>
      )}
    </div>
  );
};