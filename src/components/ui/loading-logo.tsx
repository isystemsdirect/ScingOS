
import { cn } from "@/lib/utils";

export function LoadingLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 192 192"
      className={cn("relative", className)}
      aria-label="Scingular AI Logo"
    >
      <path
        className="loading-logo-trace"
        d="M96 0 L192 96 L96 192 L0 96 Z M32 96 L96 160 L160 96 L96 32 Z"
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
