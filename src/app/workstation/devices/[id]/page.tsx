'use client';
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  ChevronLeft,
  Wifi,
  Power,
  PowerOff,
  Settings,
  Bell,
  HardDrive,
  BarChart,
  Thermometer,
  Cloud,
  AlertTriangle,
  Play,
  RotateCcw,
  Cpu,
  Signal,
  BatteryCharging,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockDevices } from "@/lib/data";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";


const chartData = Array.from({ length: 10 }, (_, i) => ({
  time: `${i * 10}s`,
  signal: Math.floor(Math.random() * (95 - 75 + 1) + 75),
}));

const chartConfig = {
  signal: {
    label: "Signal",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;


export default function DeviceDashboardPage() {
  const params = useParams<{ id: string }>();
  const device = mockDevices.find(d => d.id === params.id);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [showLiveHud, setShowLiveHud] = useState(true);
  const [showTelemetry, setShowTelemetry] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let stream: MediaStream | null = null;
    const getCameraPermission = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to see the live feed.',
        });
      }
    };

    if(showLiveHud){
      getCameraPermission();
    }

    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast, showLiveHud]);


  if (!device) {
    notFound();
  }

  const getStatusIndicator = (status: 'Connected' | 'Disconnected' | 'Error') => {
    switch (status) {
      case 'Connected':
        return <div className="flex items-center gap-2 text-foreground"><Wifi size={16} /><span>Connected</span></div>;
      case 'Disconnected':
        return <div className="flex items-center gap-2 text-muted-foreground"><PowerOff size={16} /><span>Disconnected</span></div>;
      case 'Error':
        return <div className="flex items-center gap-2 text-destructive"><AlertTriangle size={16} /><span>Error</span></div>;
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
      <div className="grid gap-8">
        <div className="flex items-center gap-4">
          <Link href="/workstation">
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back to Workstation</span>
            </Button>
          </Link>
          <div className="h-10 w-10 flex items-center justify-center bg-muted rounded-lg">
              <Cpu className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              {device.name}
            </h1>
            <p className="text-sm text-muted-foreground">Manage and monitor your connected hardware in real-time.</p>
          </div>
          <Badge variant={device.status === 'Connected' ? 'default' : 'secondary'} className="ml-auto">{device.status}</Badge>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-8 lg:col-span-2">
              <Card className="bg-card/60 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Live HUD</CardTitle>
                        <CardDescription>A real-time video feed from the device's primary camera.</CardDescription>
                      </div>
                      <Switch checked={showLiveHud} onCheckedChange={setShowLiveHud} id="live-hud-toggle" />
                    </div>
                  </CardHeader>
                  {showLiveHud && (
                    <CardContent className="grid gap-6">
                        <div className="relative aspect-video w-full bg-muted rounded-md overflow-hidden flex items-center justify-center">
                            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                            {hasCameraPermission === false && (
                                <Alert variant="destructive" className="w-auto">
                                    <AlertTitle>Camera Access Required</AlertTitle>
                                    <AlertDescription>
                                        Please allow camera access to use this feature.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </CardContent>
                  )}
              </Card>
              <Card className="bg-card/60 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Telemetry Readings</CardTitle>
                        <CardDescription>View historical data for key device metrics.</CardDescription>
                      </div>
                      <Switch checked={showTelemetry} onCheckedChange={setShowTelemetry} id="telemetry-toggle" />
                    </div>
                  </CardHeader>
                  {showTelemetry && (
                    <CardContent>
                        <Label htmlFor="chart-metric">Signal Strength (last 100s)</Label>
                        <ChartContainer config={chartConfig} className="h-[200px] w-full mt-2">
                            <AreaChart accessibilityLayer data={chartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="time"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="line" />}
                                />
                                <Area
                                dataKey="signal"
                                type="natural"
                                fill="var(--color-signal)"
                                fillOpacity={0.4}
                                stroke="var(--color-signal)"
                                stackId="a"
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                  )}
              </Card>
          </div>
          
          <div className="space-y-8">
              <Card className="bg-card/60 backdrop-blur-sm">
                  <CardHeader>
                      <CardTitle>Device Controls</CardTitle>
                      <CardDescription>Perform remote actions on your device.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                      <Button variant="outline"><Play className="mr-2"/>Diagnostics</Button>
                      <Button variant="outline"><RotateCcw className="mr-2"/>Calibrate</Button>
                      <Button variant="secondary"><Settings className="mr-2"/>Update Firmware</Button>
                      <Button variant="destructive"><Power className="mr-2"/>Reboot</Button>
                  </CardContent>
              </Card>
              <Card className="bg-card/60 backdrop-blur-sm">
                  <CardHeader>
                      <CardTitle>Device Readings</CardTitle>
                      <CardDescription>Real-time data from internal sensors.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 text-sm">
                      <div className="flex items-center">
                          <Thermometer className="h-4 w-4 mr-2 text-muted-foreground" />
                          <Label>Core Temp:</Label>
                          <span className="ml-auto font-medium">45°C</span>
                      </div>
                      <div className="flex items-center">
                          <HardDrive className="h-4 w-4 mr-2 text-muted-foreground" />
                          <Label>Storage:</Label>
                          <span className="ml-auto font-medium">12.5 / 64 GB</span>
                      </div>
                      <div className="flex items-center">
                          <Cloud className="h-4 w-4 mr-2 text-muted-foreground" />
                          <Label>Cloud Sync:</Label>
                          <span className="ml-auto font-medium">Up to date</span>
                      </div>
                      <div className="flex items-center">
                          <BatteryCharging className="h-4 w-4 mr-2 text-muted-foreground" />
                          <Label>Battery 1 (Active):</Label>
                          <span className="ml-auto font-medium">88% (2h 15m)</span>
                      </div>
                      <div className="flex items-center">
                          <BatteryCharging className="h-4 w-4 mr-2 text-muted-foreground" />
                          <Label>Battery 2:</Label>
                          <span className="ml-auto font-medium">95%</span>
                      </div>
                      <div className="flex items-center">
                          <Bell className="h-4 w-4 mr-2 text-muted-foreground" />
                          <Label>Alerts:</Label>
                          <span className="ml-auto font-medium">Nominal</span>
                      </div>
                  </CardContent>
              </Card>
              <Card className="bg-card/60 backdrop-blur-sm">
                  <CardHeader>
                      <CardTitle>Device Info</CardTitle>
                      <CardDescription>Essential identification and status details.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Table>
                          <TableBody>
                              <TableRow>
                                  <TableCell className="font-medium">Status</TableCell>
                                  <TableCell>{getStatusIndicator(device.status)}</TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell className="font-medium">Type</TableCell>
                                  <TableCell>{device.type.replace('Key-', '')}</TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell className="font-medium">Firmware</TableCell>
                                  <TableCell>{device.firmwareVersion}</TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell className="font-medium">Last Seen</TableCell>
                                  <TableCell>{device.lastSeen}</TableCell>
                              </TableRow>
                          </TableBody>
                      </Table>
                  </CardContent>
              </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
