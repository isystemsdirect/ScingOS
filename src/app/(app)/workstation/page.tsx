
import Link from "next/link";
import {
  MoreHorizontal,
  PlusCircle,
  Wifi,
  WifiOff,
  AlertTriangle,
  Database,
  Cpu,
  Palette,
  KeyRound
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { mockDevices } from "@/lib/data"
import { Device } from "@/lib/types"

const getStatusIcon = (status: Device['status']) => {
  switch (status) {
    case 'Connected':
      return <Wifi className="h-4 w-4 text-green-500" />;
    case 'Disconnected':
      return <WifiOff className="h-4 w-4 text-muted-foreground" />;
    case 'Error':
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    default:
      return null;
  }
}

export default function WorkstationPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center">
        <div>
          <h1 className="text-3xl font-bold">Workstation</h1>
          <p className="text-muted-foreground">
            Your personal laboratory for experimentation and customization.
          </p>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
         <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Cpu className="h-6 w-6 text-primary" />
                    <CardTitle>Device Lab</CardTitle>
                </div>
                <CardDescription>
                    Manage, calibrate, and fine-tune your connected hardware outside of active inspections.
                </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDevices.map(device => (
                    <TableRow key={device.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                         <div className="font-medium">{device.name}</div>
                         <div className="text-sm text-muted-foreground">{device.type.replace('Key-','')}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={device.status === 'Connected' ? 'default' : 'secondary'}>{device.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                         <Button asChild size="sm">
                            <Link href={`/workstation/${device.id}`}>Tune & Calibrate</Link>
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
                 <Button size="sm" variant="outline" className="h-8 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Register New Device
                    </span>
                </Button>
            </CardFooter>
          </Card>
           <div className="grid gap-8 auto-rows-max">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Database className="h-6 w-6 text-primary" />
                        <CardTitle>Data Repositories</CardTitle>
                    </div>
                    <CardDescription>
                        Create and manage personal databases for photos, inspection data, and experimental inputs.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Create Repository</Button>
                </CardFooter>
            </Card>
             <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <KeyRound className="h-6 w-6 text-primary" />
                        <CardTitle>Connected Accounts</CardTitle>
                    </div>
                    <CardDescription>
                       Link third-party accounts like cloud storage or other services to expand your workstation.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Connect Account</Button>
                </CardFooter>
            </Card>
             <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Palette className="h-6 w-6 text-primary" />
                        <CardTitle>App Customization</CardTitle>
                    </div>
                    <CardDescription>
                        Modify UI themes, layouts, and other application settings. (Coming Soon)
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button disabled>Customize</Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  )
}
