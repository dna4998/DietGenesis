import { Dna } from "lucide-react";
// Use public logo path to avoid Vite caching
const logoPath = "/current-logo.png";

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
    sm: 'h-8 w-auto max-w-24',
    md: 'h-12 w-auto max-w-32', 
    lg: 'h-16 w-auto max-w-40'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  // Always use the same logo as login page
  const displayLogoUrl = logoUrl || logoPath;

  return (
    <div className="flex items-center space-x-3">
      <img 
        src={`${displayLogoUrl}?t=${Date.now()}`} 
        alt={`${title} Logo`}
        className={`${sizeClasses[size]} object-contain`}
        key={`logo-${Date.now()}`}
        onError={(e) => {
          // Show fallback DNA icon if logo fails to load
          const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
          (e.target as HTMLImageElement).style.display = 'none';
          if (fallback) fallback.style.display = 'block';
        }}
      />
      
      {/* Fallback DNA icon */}
      <Dna 
        className={`h-8 w-8 text-blue-600 hidden`} 
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