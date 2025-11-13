
'use client';

import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MetadataDisplayProps {
  metadata: any;
}

const interestingKeys = [
    'Make', 'Model', 'Software',
    'DateTimeOriginal', 'CreateDate',
    'GPSLatitude', 'GPSLongitude', 'GPSAltitude',
    'ImageWidth', 'ImageHeight',
    'FocalLength', 'FNumber', 'ISO', 'ExposureTime'
]

export function MetadataDisplay({ metadata }: MetadataDisplayProps) {
  if (!metadata) return null;

  const filteredData = Object.entries(metadata)
    .filter(([key]) => interestingKeys.includes(key))
    .sort(([keyA], [keyB]) => interestingKeys.indexOf(keyA) - interestingKeys.indexOf(keyB));


  return (
    <ScrollArea className="h-72 w-full rounded-md border">
        <Table className="text-xs">
            <TableHeader>
                <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Value</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredData.map(([key, value]) => (
                    <TableRow key={key}>
                        <TableCell className="font-medium">{key}</TableCell>
                        <TableCell>{String(value)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </ScrollArea>
  );
}
