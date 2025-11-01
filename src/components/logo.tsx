
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
           <span className="font-sans uppercase font-bold italic text-3xl sm:text-4xl md:text-5xl whitespace-nowrap">
            <span className="text-glow-blue">SCINGULAR</span> <span className="text-primary">AI</span>
          </span>
          <span className="font-sans font-bold text-[0.4em] absolute top-[0em] -right-[1.8em] sm:top-[0.3em] sm:-right-[1.5em] md:top-[0.2em] md:-right-[1.3em]">TM</span>
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
