
import Link from "next/link";
import {
  MoreHorizontal,
  PlusCircle,
  File,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { mockClients } from "@/lib/data"

export default function ClientsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <div>
            <h1 className="text-2xl font-bold">Clients & Contacts</h1>
            <p className="text-muted-foreground max-w-2xl mt-1">
              This is your centralized database for all clients and professional contacts. From here, you can add new clients, view their complete profiles and inspection histories, and manage their information.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Client
              </span>
            </Button>
          </div>
        </div>
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Client & Contact Database</CardTitle>
            <CardDescription>
              A list of all your clients and contacts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Member Since
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockClients.map(client => (
                  <TableRow key={client.id} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <Link href={`/clients/${client.id}`} className="hover:underline">
                        {client.name}
                      </Link>
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{client.phone}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button asChild variant="outline" size="sm">
                          <Link href={`/clients/${client.id}`}>View Profile</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                          <Link href="/finances">View Finances</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
