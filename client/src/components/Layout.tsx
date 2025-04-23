import React from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("animate-in fade-in-50 duration-300 p-4", className)}>
      {children}
    </div>
  );
}

export function ContentContainer({ children, className, fullWidth = false }: LayoutProps) {
  return (
    <div className={cn(
      "mx-auto", 
      fullWidth ? "w-full" : "max-w-md", 
      className
    )}>
      {children}
    </div>
  );
}

export function SectionContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-6", className)}>
      {children}
    </div>
  );
}

export function SectionHeader({ 
  title, 
  subtitle, 
  action 
}: { 
  title: string; 
  subtitle?: string; 
  action?: React.ReactNode 
}) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {action && action}
    </div>
  );
}

export function PageHeader({ 
  title, 
  onBack 
}: { 
  title: string; 
  onBack?: () => void 
}) {
  return (
    <div className="flex items-center mb-4">
      {onBack && (
        <button 
          onClick={onBack} 
          className="mr-2 h-9 w-9 flex items-center justify-center rounded-md hover:bg-accent"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
            <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
          </svg>
        </button>
      )}
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
  );
} 