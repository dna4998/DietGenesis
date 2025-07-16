import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Zap, Heart, Target, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface MicroAnimationProps {
  type: 'progress_tick' | 'goal_reached' | 'streak' | 'improvement' | 'milestone';
  value?: number;
  previousValue?: number;
  trigger?: boolean;
  className?: string;
}

const animationVariants = {
  progress_tick: {
    scale: [1, 1.1, 1],
    color: ["#10b981", "#059669", "#10b981"],
    transition: { duration: 0.6, ease: "easeInOut" }
  },
  goal_reached: {
    scale: [1, 1.3, 1.1, 1],
    rotate: [0, 10, -10, 0],
    color: ["#f59e0b", "#d97706", "#f59e0b"],
    transition: { duration: 1, ease: "easeInOut" }
  },
  streak: {
    scale: [1, 1.2, 1],
    y: [0, -5, 0],
    transition: { duration: 0.5, ease: "easeOut" }
  },
  improvement: {
    scale: [1, 1.15, 1],
    opacity: [1, 0.8, 1],
    transition: { duration: 0.4, ease: "easeInOut" }
  },
  milestone: {
    scale: [1, 1.25, 1.05, 1],
    rotate: [0, 180, 360],
    transition: { duration: 1.2, ease: "easeInOut" }
  }
};

export function MicroAnimation({ type, value, previousValue, trigger = false, className }: MicroAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (trigger && value !== previousValue) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [trigger, value, previousValue]);

  const getIcon = () => {
    switch (type) {
      case 'progress_tick':
        return <TrendingUp className="h-4 w-4" />;
      case 'goal_reached':
        return <Target className="h-4 w-4" />;
      case 'streak':
        return <Zap className="h-4 w-4" />;
      case 'improvement':
        return <Heart className="h-4 w-4" />;
      case 'milestone':
        return <Star className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      className={cn("inline-flex items-center justify-center", className)}
      animate={isAnimating ? animationVariants[type] : {}}
      style={{ originX: 0.5, originY: 0.5 }}
    >
      {getIcon()}
    </motion.div>
  );
}

interface ProgressBarAnimationProps {
  value: number;
  target: number;
  className?: string;
  showSparkle?: boolean;
  label?: string;
}

export function ProgressBarAnimation({ value, target, className, showSparkle = true, label }: ProgressBarAnimationProps) {
  const percentage = Math.min(100, (value / target) * 100);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 300);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className={cn("relative", className)}>
      {label && (
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{label}</span>
          <span>{value} / {target}</span>
        </div>
      )}
      
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${animatedPercentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        
        {showSparkle && percentage > 50 && (
          <motion.div
            className="absolute inset-y-0 right-0 flex items-center pr-2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <motion.div
              className="text-yellow-400"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop"
              }}
            >
              ✨
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

interface CountUpAnimationProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function CountUpAnimation({ value, duration = 1, className, suffix = "", prefix = "" }: CountUpAnimationProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const steps = 60;
    const increment = value / steps;
    const stepDuration = (duration * 1000) / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setCount(Math.round(increment * currentStep));
      } else {
        setCount(value);
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {prefix}{count}{suffix}
    </motion.span>
  );
}

interface PulseIndicatorProps {
  active: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PulseIndicator({ active, color = "green", size = "md", className }: PulseIndicatorProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3", 
    lg: "h-4 w-4"
  };

  const colorClasses = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    purple: "bg-purple-500"
  };

  return (
    <div className={cn("relative inline-flex", className)}>
      <motion.div
        className={cn(
          "rounded-full",
          sizeClasses[size],
          colorClasses[color as keyof typeof colorClasses]
        )}
        animate={active ? {
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1]
        } : {}}
        transition={{
          duration: 1.5,
          repeat: active ? Infinity : 0,
          ease: "easeInOut"
        }}
      />
      {active && (
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full",
            colorClasses[color as keyof typeof colorClasses],
            "opacity-30"
          )}
          animate={{
            scale: [1, 2, 1],
            opacity: [0.3, 0, 0.3]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  );
}

interface FloatingIconProps {
  icon: React.ReactNode;
  duration?: number;
  className?: string;
}

export function FloatingIcon({ icon, duration = 3, className }: FloatingIconProps) {
  return (
    <motion.div
      className={cn("absolute pointer-events-none", className)}
      initial={{ 
        opacity: 1, 
        y: 0, 
        scale: 1 
      }}
      animate={{ 
        opacity: 0, 
        y: -50, 
        scale: 1.2 
      }}
      transition={{ 
        duration,
        ease: "easeOut"
      }}
    >
      {icon}
    </motion.div>
  );
}