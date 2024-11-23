'use client'

import { motion } from 'framer-motion'

interface ElronLogoProps {
  size?: number
  className?: string
  animated?: boolean
}

export function ElronLogo({ size = 40, className = '', animated = true }: ElronLogoProps) {
  const variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div
      initial={animated ? "hidden" : "visible"}
      animate="visible"
      variants={variants}
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Ninja mask base */}
        <path 
          d="M20 50C20 33.4315 33.4315 20 50 20C66.5685 20 80 33.4315 80 50C80 66.5685 66.5685 80 50 80C33.4315 80 20 66.5685 20 50Z" 
          className="fill-primary"
        />
        
        {/* Eyes */}
        <path 
          d="M35 45C35 42.2386 37.2386 40 40 40C42.7614 40 45 42.2386 45 45C45 47.7614 42.7614 50 40 50C37.2386 50 35 47.7614 35 45Z" 
          className="fill-background"
        />
        <path 
          d="M55 45C55 42.2386 57.2386 40 60 40C62.7614 40 65 42.2386 65 45C65 47.7614 62.7614 50 60 50C57.2386 50 55 47.7614 55 45Z" 
          className="fill-background"
        />
        
        {/* Headband */}
        <path 
          d="M25 40H75M75 40L70 30M25 40L30 30" 
          stroke="currentColor" 
          strokeWidth="4" 
          strokeLinecap="round"
          className="stroke-accent"
        />
      </svg>
    </motion.div>
  )
} 