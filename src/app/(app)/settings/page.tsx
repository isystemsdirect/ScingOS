
import Link from "next/link"
import { CircleUser, Home, LineChart, Package, Package2, PanelLeft, Search, Settings, ShoppingCart, Users2, PlusCircle, Trash2, Globe, Linkedin, Facebook, History, Mic, Camera, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { mockInspectors, mockSubscriptionPlans } from "@/lib/data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  const user = mockInspectors[0];
  
  return (
    <div className="grid max-w-4xl mx-auto gap-4">
      <h1 className="text-3xl font-semibold">Account Settings</h1>

      <main className="grid flex-1 items-start gap-4 md:gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Credentials & Licenses</CardTitle>
                <CardDescription>
                    Manage your professional credentials. This information will be displayed on your public profile and is required for certain marketplace activities.
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
                <Button asChild>
                    <Link href="/settings/certifications/add">
                        <PlusCircle className="mr-2 h-4 w-4" />Add Credential
                    </Link>
                </Button>
                <p className="text-xs text-muted-foreground ml-auto">*Verification may take 24-48 hours.</p>
            </CardFooter>
          </Card>
        
        <Card>
            <CardHeader>
              <CardTitle>Login & Security</CardTitle>
              <CardDescription>
                Manage your password and two-factor authentication.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" className="w-full" defaultValue="john.doe@scingular.com" disabled />
                </div>
                 <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Password</p>
                    <Button variant="outline">Change Password</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account.
                      </p>
                    </div>
                    <Button variant="outline">Enable</Button>
                </div>
            </CardContent>
          </Card>
      </main>
    </div>
  )
}
