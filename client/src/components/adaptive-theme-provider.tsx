import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAdaptiveTheme, type AdaptiveTheme } from '@/hooks/use-adaptive-theme';
import type { Patient } from '@/../../shared/schema';

interface AdaptiveThemeContextType {
  theme: AdaptiveTheme;
  applyTheme: () => void;
}

const AdaptiveThemeContext = createContext<AdaptiveThemeContextType | undefined>(undefined);

interface AdaptiveThemeProviderProps {
  children: ReactNode;
  patient?: Patient;
  enabled?: boolean;
}

export function AdaptiveThemeProvider({ 
  children, 
  patient, 
  enabled = true 
}: AdaptiveThemeProviderProps) {
  const theme = useAdaptiveTheme(patient);

  const applyTheme = () => {
    if (!enabled) return;

    const root = document.documentElement;
    
    // Apply CSS custom properties for the adaptive theme
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--primary-foreground', 'hsl(0, 0%, 98%)');
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--secondary-foreground', theme.text);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent-foreground', theme.text);
    root.style.setProperty('--background', theme.background);
    root.style.setProperty('--foreground', theme.text);
    root.style.setProperty('--card', theme.card);
    root.style.setProperty('--card-foreground', theme.text);
    root.style.setProperty('--border', theme.border);
    root.style.setProperty('--muted', theme.muted);
    root.style.setProperty('--muted-foreground', theme.muted);
    
    // Add a data attribute for status-specific styling
    root.setAttribute('data-health-status', theme.statusColor);
  };

  useEffect(() => {
    applyTheme();
  }, [theme, enabled]);

  return (
    <AdaptiveThemeContext.Provider value={{ theme, applyTheme }}>
      {children}
    </AdaptiveThemeContext.Provider>
  );
}

export function useAdaptiveThemeContext() {
  const context = useContext(AdaptiveThemeContext);
  if (context === undefined) {
    throw new Error('useAdaptiveThemeContext must be used within an AdaptiveThemeProvider');
  }
  return context;
}