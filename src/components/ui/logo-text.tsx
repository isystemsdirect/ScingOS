
import { cn } from "@/lib/utils";

export function ScingularLogoText({ className }: { className?: string }) {
  return (
    <span className={cn("font-sans uppercase font-bold italic", className)}>
        <span className="text-scingular-glow">SCINGULAR</span> <span className="text-primary text-ai-glow">AI</span>
    </span>
  );
}
