import React from 'react';
import { motion } from 'framer-motion';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  alignment?: 'left' | 'center';
  light?: boolean;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ 
  title, 
  subtitle, 
  alignment = 'center',
  light = false
}) => {
  const isCenter = alignment === 'center';

  return (
    <div className={`mb-16 md:mb-24 ${isCenter ? 'text-center' : 'text-left'} relative`}>
      {/* Decorative Label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`text-xs font-mono font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-3 ${isCenter ? 'justify-center' : 'justify-start'} ${light ? 'text-primary-400' : 'text-primary-600'}`}
      >
        <span className="w-8 h-[1px] bg-current opacity-50"></span>
        <span>Explore</span>
        <span className="w-8 h-[1px] bg-current opacity-50"></span>
      </motion.div>

      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={`font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight ${light ? 'text-white' : 'text-gray-900'}`}
      >
        {title}
        {!light && <span className="text-primary-600">.</span>}
      </motion.h2>
      
      {subtitle && (
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`text-lg md:text-xl leading-relaxed max-w-2xl ${isCenter ? 'mx-auto' : ''} ${light ? 'text-gray-400' : 'text-gray-500 font-light'}`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};