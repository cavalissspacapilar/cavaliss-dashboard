import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export default function EmptyState({ icon: Icon, title, description, className }: Props) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      {Icon && <Icon size={36} className="text-zinc-700 mb-4" />}
      <p className="text-zinc-400 font-medium text-sm">{title}</p>
      {description && (
        <p className="text-zinc-600 text-xs mt-1.5 max-w-xs leading-relaxed">{description}</p>
      )}
    </div>
  );
}
