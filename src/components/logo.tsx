
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

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
        <div className="relative logo-gradient-light p-2 sm:p-4">
            <Image src="/logo.png" alt="Scingular Logo" width={192} height={192} className="size-32 sm:size-40 md:size-48 relative" />
        </div>
        <div className="relative flex items-baseline justify-center">
           <span className="font-sans uppercase font-bold italic text-xl sm:text-2xl md:text-xl whitespace-nowrap">
            <span className="text-scingular-glow">SCINGULAR</span> <span className="text-primary">AI</span>
          </span>
          <span className="font-sans font-bold text-[0.4em] absolute top-[0.6em] -right-[1.9em] sm:top-[0.8em] sm:-right-[1.8em] md:top-[0.6em] md:-right-[2.5em]">TM</span>
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
      <div className="relative logo-gradient-light">
          <Image src="/logo.png" alt="Scingular Logo" width={32} height={32} className="transition-all size-8 group-data-[collapsed=true]:size-9" />
      </div>
      <span className="font-sans uppercase font-bold italic text-xl group-data-[collapsed=true]:hidden">
        SCINGULAR <span className="text-primary">AI</span>
      </span>
    </Link>
  );
};

export default Logo;
