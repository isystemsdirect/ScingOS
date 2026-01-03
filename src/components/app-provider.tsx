'use client';

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell from "./app-shell";
import { getFirebaseAuth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { MessagingDialog } from "./messaging-dialog";
import { TooltipProvider } from "./ui/tooltip";

export function AppProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [authInitialized, setAuthInitialized] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const isAuthPage =
        pathname === "/" ||
        pathname === "/signup" ||
        pathname === "/forgot-password";

    useEffect(() => {
        const auth = getFirebaseAuth();
        if (auth) {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                setUser(user);
                setAuthInitialized(true);
            });
            return () => unsubscribe();
        } else {
            // Handle case where auth is not available
            setAuthInitialized(true);
        }
    }, []);

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
        // You might want a proper loading skeleton here
        return <div className="h-screen w-screen flex items-center justify-center bg-background">Loading...</div>;
    }
    
    if (isAuthPage) {
        return (
            <TooltipProvider>
                <main key={refreshKey}>{children}</main>
            </TooltipProvider>
        )
    }

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
