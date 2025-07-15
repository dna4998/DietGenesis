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
    sm: 'h-6 w-auto',
    md: 'h-10 w-auto',
    lg: 'h-14 w-auto',
    login: 'h-20 w-auto'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    login: 'text-2xl'
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
          <Dna className={`${size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-10 h-10' : size === 'lg' ? 'w-14 h-14' : 'w-20 h-20'}`} />
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