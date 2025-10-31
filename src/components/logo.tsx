
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

const Logo = ({ className, isLoginPage = false }: { className?: string, isLoginPage?: boolean }) => {
  if (isLoginPage) {
    return (
      <Link
        href="/dashboard"
        className={cn(
          "flex flex-col items-center justify-center gap-4 font-bold text-foreground",
          className
        )}
      >
        <Image src="/logo.png" alt="Scingular Logo" width={192} height={192} className="size-48" />
        <span className="font-sans uppercase font-bold italic text-3xl">
          SCINGULAR <span className="text-primary">AI</span>
        </span>
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
      <Image src="/logo.png" alt="Scingular Logo" width={32} height={32} className="transition-all size-8 group-data-[collapsed=true]:size-9" />
      <span className="font-sans uppercase font-bold italic text-xl group-data-[collapsed=true]:hidden">
        SCINGULAR <span className="text-primary">AI</span>
      </span>
    </Link>
  );
};

export default Logo;
