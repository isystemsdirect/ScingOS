import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  File,
  Home,
  LineChart,
  ListFilter,
  MoreVertical,
  Package,
  Package2,
  PanelLeft,
  Search,
  Settings,
  ShoppingCart,
  Truck,
  Users2,
  Download,
  FileText,
  Paperclip,
  Bot,
  PlayCircle,
  BookCheck,
  Signature
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { mockInspections, mockInspectors } from "@/lib/data";
import { notFound } from "next/navigation";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { textToSpeech } from "@/ai/flows/lari-text-to-speech";
import { useState } from "react";


export default function InspectionDetailPage({ params }: { params: { id: string } }) {
  const inspection = mockInspections.find(inv => inv.id === params.id);
  const inspector = mockInspectors.find(insp => insp.id === inspection?.inspectorId);

  if (!inspection || !inspector) {
    notFound();
  }
  
  const inspectorAvatar = PlaceHolderImages.find(p => p.id === inspector.imageHint);

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="mx-auto grid max-w-6xl flex-1 auto-rows-max gap-4">
        <div className="flex items-center gap-4">
          <Link href="/inspections">
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            {inspection.title}
          </h1>
          <Badge variant="outline" className="ml-auto sm:ml-0">
            {inspection.status}
          </Badge>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button variant="outline" size="sm">
              Discard
            </Button>
            <Button size="sm">Save</Button>
          </div>
        </div>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="findings">Findings</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="report">Report</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
              <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Inspection Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-3">
                          <div className="font-semibold">Property Address</div>
                          <address className="grid gap-0.5 not-italic text-muted-foreground">
                            <span>{inspection.propertyAddress.street}</span>
                            <span>{inspection.propertyAddress.city}, {inspection.propertyAddress.state} {inspection.propertyAddress.zip}</span>
                          </address>
                        </div>
                        <div className="grid auto-rows-max gap-3">
                          <div className="font-semibold">Inspection Date</div>
                          <div className="text-muted-foreground">{inspection.date}</div>
                        </div>
                      </div>
                      <Separator />
                       <div className="grid gap-3">
                        <div className="font-semibold">Devices Used</div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {inspection.deviceKeysUsed.map(key => (
                             <Badge key={key} variant="secondary">{key.replace('Key-', '')}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Bot className="h-6 w-6 text-primary" />
                    <CardTitle>AI Executive Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{inspection.executiveSummary}</p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Inspector</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-start gap-4">
                    {inspectorAvatar && <Image src={inspectorAvatar.imageUrl} alt={inspector.name} width={64} height={64} className="rounded-full" data-ai-hint={inspectorAvatar.imageHint} />}
                    <div className="grid gap-1">
                      <div className="font-semibold">{inspector.name}</div>
                      <div className="text-sm text-muted-foreground">{inspector.certifications[0].name}</div>
                       <div className="text-sm text-muted-foreground">Rating: {inspector.rating} ({inspector.reviews} reviews)</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="findings">
            <Card>
              <CardHeader>
                <CardTitle>Inspection Findings</CardTitle>
                <CardDescription>
                  Detailed findings from the inspection, with evidence and code references.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {inspection.findings.map((finding) => (
                    <div key={finding.id} className="grid gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                             <Badge variant={finding.severity === 'High' || finding.severity === 'Critical' ? 'destructive' : 'secondary'}>{finding.severity}</Badge>
                            <h3 className="font-semibold">{finding.type}</h3>
                            <span className="text-xs text-muted-foreground">(Confidence: {finding.confidence * 100}%)</span>
                          </div>
                          <p className="mt-2 text-muted-foreground">{finding.description}</p>
                          <p className="mt-2 text-sm"><strong>Inspector Note:</strong> {finding.inspectorNote}</p>
                          <div className="mt-4 flex items-center gap-4">
                            <Button variant="outline" size="sm"><BookCheck className="h-4 w-4 mr-2"/>Cross-Check Standards</Button>
                             <div className="text-sm text-muted-foreground">Ref: {finding.codeReferences[0].docId}, {finding.codeReferences[0].section}</div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {finding.evidence.map((ev, index) => (
                          <div key={index} className="relative group aspect-video">
                            <Image src={ev.url} alt={`Evidence for ${finding.type}`} fill className="rounded-lg object-cover" data-ai-hint={ev.imageHint} />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                              <Button size="sm">View</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="attachments">
              <Card>
                <CardHeader>
                  <CardTitle>Attachments</CardTitle>
                  <CardDescription>All media and documents related to this inspection.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {PlaceHolderImages.filter(p => p.id.startsWith('inspection-')).map(img => (
                    <Card key={img.id}>
                      <CardContent className="p-0">
                        <Image src={img.imageUrl} alt={img.description} width={600} height={400} className="rounded-t-lg aspect-video object-cover" data-ai-hint={img.imageHint} />
                      </CardContent>
                      <CardFooter className="p-2 flex justify-between">
                        <p className="text-xs text-muted-foreground">{img.description}</p>
                        <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                      </CardFooter>
                    </Card>
                  ))}
                </CardContent>
              </Card>
          </TabsContent>
          <TabsContent value="report">
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Generate & Export Report</CardTitle>
                    <CardDescription>Finalize and share the inspection report.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                     <div className="grid md:grid-cols-2 gap-4">
                      <Button size="lg"><FileText className="h-5 w-5 mr-2" />Export as PDF</Button>
                      <Button size="lg" variant="outline"><File className="h-5 w-5 mr-2" />Export as PowerPoint</Button>
                    </div>
                    <div className="flex items-center gap-4">
                       <Signature className="h-8 w-8 text-muted-foreground"/>
                       <div className="flex-1">
                          <p className="font-semibold">Inspector Signature</p>
                          <p className="text-sm text-muted-foreground">A signature is required to finalize the report.</p>
                       </div>
                       <Button>Sign Report</Button>
                    </div>
                  </CardContent>
                </Card>
                 <Card>
                  <CardHeader>
                    <CardTitle>Audio Presentation</CardTitle>
                    <CardDescription>AI-generated audio summary of the report.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center gap-4 p-10">
                    <PlayCircle className="h-20 w-20 text-primary" />
                    <p className="text-sm text-muted-foreground">15-minute investor presentation</p>
                    <Button className="w-full"><PlayCircle className="h-4 w-4 mr-2" /> Play Audio</Button>
                  </CardContent>
                </Card>
             </div>
          </TabsContent>
        </Tabs>
        <div className="flex items-center justify-center gap-2 md:hidden">
          <Button variant="outline" size="sm">
            Discard
          </Button>
          <Button size="sm">Save</Button>
        </div>
      </div>
    </div>
  );
}
