import Link from "next/link"
import { CircleUser, Home, LineChart, Package, Package2, PanelLeft, Search, Settings, ShoppingCart, Users2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"

export default function SettingsPage() {
  return (
    <div className="grid max-w-4xl mx-auto gap-2">
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
                <div className="grid gap-3">
                  <label htmlFor="certifications">Certifications</label>
                  <Textarea
                    id="certifications"
                    defaultValue="InterNACHI Certified, Licensed Drone Pilot, Level II Thermographer"
                    className="min-h-24"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter each certification on a new line.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button>Save Profile</Button>
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
