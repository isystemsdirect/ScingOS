
import { cn } from "@/lib/utils";

export function ScingularLogoText({ className, isLoginPage = true }: { className?: string; isLoginPage?: boolean; }) {
  return (
    <span className={cn("font-sans uppercase font-bold italic text-shadow-drop", className)}>
        <span className={cn(isLoginPage && "text-scingular-glow")}>SCINGULAR</span> <span className={cn("text-primary", isLoginPage && "text-ai-glow")}>AI</span>
    </span>
  );
}
