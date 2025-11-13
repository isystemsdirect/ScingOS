
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { ScingularLogoText } from "./ui/logo-text";

const Logo = ({ className, isLoginPage = false }: { className?: string, isLoginPage?: boolean }) => {
  if (isLoginPage) {
    return (
      <Link
        href="/dashboard"
        className={cn(
          "flex flex-col items-center justify-center gap-2 font-bold text-foreground w-full",
          className
        )}
      >
        <div className="relative logo-gradient-light rounded-full p-2">
            <Image src="/logo.png" alt="Scingular Logo" width={160} height={160} className="transition-all size-32 sm:size-40 md:size-48 opacity-80" />
        </div>
        <div className="relative flex items-baseline justify-center">
           <span className="font-sans uppercase font-bold italic text-2xl sm:text-3xl md:text-4xl whitespace-nowrap text-shadow-drop">
            <span className="text-scingular-glow">SCINGULAR</span> <span className="text-primary text-ai-glow text-2xl sm:text-3xl md:text-4xl">AI</span>
          </span>
          <span className="font-sans font-bold text-[0.4em] absolute top-[0.6em] right-[-4.2em] sm:top-[0.8em] sm:-right-[4.2em] md:top-[0.6em] md:-right-[3.2em] text-shadow-drop">TM</span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href="/dashboard"
      className={cn(
        "flex items-center gap-2 font-bold text-foreground group-data-[collapsed=true]:gap-0",
        className
      )}
    >
      <div className="relative">
          <Image src="/logo.png" alt="Scingular Logo" width={32} height={32} className="transition-all size-8 group-data-[collapsed=true]:size-9" />
      </div>
      <div className="group-data-[collapsed=true]:hidden">
        <ScingularLogoText className="text-xl" isLoginPage={false} />
      </div>
    </Link>
  );
};

export default Logo;
