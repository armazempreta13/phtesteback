
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  priority = false,
  width,
  height,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden w-full h-full bg-gray-100 dark:bg-gray-800 ${containerClassName}`}>
       {/* Placeholder (Blur Up & Skeleton) */}
       <div 
         className={`absolute inset-0 bg-gray-200 dark:bg-gray-700 transition-opacity duration-700 ease-out ${isLoaded ? 'opacity-0' : 'opacity-100'} z-10 flex items-center justify-center`}
         aria-hidden="true"
       >
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
       </div>
       
       {/* Actual Image */}
       <motion.img
         src={src}
         alt={alt}
         width={width}
         height={height}
         loading={priority ? "eager" : "lazy"}
         decoding={priority ? "sync" : "async"}
         onLoad={() => setIsLoaded(true)}
         initial={{ opacity: 0, filter: 'blur(8px)', scale: 1.05 }}
         animate={{ 
           opacity: isLoaded ? 1 : 0, 
           filter: isLoaded ? 'blur(0px)' : 'blur(8px)',
           scale: isLoaded ? 1 : 1.05
         }}
         transition={{ duration: 0.6, ease: "easeOut" }}
         className={`relative z-0 ${className}`}
         {...props as any}
       />
       <style>{`
         @keyframes shimmer {
           0% { transform: translateX(-100%); }
           100% { transform: translateX(100%); }
         }
         .animate-shimmer {
           animation: shimmer 1.5s infinite;
         }
       `}</style>
    </div>
  );
};
