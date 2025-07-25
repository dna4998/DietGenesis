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
    // Use the uploaded logo if available, otherwise use the default SVG
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
      // No logo found, don't set logoUrl to force fallback to DNA icon
      setLogoUrl(null);
    };

    checkLogoExists();
  }, []);

  const handleImageError = () => {
    setImageError(true);
  };

  const sizeClasses = {
    sm: 'h-12 w-auto',
    md: 'h-24 w-auto',
    lg: 'h-32 w-auto',
    login: 'h-36 w-auto'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    login: 'text-5xl'
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
          <Dna className={`${size === 'sm' ? 'w-12 h-12' : size === 'md' ? 'w-24 h-24' : size === 'lg' ? 'w-32 h-32' : 'w-36 h-36'}`} />
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