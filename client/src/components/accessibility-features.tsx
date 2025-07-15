import { useEffect, useRef } from "react";
import { announceToScreenReader } from "@/lib/accessibility";

// Skip Links Component for keyboard navigation
export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="absolute top-0 left-0 z-50 p-2 bg-blue-600 text-white font-medium rounded-br-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform -translate-y-full focus:translate-y-0 transition-transform"
        onFocus={() => announceToScreenReader("Skip to main content link focused")}
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="absolute top-0 left-24 z-50 p-2 bg-blue-600 text-white font-medium rounded-br-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform -translate-y-full focus:translate-y-0 transition-transform"
        onFocus={() => announceToScreenReader("Skip to navigation link focused")}
      >
        Skip to navigation
      </a>
    </div>
  );
}

// Live Region for screen reader announcements
export function LiveRegion() {
  return (
    <>
      <div
        id="polite-announcements"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      ></div>
      <div
        id="assertive-announcements"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      ></div>
    </>
  );
}

// Focus Manager for modal/dialog interactions
interface FocusManagerProps {
  children: React.ReactNode;
  enabled: boolean;
  restoreFocus?: boolean;
}

export function FocusManager({ children, enabled, restoreFocus = true }: FocusManagerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // Store the previously focused element
    previousFocus.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus the first element
    firstElement?.focus();

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        // Trigger any parent escape handlers
        const escapeEvent = new CustomEvent('modal-escape');
        container.dispatchEvent(escapeEvent);
      }
    };

    container.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
      
      // Restore focus to the previously focused element
      if (restoreFocus && previousFocus.current) {
        previousFocus.current.focus();
      }
    };
  }, [enabled, restoreFocus]);

  return (
    <div ref={containerRef} role={enabled ? "dialog" : undefined}>
      {children}
    </div>
  );
}

// Screen Reader Status announcer
interface StatusAnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
  delay?: number;
}

export function StatusAnnouncer({ message, priority = 'polite', delay = 0 }: StatusAnnouncerProps) {
  useEffect(() => {
    if (!message) return;

    const timeout = setTimeout(() => {
      announceToScreenReader(message, priority);
    }, delay);

    return () => clearTimeout(timeout);
  }, [message, priority, delay]);

  return null;
}

// Accessible loading indicator
interface AccessibleLoadingProps {
  isLoading: boolean;
  message?: string;
  children?: React.ReactNode;
}

export function AccessibleLoading({ 
  isLoading, 
  message = "Loading content", 
  children 
}: AccessibleLoadingProps) {
  return (
    <div role="status" aria-live="polite">
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div 
            className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"
            aria-hidden="true"
          />
          <span className="sr-only">{message}</span>
          <span aria-hidden="true">{message}</span>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// Accessible error boundary
interface AccessibleErrorProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function AccessibleError({ error, onRetry, onDismiss }: AccessibleErrorProps) {
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Announce error to screen readers
    announceToScreenReader(`Error: ${error}`, 'assertive');
    
    // Focus the error container for keyboard users
    errorRef.current?.focus();
  }, [error]);

  return (
    <div
      ref={errorRef}
      role="alert"
      aria-live="assertive"
      className="bg-red-50 border border-red-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-red-500"
      tabIndex={-1}
    >
      <div className="flex items-start gap-3">
        <div 
          className="flex-shrink-0 w-5 h-5 text-red-400"
          aria-hidden="true"
        >
          ⚠️
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Error
          </h3>
          <p className="mt-1 text-sm text-red-700">
            {error}
          </p>
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm font-medium hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-describedby="retry-description"
                >
                  Try Again
                  <span id="retry-description" className="sr-only">
                    Retry the failed operation
                  </span>
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-red-800 px-3 py-1 rounded text-sm font-medium hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-describedby="dismiss-description"
                >
                  Dismiss
                  <span id="dismiss-description" className="sr-only">
                    Dismiss this error message
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Accessible form field wrapper
interface AccessibleFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  description?: string;
  children: React.ReactNode;
  fieldId: string;
}

export function AccessibleField({ 
  label, 
  required = false, 
  error, 
  description, 
  children, 
  fieldId 
}: AccessibleFieldProps) {
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  
  return (
    <div className="space-y-1">
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-gray-600">
          {description}
        </p>
      )}
      
      <div>
        {children}
      </div>
      
      {error && (
        <p 
          id={errorId} 
          role="alert"
          className="text-sm text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}