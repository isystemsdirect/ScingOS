
'use client';

import type { Inspector } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Briefcase, MessageSquare, Star, Video, ShieldCheck } from 'lucide-react';
import { useMessagingStore } from '@/lib/stores/messaging-store';

interface InspectorProfileModalProps {
  inspector: Inspector;
}

export function InspectorProfileModal({ inspector }: InspectorProfileModalProps) {
  const avatar = PlaceHolderImages.find((p) => p.id === inspector.imageHint);
  const openMessagingDialog = useMessagingStore((state) => state.openDialog);

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-4">
          {avatar && (
            <Image
              src={avatar.imageUrl}
              alt={inspector.name}
              width={80}
              height={80}
              className="rounded-full border-2 border-primary"
            />
          )}
          <div className="flex-1">
            <DialogTitle className="text-2xl">{inspector.name}</DialogTitle>
            <DialogDescription>{inspector.role}</DialogDescription>
             <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span>{inspector.rating} ({inspector.reviews} reviews)</span>
                </div>
                <Badge variant={inspector.onCall ? 'default' : 'secondary'}>
                    {inspector.onCall ? 'On-Call' : 'Unavailable'}
                </Badge>
            </div>
          </div>
        </div>
      </DialogHeader>
      <div className="py-4 space-y-6">
        <div>
            <h4 className="font-semibold text-sm mb-2">Top Certifications</h4>
            <div className="space-y-2">
                {inspector.certifications.slice(0, 2).map(cert => (
                    <div key={cert.id} className="flex items-center gap-2 text-xs">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">{cert.name}</span>
                    </div>
                ))}
            </div>
        </div>

        <Separator />
        
         <div>
            <h4 className="font-semibold text-sm mb-2">Primary Skills</h4>
            <div className="flex flex-wrap gap-2">
                {inspector.offeredServices.slice(0, 4).map(service => (
                    <Badge key={service} variant="outline">{service.split('(')[0].trim()}</Badge>
                ))}
            </div>
        </div>

      </div>
       <div className="grid grid-cols-2 gap-2 pt-4 border-t">
         <Button onClick={() => openMessagingDialog(inspector.id, inspector.name)}>
            <MessageSquare className="mr-2 h-4 w-4"/> Message
        </Button>
        <Button variant="outline">
            <Video className="mr-2 h-4 w-4"/> Create Meeting
        </Button>
      </div>
       <div className="grid grid-cols-1 gap-2 pt-2">
        <Button variant="outline" asChild>
            <Link href={`/profile/${inspector.id}`}>View Full Profile</Link>
        </Button>
       </div>
    </>
  );
}
