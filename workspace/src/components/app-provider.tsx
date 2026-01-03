
'use client';

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell from "./app-shell";
import { getFirebaseAuth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { MessagingDialog } from "./messaging-dialog";
import { TooltipProvider } from "./ui/tooltip";
import { Loader2 } from "lucide-react";
import BackgroundSlideshow from "./background-slideshow";

export function AppProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [authInitialized, setAuthInitialized] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const isAuthPage =
        pathname === "/" ||
        pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/forgot-password";

    useEffect(() => {
        const auth = getFirebaseAuth();
        if (auth) {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                setUser(user);
                if (!authInitialized) {
                    setAuthInitialized(true);
                }
            });
            return () => unsubscribe();
        } else {
            setAuthInitialized(true); // Firebase might not be configured
        }
    }, [authInitialized]);
    
    useEffect(() => {
        if (authInitialized) {
            if(user && (pathname === '/' || isAuthPage)) {
                router.push('/dashboard');
            }
            if(!user && !isAuthPage) {
                router.push('/');
            }
        }
    }, [authInitialized, user, isAuthPage, pathname, router]);


    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullScreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullScreen(false);
            }
        }
    };
    
    const handleRefresh = () => {
        setRefreshKey(prevKey => prevKey + 1);
    }

    if (!authInitialized) {
        return (
          <div className="h-screen w-screen flex items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Initializing Authentication...</p>
          </div>
        );
    }
    
    if (isAuthPage && !user) {
        return (
            <TooltipProvider>
                <main key={refreshKey}>{children}</main>
            </TooltipProvider>
        )
    }

    if (!isAuthPage && user) {
        return (
            <TooltipProvider>
                <AppShell 
                    userId={user?.uid || null} 
                    isFullScreen={isFullScreen} 
                    toggleFullScreen={toggleFullScreen}
                    handleRefresh={handleRefresh}
                >
                    <main key={refreshKey} className="flex-1 overflow-y-auto p-4 sm:px-6 sm:py-0 md:gap-8">
                        {children}
                    </main>
                </AppShell>
                <MessagingDialog />
            </TooltipProvider>
        );
    }

    // Fallback loading state while redirects happen
    return (
         <div className="h-screen w-screen flex items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin" />
         </div>
    )
}
