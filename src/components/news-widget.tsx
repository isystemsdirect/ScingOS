
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Newspaper } from 'lucide-react';
import { mockNews } from '@/lib/data';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel";
import Link from 'next/link';

export function NewsWidget() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 8000); // 8 seconds

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });

    return () => clearInterval(interval);
  }, [api]);

  if (!mockNews || mockNews.length === 0) {
    return null;
  }

  return (
    <div className="p-2 space-y-2 group-data-[collapsed=true]:hidden relative overflow-hidden">
        <h4 className="font-semibold text-sm text-sidebar-foreground flex items-center gap-2">
            <Newspaper className="h-4 w-4" />
            Industry News
        </h4>
        <Carousel setApi={setApi} className="w-full" orientation="vertical">
            <CarouselContent className="h-[100px]">
                {mockNews.map((item) => (
                    <CarouselItem key={item.id}>
                        <Link href={item.url} target="_blank" rel="noopener noreferrer" className="group/news-item flex items-start gap-3 h-full">
                            <Image src={item.imageUrl} alt={item.title} width={60} height={60} className="rounded-md object-cover w-[60px] h-[60px]" data-ai-hint={item.imageHint} />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-xs leading-snug text-sidebar-foreground group-hover/news-item:text-primary transition-colors truncate">
                                    {item.title}
                                </p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                                    <span>{item.source}</span>
                                    <span>{item.time}</span>
                                </div>
                            </div>
                        </Link>
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
    </div>
  );
}
