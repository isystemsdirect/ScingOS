
'use client';
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  ChevronLeft,
  KeyRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function KeyManagementPage() {
  const params = useParams<{ id: string }>();
  
  if (!params.id) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
      <div className="grid gap-8">
        <div className="flex items-center gap-4">
          <Link href="/workstation?tab=keys">
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back to Workstation</span>
            </Button>
          </Link>
          <div className="h-10 w-10 flex items-center justify-center bg-muted rounded-lg">
              <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Manage Key
          </h1>
          <Badge variant="secondary" className="font-mono">{params.id}</Badge>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Key Details</CardTitle>
                <CardDescription>Details for key: {params.id}</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Management interface for this key will be built here.</p>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}

    