import Link from "next/link"
import { CircleUser, Home, LineChart, Package, Package2, PanelLeft, Search, Settings, ShoppingCart, Users2, PlusCircle, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { mockInspectors } from "@/lib/data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  const user = mockInspectors[0];

  return (
    <div className="grid max-w-4xl mx-auto gap-4">
      <h1 className="text-3xl font-semibold">Settings</h1>

      <main className="grid flex-1 items-start gap-4 md:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Inspector Profile</CardTitle>
              <CardDescription>
                Manage your public-facing inspector information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-3">
                        <label htmlFor="name">Full Name</label>
                        <Input id="name" type="text" className="w-full" defaultValue="John Doe" />
                    </div>
                    <div className="grid gap-3">
                        <label htmlFor="email">Email</label>
                        <Input id="email" type="email" className="w-full" defaultValue="john.doe@scingular.com" />
                    </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button>Save Profile</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle>Certifications & Licenses</CardTitle>
                <CardDescription>
                    Manage your professional credentials. This information will be displayed on your public profile.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Field of Inspection</TableHead>
                            <TableHead>License / ID</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {user.certifications.map(cert => (
                            <TableRow key={cert.id}>
                                <TableCell className="font-medium">{cert.name}</TableCell>
                                <TableCell>{cert.id}</TableCell>
                                <TableCell>
                                    <Badge variant={cert.verified ? "default" : "secondary"}>
                                        {cert.verified ? "Verified" : "Pending"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="icon" variant="ghost">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="border-t p-6">
                 <div className="grid w-full gap-4">
                    <h4 className="text-md font-semibold">Add New Certification</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                        <Input placeholder="Field of Inspection (e.g. Home Inspector)" />
                        <Input placeholder="License or Certification ID" />
                        <Input placeholder="Certifying Body (e.g. InterNACHI)" />
                    </div>
                    <div className="flex">
                      <Button><PlusCircle className="mr-2 h-4 w-4" />Add Certification</Button>
                      <p className="text-xs text-muted-foreground ml-auto">*Verification may take 24-48 hours.</p>
                    </div>
                 </div>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>
                Update your company's branding and information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                 <div className="grid gap-3">
                    <label htmlFor="company-name">Company Name</label>
                    <Input id="company-name" type="text" className="w-full" defaultValue="Doe Inspections LLC" />
                </div>
                <div className="grid gap-3">
                    <label htmlFor="logo">Company Logo</label>
                    <Input id="logo" type="file" />
                </div>
              </div>
            </CardContent>
             <CardFooter className="border-t px-6 py-4">
              <Button>Save Company Info</Button>
            </CardFooter>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage how you receive notifications from Scingular.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="flex items-center space-x-2">
                    <Checkbox id="email-notifications" defaultChecked/>
                    <label htmlFor="email-notifications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Email Notifications
                    </label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="push-notifications" />
                    <label htmlFor="push-notifications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Push Notifications
                    </label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="sms-notifications" defaultChecked />
                    <label htmlFor="sms-notifications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        SMS Notifications for urgent alerts
                    </label>
                </div>
            </CardContent>
             <CardFooter className="border-t px-6 py-4">
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
