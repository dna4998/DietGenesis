import { Dna } from "lucide-react";
import { useEffect, useState } from "react";

interface FreshLogoProps {
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
}

export default function FreshLogo({ 
  title = "DNA Diet Club", 
  size = 'md', 
  showTitle = true 
}: FreshLogoProps) {
  const sizeClasses = {
    sm: 'h-12',
    md: 'h-16',
    lg: 'h-24'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  // Create an embedded SVG representation of the DNA Diet Club logo
  const DnaLogo = () => (
    <svg 
      className={`${sizeClasses[size]} w-auto`}
      viewBox="0 0 400 150" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* DNA Double Helix - Purple */}
      <path 
        d="M20 40 L35 25 L50 40 L65 25 L80 40" 
        stroke="#a855f7" 
        strokeWidth="4" 
        fill="none"
      />
      <path 
        d="M20 70 L35 85 L50 70 L65 85 L80 70" 
        stroke="#a855f7" 
        strokeWidth="4" 
        fill="none"
      />
      <line x1="20" y1="40" x2="20" y2="70" stroke="#a855f7" strokeWidth="2"/>
      <line x1="35" y1="25" x2="35" y2="85" stroke="#a855f7" strokeWidth="2"/>
      <line x1="50" y1="40" x2="50" y2="70" stroke="#a855f7" strokeWidth="2"/>
      <line x1="65" y1="25" x2="65" y2="85" stroke="#a855f7" strokeWidth="2"/>
      <line x1="80" y1="40" x2="80" y2="70" stroke="#a855f7" strokeWidth="2"/>
      
      {/* DNA Text */}
      <text x="100" y="45" fontSize="32" fontWeight="bold" fill="#6b7280">DNA</text>
      
      {/* DIET CLUB rounded rectangle */}
      <rect x="270" y="20" width="110" height="70" rx="15" fill="#a855f7"/>
      <text x="290" y="45" fontSize="16" fontWeight="bold" fill="white">DIET</text>
      <text x="290" y="70" fontSize="16" fontWeight="bold" fill="white">CLUB</text>
    </svg>
  );

  return (
    <div className="flex items-center space-x-3">
      <DnaLogo />
      
      {showTitle && (
        <div className="flex flex-col">
          <h1 className={`font-bold text-gray-900 ${textSizes[size]}`}>{title}</h1>
          {size !== 'sm' && (
            <p className="text-xs text-gray-500">Personalized Health Platform</p>
          )}
        </div>
      )}
    </div>
  );
}