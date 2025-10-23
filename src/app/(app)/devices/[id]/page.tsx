
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

const chartData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i * 5}s`,
  signal: Math.floor(Math.random() * 20 + 80),
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

  if (!device) {
    notFound();
  }

  const getStatusIndicator = (status: 'Connected' | 'Disconnected' | 'Error') => {
    switch (status) {
      case 'Connected':
        return <div className="flex items-center gap-2 text-green-500"><Wifi size={16} /><span>Connected</span></div>;
      case 'Disconnected':
        return <div className="flex items-center gap-2 text-muted-foreground"><PowerOff size={16} /><span>Disconnected</span></div>;
      case 'Error':
        return <div className="flex items-center gap-2 text-destructive"><AlertTriangle size={16} /><span>Error</span></div>;
    }
  }

  return (
    <div className="grid max-w-6xl mx-auto gap-8">
      <div className="flex items-center gap-4">
        <Link href="/devices">
          <Button variant="outline" size="icon" className="h-7 w-7">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back to Devices</span>
          </Button>
        </Link>
        <div className="h-10 w-10 flex items-center justify-center bg-muted rounded-lg">
            <Cpu className="h-6 w-6 text-primary" />
        </div>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          {device.name}
        </h1>
        <Badge variant={device.status === 'Connected' ? 'default' : 'secondary'}>{device.status}</Badge>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Live HUD</CardTitle>
                <CardDescription>Real-time telemetry and signal strength.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <AreaChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                    left: 12,
                    right: 12,
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                    dataKey="time"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent 
                        indicator="dot"
                        labelFormatter={(value, payload) => `Time: ${payload[0]?.payload.time}`} 
                        formatter={(value) => [`${value}%`, 'Signal Strength']}
                    />}
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
        </Card>
        
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Device Controls</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <Button variant="outline"><Play className="mr-2"/>Diagnostics</Button>
                    <Button variant="outline"><RotateCcw className="mr-2"/>Calibrate</Button>
                    <Button variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-500/50 hover:bg-blue-600/30"><Settings className="mr-2"/>Update Firmware</Button>
                    <Button variant="destructive"><Power className="mr-2"/>Reboot</Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Device Readings</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 text-sm">
                    <div className="flex items-center">
                        <Thermometer className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Core Temp:</span>
                        <span className="ml-auto font-medium">45°C</span>
                    </div>
                    <div className="flex items-center">
                        <HardDrive className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Storage:</span>
                        <span className="ml-auto font-medium">12.5 / 64 GB</span>
                    </div>
                     <div className="flex items-center">
                        <Cloud className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Cloud Sync:</span>
                        <span className="ml-auto font-medium">Up to date</span>
                    </div>
                     <div className="flex items-center">
                        <Bell className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Alerts:</span>
                         <span className="ml-auto font-medium text-green-500">Nominal</span>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Device Info</CardTitle>
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
  );
}
