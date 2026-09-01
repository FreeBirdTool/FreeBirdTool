import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

const slogans = [
  "Create stunning visuals",
  "Turn ideas into reality",
  "Design faster with AI",
  "Professional results, minimal effort"
];

export const Header: React.FC = () => {
  const [currentSloganIndex, setCurrentSloganIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentSlogan = slogans[currentSloganIndex];
    let timeoutId: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayedText.length < currentSlogan.length) {
        // Typing
        timeoutId = setTimeout(() => {
          setDisplayedText(currentSlogan.slice(0, displayedText.length + 1));
        }, 50); // typing speed
      } else {
        // Pause before deleting
        timeoutId = setTimeout(() => {
          setIsDeleting(true);
        }, 2000); // pause duration
      }
    } else {
      if (displayedText.length > 0) {
        // Deleting
        timeoutId = setTimeout(() => {
          setDisplayedText(currentSlogan.slice(0, displayedText.length - 1));
        }, 30); // deleting speed
      } else {
        // Move to next slogan
        setIsDeleting(false);
        setCurrentSloganIndex((prev) => (prev + 1) % slogans.length);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [displayedText, isDeleting, currentSloganIndex]);

  return (
    <header className="border-b border-gray-800 bg-gray-950 sticky top-0 z-50">
      <div className="w-full py-6 flex flex-col items-center justify-center">
        {/* Animated Logo */}
        <motion.div
          className="mb-4 flex items-center justify-center"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="36" 
            height="36" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-white"
          >
            <motion.path 
              d="M16 7h.01" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 1, delay: 1.5 }} 
            />
            <motion.path 
              d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20" 
              initial={{ pathLength: 0, opacity: 0 }} 
              animate={{ pathLength: 1, opacity: 1 }} 
              transition={{ duration: 2, ease: "easeInOut" }} 
            />
            <motion.path 
              d="m20 7 2 .5-2 .5" 
              initial={{ pathLength: 0, opacity: 0 }} 
              animate={{ pathLength: 1, opacity: 1 }} 
              transition={{ duration: 1, ease: "easeInOut", delay: 1 }} 
            />
            <motion.path 
              d="M10 18v3" 
              initial={{ pathLength: 0, opacity: 0 }} 
              animate={{ pathLength: 1, opacity: 1 }} 
              transition={{ duration: 0.5, ease: "easeInOut", delay: 1.5 }} 
            />
            <motion.path 
              d="M14 17.75V21" 
              initial={{ pathLength: 0, opacity: 0 }} 
              animate={{ pathLength: 1, opacity: 1 }} 
              transition={{ duration: 0.5, ease: "easeInOut", delay: 1.5 }} 
            />
            <motion.path 
              d="M7 18a6 6 0 0 0 3.84-10.61" 
              initial={{ pathLength: 0, opacity: 0 }} 
              animate={{ pathLength: 1, opacity: 1 }} 
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }} 
            />
          </svg>
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
          FreeBirdTool
        </h1>

        {/* Typewriter Slogan */}
        <div className="h-5 flex items-center justify-center mb-2">
          <span className="text-sm text-gray-400 font-medium tracking-wide">
            {displayedText}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="inline-block w-[2px] h-[14px] bg-gray-400 ml-[2px] align-middle"
            />
          </span>
        </div>

        {/* Original subtitle */}
        <span className="text-[10px] text-gray-600 font-medium tracking-wide">
          By the grace of Allah, I was blessed to create this tool.
        </span>
      </div>
    </header>
  );
};
