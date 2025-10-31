
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, PlusCircle, User, Mail, Phone, MapPin, Building, Calendar, Edit, FileText } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { mockClients, mockInspections } from "@/lib/data";

export default function ClientProfilePage({ params }: { params: { id: string } }) {
  const client = mockClients.find(c => c.id === params.id);
  const clientInspections = mockInspections.slice(0,2); // Placeholder

  if (!client) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
      <div className="grid gap-8">
        <div className="flex items-center gap-4">
            <Link href="/clients">
              <Button variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back to Clients & Contacts</span>
              </Button>
            </Link>
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              Client & Contact Profile
            </h1>
          </div>

        <div className="grid gap-8 md:grid-cols-[200px_1fr]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-40 h-40 rounded-full bg-muted/40 backdrop-blur-sm flex items-center justify-center">
                <Building className="w-20 h-20 text-muted-foreground" />
            </div>
            <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit Client</Button>
          </div>
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-4xl">{client.name}</CardTitle>
              <CardDescription>
                Client since {new Date(client.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4">
                  <h3 className="text-xl font-semibold">Contact Information</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <span>{client.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <span>{client.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 md:col-span-2">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <span>{client.address.street}, {client.address.city}, {client.address.state} {client.address.zip}</span>
                      </div>
                  </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">Inspection History</h3>
                      <Button asChild>
                          <Link href={{pathname: "/inspections/new", query: { clientId: client.id }}}><PlusCircle className="mr-2 h-4 w-4" />Start New Inspection</Link>
                      </Button>
                  </div>
                  <Card className="bg-card/60 backdrop-blur-sm">
                      <CardContent className="p-0">
                      <Table>
                          <TableHeader>
                          <TableRow>
                              <TableHead>Inspection</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="hidden md:table-cell">Date</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                          </TableHeader>
                          <TableBody>
                          {clientInspections.map((inspection) => (
                              <TableRow key={inspection.id}>
                                  <TableCell>
                                      <div className="font-medium">{inspection.title}</div>
                                      <div className="hidden text-sm text-muted-foreground md:inline">
                                      {inspection.propertyAddress.street}
                                      </div>
                                  </TableCell>
                                  <TableCell>
                                      <Badge variant={inspection.status === 'Final' ? 'default' : 'secondary'}>
                                      {inspection.status}
                                      </Badge>
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell">{inspection.date}</TableCell>
                                  <TableCell className="text-right">
                                      <Button asChild variant="outline" size="sm">
                                      <Link href={`/inspections/${inspection.id}`}>View Report</Link>
                                      </Button>
                                  </TableCell>
                              </TableRow>
                          ))}
                          </TableBody>
                      </Table>
                      </CardContent>
                  </Card>
              </div>
              
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
