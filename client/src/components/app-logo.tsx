import { Dna } from "lucide-react";

interface AppLogoProps {
  logoUrl?: string;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
}

export default function AppLogo({ 
  logoUrl, 
  title = "DNA Diet Club", 
  size = 'md',
  showTitle = true 
}: AppLogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className="flex items-center space-x-3">
      {logoUrl ? (
        <img 
          src={logoUrl} 
          alt={`${title} Logo`}
          className={`${sizeClasses[size]} w-auto object-contain`}
          onError={(e) => {
            // Show fallback DNA icon if logo fails to load
            const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
            (e.target as HTMLImageElement).style.display = 'none';
            if (fallback) fallback.style.display = 'block';
          }}
        />
      ) : null}
      
      {/* Fallback DNA icon */}
      <Dna 
        className={`${sizeClasses[size]} text-blue-600 ${logoUrl ? 'hidden' : 'block'}`} 
      />
      
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