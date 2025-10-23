
'use client';

import {
  BookMarked,
  FileText,
  ListFilter,
  PlusCircle,
  Search,
  Upload,
} from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockInspectors, mockSubscriptionPlans } from '@/lib/data';

const mockStandards = [
  {
    id: 'STD-001',
    title: 'ACI 318-19: Building Code Requirements for Structural Concrete',
    jurisdiction: 'International',
    docType: 'Building Code',
    tags: ['Concrete', 'Structural'],
    effectiveDate: '2019-10-01',
  },
  {
    id: 'STD-002',
    title: '2021 International Residential Code (IRC)',
    jurisdiction: 'International',
    docType: 'Building Code',
    tags: ['Residential', 'All'],
    effectiveDate: '2021-01-01',
  },
  {
    id: 'STD-003',
    title: 'NFPA 70: National Electrical Code (NEC) 2020',
    jurisdiction: 'USA',
    docType: 'Safety Standard',
    tags: ['Electrical', 'Safety'],
    effectiveDate: '2020-09-01',
  },
  {
    id: 'STD-004',
    title: '2021 International Energy Conservation Code (IECC)',
    jurisdiction: 'International',
    docType: 'Energy Code',
    tags: ['Energy', 'Efficiency'],
    effectiveDate: '2021-01-01',
  },
];

export default function LibraryPage() {

    const currentPlan = mockSubscriptionPlans.find(plan => plan.isCurrent);
    const isProOrEnterprise = currentPlan && (currentPlan.name === 'Pro' || currentPlan.name === 'Enterprise');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <div>
          <h1 className="text-2xl font-bold">Standards Library</h1>
          <p className="text-muted-foreground">
            Manage the codes and standards used to train your personal AI model.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filter
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>Concrete</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Electrical</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Residential</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" className="h-8 gap-1">
            <Upload className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Upload Document
            </span>
          </Button>
        </div>
      </div>
       <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search library by title, jurisdiction, or tag..."
          className="w-full rounded-md bg-card pl-9"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>My Saved Documents</CardTitle>
          <CardDescription>
            These documents are used by the AI for code cross-referencing and report generation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">Ref. ID</TableHead>
                <TableHead className="hidden md:table-cell">
                  Jurisdiction
                </TableHead>
                <TableHead className="hidden lg:table-cell">Tags</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStandards.map((standard) => (
                <TableRow key={standard.id}>
                  <TableCell className="font-medium">
                    {standard.title}
                    <div className="text-sm text-muted-foreground">
                      {standard.docType}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell font-mono text-xs">{standard.id}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {standard.jurisdiction}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex gap-1">
                      {standard.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        View
                      </Button>
                       <Button variant="ghost" size="sm">
                        <BookMarked className="mr-2 h-4 w-4" />
                        Unsave
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
