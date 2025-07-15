import { Dna } from "lucide-react";
import { useEffect, useState } from "react";

interface FreshLogoProps {
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'login';
  showTitle?: boolean;
}

export default function FreshLogo({ 
  title = "DNA Diet Club", 
  size = 'md', 
  showTitle = true 
}: FreshLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const timestamp = Date.now();
    // Try different logo formats
    const logoFormats = ['/logo.png', '/logo.jpg', '/logo.jpeg', '/logo.svg'];
    
    const checkLogoExists = async () => {
      for (const format of logoFormats) {
        try {
          const response = await fetch(`${format}?v=${timestamp}`, { method: 'HEAD' });
          if (response.ok) {
            setLogoUrl(`${format}?v=${timestamp}`);
            return;
          }
        } catch (error) {
          // Continue to next format
        }
      }
      // If no logo found, use default SVG
      setLogoUrl(`/logo.svg?v=${timestamp}`);
    };

    checkLogoExists();
  }, []);

  const handleImageError = () => {
    setImageError(true);
  };

  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-16 w-auto',
    lg: 'h-20 w-auto',
    login: 'h-24 w-auto'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    login: 'text-3xl'
  };

  return (
    <div className="flex items-center space-x-3">
      {logoUrl && !imageError ? (
        <img 
          src={logoUrl}
          alt={`${title} Logo`}
          className={`${sizeClasses[size]} object-contain`}
          onError={handleImageError}
        />
      ) : (
        <div className={`${sizeClasses[size]} flex items-center justify-center text-blue-600`}>
          <Dna className={`${size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-16 h-16' : size === 'lg' ? 'w-20 h-20' : 'w-24 h-24'}`} />
        </div>
      )}
      
      {showTitle && (
        <div className="flex flex-col">
          <h1 className={`font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent ${textSizes[size]}`}>
            {title}
          </h1>
          {(size === 'lg' || size === 'login') && (
            <p className="text-xs text-gray-500">Personalized Health Platform</p>
          )}
        </div>
      )}
    </div>
  );
}