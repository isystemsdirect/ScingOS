'use client';
import { Loader2 } from 'lucide-react';

const MessagingPage = () => {
    return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Loading Chat...</span>
        </div>
    );
};

export default MessagingPage;
