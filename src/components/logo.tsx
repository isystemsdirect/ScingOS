
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
        <div className="relative logo-gradient-light p-4">
            <Image src="/logo.png" alt="Scingular Logo" width={192} height={192} className="size-48 relative" />
        </div>
        <div className="flex items-start">
          <span className="font-sans uppercase font-bold italic text-3xl sm:text-4xl whitespace-nowrap">
            SCINGULAR <span className="text-primary">AI</span>
          </span>
          <sup className="text-white text-[0.2em] font-light -translate-y-[-0.2em] ml-1">TM</sup>
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
