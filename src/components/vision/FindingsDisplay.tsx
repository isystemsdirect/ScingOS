
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertTriangle, Eye, Target, Percent } from 'lucide-react';
import { Badge } from '../ui/badge';
import type { VisionFinding } from '@/lib/vision-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

interface FindingsDisplayProps {
  image: string;
  findings: VisionFinding[] | null;
  isLoading: boolean;
}

const severityColors = {
  Low: 'border-yellow-400',
  Medium: 'border-orange-500',
  High: 'border-red-600',
  Critical: 'border-red-800',
};

export function FindingsDisplay({ image, findings, isLoading }: FindingsDisplayProps) {
  const [selectedFinding, setSelectedFinding] = useState<VisionFinding | null>(null);

  const getSeverityBadge = (severity: VisionFinding['severity']) => {
    switch (severity) {
      case 'Low': return 'secondary';
      case 'Medium': return 'default';
      case 'High':
      case 'Critical': return 'destructive';
      default: return 'outline';
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden border">
        <Image src={image} alt="Analyzed image" layout="fill" objectFit="contain" />

        {isLoading && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="font-semibold text-lg">LARI-VISION is analyzing...</p>
            <p className="text-sm text-muted-foreground">This may take a few moments.</p>
          </div>
        )}

        <AnimatePresence>
          {findings?.map((finding) => (
            <motion.div
              key={finding.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onMouseEnter={() => setSelectedFinding(finding)}
              onMouseLeave={() => setSelectedFinding(null)}
              onClick={() => setSelectedFinding(finding)}
              className={cn(
                "absolute rounded-sm border-2 transition-all duration-300 cursor-pointer",
                severityColors[finding.severity],
                selectedFinding?.id === finding.id ? 'bg-primary/30 scale-105' : 'bg-transparent hover:bg-primary/20'
              )}
              style={{
                top: `${finding.boundingBox.y1}%`,
                left: `${finding.boundingBox.x1}%`,
                width: `${finding.boundingBox.x2 - finding.boundingBox.x1}%`,
                height: `${finding.boundingBox.y2 - finding.boundingBox.y1}%`,
              }}
            >
              {selectedFinding?.id === finding.id && (
                  <div className="absolute -top-7 left-0 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-t-md whitespace-nowrap">
                    {finding.type}
                  </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!isLoading && findings && (
        <ScrollArea className="h-72">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className="text-right">Confidence</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {findings.map((finding) => (
                <TableRow 
                    key={finding.id}
                    onMouseEnter={() => setSelectedFinding(finding)}
                    onMouseLeave={() => setSelectedFinding(null)}
                    className={cn('cursor-pointer', selectedFinding?.id === finding.id && 'bg-primary/10')}
                >
                    <TableCell className="font-medium">{finding.type}</TableCell>
                    <TableCell>{finding.description}</TableCell>
                    <TableCell>
                        <Badge variant={getSeverityBadge(finding.severity)}>{finding.severity}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">{(finding.confidence * 100).toFixed(1)}%</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </ScrollArea>
      )}

      {!isLoading && findings?.length === 0 && (
        <div className="text-center p-8 border rounded-lg bg-background/40">
            <Eye className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Findings Detected</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                LARI-VISION did not identify any issues based on the selected criteria.
            </p>
        </div>
      )}
    </div>
  );
}
