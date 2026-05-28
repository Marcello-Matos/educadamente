import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in", className)}>
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center">
          <Icon className="w-9 h-9 text-indigo-400" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
          <span className="text-indigo-500 text-xs font-bold">0</span>
        </div>
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-5">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="gap-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
