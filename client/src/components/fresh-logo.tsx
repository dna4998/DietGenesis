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
    sm: 'h-48',
    md: 'h-72',
    lg: 'h-96'
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  // Use the actual logo with fallback to simple text
  const logoSrc = `/logo.png?v=${Date.now()}`;

  return (
    <div className="flex items-center space-x-3">
      <img 
        src={logoSrc}
        alt={`${title} Logo`}
        className={`${sizeClasses[size]} w-auto object-contain`}
        onError={(e) => {
          // Fallback to simple text logo
          const img = e.target as HTMLImageElement;
          img.style.display = 'none';
          const fallback = img.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'block';
        }}
      />
      
      {/* Simple fallback logo */}
      <div className="hidden">
        <div className="flex items-center space-x-3">
          <Dna className="h-16 w-16 text-purple-600" />
          <span className="text-3xl font-bold text-gray-900">DNA Diet Club</span>
        </div>
      </div>
      
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