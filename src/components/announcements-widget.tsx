
'use client';

import { Megaphone, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { mockAnnouncements } from '@/lib/data';
import { Badge } from './ui/badge';

export function AnnouncementsWidget() {
    return (
        <Card className="bg-card/60 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-primary" />
                    Announcements
                </CardTitle>
                <CardDescription>Latest news from SCINGULAR HQ.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {mockAnnouncements.map(announcement => (
                    <div key={announcement.id} className="relative group p-3 rounded-lg border bg-background/40">
                        {!announcement.read && (
                             <Badge className="absolute -top-2 -right-2">New</Badge>
                        )}
                        <p className="font-semibold text-sm">{announcement.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{announcement.content}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
