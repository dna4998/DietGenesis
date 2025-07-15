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
  const [logoSrc, setLogoSrc] = useState('');
  const [logoError, setLogoError] = useState(false);

  const sizeClasses = {
    sm: 'h-12 w-auto',
    md: 'h-16 w-auto',
    lg: 'h-24 w-auto'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  useEffect(() => {
    // Force fresh logo load with timestamp and random parameter
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    setLogoSrc(`/logo.png?t=${timestamp}&r=${random}&nocache=true`);
  }, []);

  const handleLogoError = () => {
    console.error('Fresh logo failed to load, using fallback');
    setLogoError(true);
  };

  const handleLogoLoad = () => {
    console.log('Fresh logo loaded successfully:', logoSrc);
    setLogoError(false);
  };

  if (logoError) {
    return (
      <div className="flex items-center space-x-3">
        <Dna className={`h-8 w-8 text-purple-600`} />
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

  return (
    <div className="flex items-center space-x-3">
      {logoSrc && (
        <img 
          src={logoSrc}
          alt={`${title} Logo`}
          className={`${sizeClasses[size]} object-contain`}
          onLoad={handleLogoLoad}
          onError={handleLogoError}
          style={{ 
            imageRendering: 'auto', 
            maxWidth: '100%',
            display: 'block'
          }}
        />
      )}
      
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