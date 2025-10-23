import Link from "next/link";
import {
  MoreHorizontal,
  PlusCircle,
  Wifi,
  WifiOff,
  AlertTriangle
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
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

export default function DevicesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <div>
          <h1 className="text-2xl font-bold">Device & Sensor Hub</h1>
          <p className="text-muted-foreground">
            Manage your connected inspection hardware.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Register Device
            </span>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Connected Devices</CardTitle>
          <CardDescription>
            A list of all your registered devices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Icon</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">
                  Last Seen
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDevices.map(device => (
                <TableRow key={device.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <TableCell className="hidden sm:table-cell">
                    <div className="h-10 w-10 flex items-center justify-center bg-muted rounded-lg">
                      {getStatusIcon(device.status)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                     <Link href={`/devices/${device.id}`} className="hover:underline">
                      {device.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{device.type.replace('Key-', '')}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={device.status === 'Connected' ? 'default' : 'secondary'}>{device.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {device.lastSeen}
                  </TableCell>
                  <TableCell className="text-right">
                     <Button asChild size="sm">
                        <Link href={`/devices/${device.id}`}>Dashboard</Link>
                     </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-4</strong> of <strong>4</strong> devices
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
