
import Link from "next/link"
import { CircleUser, Cpu, Palette, PlusCircle, Trash2, Globe, Linkedin, Facebook, History, Mic, Camera, Sparkles, Database, KeyRound, User, Settings, Store, Bell, SlidersHorizontal, Bot, Wifi, Bluetooth } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { mockInspectors, mockSubscriptionPlans, mockDevices } from "@/lib/data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"

export default function WorkstationPage() {
  const user = mockInspectors[0];
  const currentPlan = mockSubscriptionPlans.find(plan => plan.isCurrent);
  const isProOrEnterprise = currentPlan && (currentPlan.name === 'Pro' || currentPlan.name === 'Enterprise');

  const searchHistory = [
    { id: 1, query: "foundation crack requirements", date: "2023-10-28" },
    { id: 2, query: "NFPA 70 section 240.87", date: "2023-10-27" },
    { id: 3, query: "asbestos testing protocol", date: "2023-10-26" },
  ]

  return (
    <div className="grid max-w-6xl mx-auto gap-4">
      <h1 className="text-3xl font-semibold">Workstation</h1>

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile"><User className="mr-2 h-4 w-4"/>Profile</TabsTrigger>
            <TabsTrigger value="ai"><Sparkles className="mr-2 h-4 w-4"/>AI & Voice</TabsTrigger>
            <TabsTrigger value="camera"><Camera className="mr-2 h-4 w-4"/>Camera</TabsTrigger>
            <TabsTrigger value="marketplace"><Store className="mr-2 h-4 w-4"/>Marketplace</TabsTrigger>
            <TabsTrigger value="devices"><Cpu className="mr-2 h-4 w-4"/>Device Lab</TabsTrigger>
            <TabsTrigger value="data"><Database className="mr-2 h-4 w-4"/>Data & Privacy</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
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
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" type="text" className="w-full" defaultValue={user.name} />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" className="w-full" defaultValue="john.doe@scingular.com" />
                    </div>
                </div>
                 <div className="grid gap-3">
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea id="bio" defaultValue={user.bio} placeholder="Tell us about your experience, specialties, and what makes you a great inspector." />
                </div>
                <Separator />
                 <div className="grid gap-6">
                    <h4 className="text-lg font-semibold">Website & Socials</h4>
                    <div className="grid gap-3">
                        <Label htmlFor="website">Website</Label>
                         <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="website" type="url" placeholder="https://your-website.com" className="pl-9" />
                        </div>
                    </div>
                     <div className="grid md:grid-cols-3 gap-4">
                         <div className="grid gap-3">
                            <Label htmlFor="whatsapp">WhatsApp</Label>
                            <Input id="whatsapp" type="tel" placeholder="+15551234567" />
                        </div>
                         <div className="grid gap-3">
                            <Label htmlFor="facebook">Facebook</Label>
                            <Input id="facebook" type="text" placeholder="yourprofile" />
                        </div>
                         <div className="grid gap-3">
                            <Label htmlFor="linkedin">LinkedIn</Label>
                            <Input id="linkedin" type="text" placeholder="yourprofile" />
                        </div>
                    </div>
                </div>
                 <Separator />
                 <div className="grid gap-3">
                    <Label htmlFor="profile-picture">Profile Selfie</Label>
                    <Input id="profile-picture" type="file" accept="image/*" />
                    <p className="text-xs text-muted-foreground">
                        For verification, please upload a clear photo of your face. Photos without a detectable face will be rejected.
                    </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button>Save Profile</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="ai">
             <Card>
                <CardHeader>
                  <CardTitle>Voice & AI Settings</CardTitle>
                  <CardDescription>
                    Customize your interaction with Scingular's AI features.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                   <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <h4 className="font-medium">"Hey, Scing!" Wake Phrase</h4>
                      <p className="text-sm text-muted-foreground">
                        Enable hands-free voice commands by listening for the wake phrase.
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="mic-device">Microphone Input</Label>
                    <Select>
                        <SelectTrigger id="mic-device">
                            <SelectValue placeholder="Select a microphone" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">Default System Microphone</SelectItem>
                            <SelectItem value="mic-1">Built-in Microphone (MacBook Pro)</SelectItem>
                            <SelectItem value="mic-2">AirPods Pro</SelectItem>
                            <SelectItem value="mic-3">WH-1000XM5 Wireless Headset</SelectItem>
                            <SelectItem value="mic-4">U-PHORIA UMC202HD</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                   <Separator />
                   <div className="grid gap-6">
                        <h4 className="text-lg font-semibold">Connectivity</h4>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <h5 className="font-medium">Prioritize Stable WiFi Connection</h5>
                                <p className="text-sm text-muted-foreground">
                                    When enabled, Scing will prefer stable WiFi over cellular data for large uploads.
                                </p>
                            </div>
                            <Switch />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <h5 className="font-medium">Bluetooth & Wireless Devices</h5>
                                <p className="text-sm text-muted-foreground">
                                    Manage your connected headsets and other wireless peripherals.
                                </p>
                            </div>
                            <Button variant="outline"><Bluetooth className="mr-2 h-4 w-4" /> Manage Devices</Button>
                        </div>
                    </div>
                   <Separator />
                  <div className="grid gap-3">
                    <Label htmlFor="scing-voice">Scing Voice Response</Label>
                    <Select defaultValue="algenib">
                        <SelectTrigger id="scing-voice">
                            <SelectValue placeholder="Select a voice" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="algenib">Algenib (Default)</SelectItem>
                            <SelectItem value="achernar">Achernar</SelectItem>
                            <SelectItem value="canopus">Canopus</SelectItem>
                            <SelectItem value="rigel">Rigel</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                   <div className="grid gap-3">
                     <Label htmlFor="recognition-sensitivity">Voice Recognition Sensitivity</Label>
                     <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">Less</span>
                        <Slider id="recognition-sensitivity" defaultValue={[50]} max={100} step={1} />
                        <span className="text-xs text-muted-foreground">More</span>
                     </div>
                  </div>
                   <Separator />
                   <div>
                        <h4 className="text-lg font-medium">AI Learning Preferences</h4>
                        <p className="text-sm text-muted-foreground mb-4">Allow Scing to learn from your usage to improve its performance.</p>
                        <div className="space-y-4">
                             <div className="flex items-center space-x-2">
                                <Checkbox id="learn-voice" defaultChecked />
                                <Label htmlFor="learn-voice" className="font-normal">Allow Scing to learn from my voice commands to improve accuracy.</Label>
                             </div>
                             <div className="flex items-center space-x-2">
                                <Checkbox id="learn-data" defaultChecked />
                                <Label htmlFor="learn-data" className="font-normal">Use my inspection data to personalize AI summaries and suggestions.</Label>
                             </div>
                        </div>
                        <div className="mt-4">
                            <Button variant="outline"><Bot className="mr-2 h-4 w-4"/>Retrain Voice Model</Button>
                        </div>
                   </div>

                </CardContent>
                 <CardFooter className="border-t px-6 py-4">
                  <Button>Save AI Preferences</Button>
                </CardFooter>
              </Card>
        </TabsContent>
        <TabsContent value="camera">
            <Card>
                <CardHeader>
                <CardTitle>Camera & Vision Settings</CardTitle>
                <CardDescription>
                    Configure camera settings for high-quality visual data capture.
                </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex-1">
                    <h4 className="font-medium">Enable Pro Mode</h4>
                    <p className="text-sm text-muted-foreground">
                        Unlock advanced controls for exposure, focus, and white balance.
                    </p>
                    {!isProOrEnterprise && (
                        <Button variant="link" size="sm" asChild className="p-0 h-auto text-primary">
                        <Link href="/finances"><Sparkles className="mr-2 h-4 w-4" />Upgrade to Pro to enable this feature</Link>
                        </Button>
                    )}
                    </div>
                    <Switch disabled={!isProOrEnterprise} />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="grid gap-3">
                    <Label htmlFor="cam-resolution">Resolution</Label>
                    <Select defaultValue="1080">
                        <SelectTrigger id="cam-resolution">
                            <SelectValue placeholder="Select resolution" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="720">1280x720 (720p)</SelectItem>
                            <SelectItem value="1080">1920x1080 (1080p)</SelectItem>
                            <SelectItem value="4k">3840x2160 (4K UHD)</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                    <div className="grid gap-3">
                    <Label htmlFor="cam-fps">Frame Rate</Label>
                    <Select defaultValue="30">
                        <SelectTrigger id="cam-fps">
                            <SelectValue placeholder="Select frame rate" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="30">30 FPS</SelectItem>
                            <SelectItem value="60">60 FPS</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                    <div className="grid gap-3">
                    <Label htmlFor="cam-facing">Preferred Camera</Label>
                    <Select defaultValue="environment">
                        <SelectTrigger id="cam-facing">
                            <SelectValue placeholder="Select camera" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="user">Front (Selfie)</SelectItem>
                            <SelectItem value="environment">Back (Environment)</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                <Button>Save Camera Preferences</Button>
                </CardFooter>
            </Card>
        </TabsContent>
        <TabsContent value="marketplace">
            <Card>
                <CardHeader>
                <CardTitle>Marketplace Availability</CardTitle>
                <CardDescription>
                    Control your visibility in the inspector marketplace.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                    <h4 className="font-medium">Available for Dispatch</h4>
                    <p className="text-sm text-muted-foreground">
                        Enable this to appear as 'On-Call' and available for immediate dispatch requests from the marketplace.
                    </p>
                    </div>
                    <Switch defaultChecked={user.onCall} />
                </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button>Save Changes</Button>
                </CardFooter>
            </Card>
        </TabsContent>
        <TabsContent value="devices">
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
        </TabsContent>
        <TabsContent value="data">
             <div className="grid gap-6">
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
                <Card>
                    <CardHeader>
                    <CardTitle>Scing Search History</CardTitle>
                    <CardDescription>
                        Review or clear your past AI search queries.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Query</TableHead>
                            <TableHead className="text-right">Date</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {searchHistory.map((item) => (
                            <TableRow key={item.id}>
                            <TableCell className="font-medium truncate max-w-[300px]">{item.query}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{item.date}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                    <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear History
                    </Button>
                    </CardFooter>
                </Card>
             </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
