
import Link from "next/link"
import { CircleUser, Cpu, Palette, PlusCircle, Trash2, Globe, Linkedin, Facebook, History, Mic, Camera, Sparkles, Database, KeyRound, User, Settings, Store, Bell, SlidersHorizontal, Bot, Wifi, Bluetooth, MapPin, Search, Link2, Calendar, FileText, ScanLine, Eye } from "lucide-react"


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
import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import inspectionData from '@/lib/inspection-types.json';
import { WorkstationTimeFormatSwitch } from "@/components/workstation-time-format-switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { WorkstationLocationSettings } from "@/components/workstation-location-settings"

export default function WorkstationPage() {
  const user = mockInspectors[0];
  const currentPlan = mockSubscriptionPlans.find(plan => plan.isCurrent);
  const isProOrEnterprise = currentPlan && (currentPlan.name === 'Pro' || currentPlan.name === 'Enterprise');

  const searchHistory = [
    { id: 1, query: "foundation crack requirements", date: "2023-10-28" },
    { id: 2, query: "NFPA 70 section 240.87", date: "2023-10-27" },
    { id: 3, query: "asbestos testing protocol", date: "2023-10-26" },
  ];

  const mockKeys = [
    { id: "key_vision_std_abc123", name: "Standard Vision Key", lariEngine: "LARI-VISION", entitlement: "Core", status: "Active" },
    { id: "key_thermal_std_ghi789", name: "Standard Thermal Key", lariEngine: "LARI-THERM", entitlement: "Core", status: "Active" },
    { id: "key_audio_std_jkl012", name: "Standard Audio Key", lariEngine: "LARI-ECHO", entitlement: "Core", status: "Active" },
    { id: "key_dose_pro_def456", name: "Professional Drone Key", lariEngine: "LARI-DOSE", entitlement: "Pro", status: "Active" },
    { id: "key_mapper_ent_ghi789", name: "Enterprise LiDAR Key", lariEngine: "LARI-MAPPER", entitlement: "Enterprise", status: "Inactive" },
    { id: "key_prism_max_jkl012", name: "Max Spectrometer Key", lariEngine: "LARI-PRISM", entitlement: "MAX", status: "Active" },
    { id: "key_sonar_max_mno345", name: "Max Sonar Key", lariEngine: "LARI-ECHO", entitlement: "MAX", status: "Inactive" },
  ];
  
  const mockTemplates = [
      { id: "TPL-001", name: "My Custom Residential Template", description: "A variation of the standard residential template with added moisture checks.", date: "2023-10-29" },
  ];

  const envVars = [
      { key: "NEXT_PUBLIC_FIREBASE_API_KEY", value: process.env.NEXT_PUBLIC_FIREBASE_API_KEY },
      { key: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", value: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN },
      { key: "NEXT_PUBLIC_FIREBASE_PROJECT_ID", value: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID },
      { key: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", value: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET },
      { key: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", value: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID },
      { key: "NEXT_PUBLIC_FIREBASE_APP_ID", value: process.env.NEXT_PUBLIC_FIREBASE_APP_ID },
      { key: "FIREBASE_PROJECT_ID", value: process.env.FIREBASE_PROJECT_ID },
      { key: "FIREBASE_CLIENT_EMAIL", value: process.env.FIREBASE_CLIENT_EMAIL },
      { key: "FIREBASE_PRIVATE_KEY", value: process.env.FIREBASE_PRIVATE_KEY ? `${process.env.FIREBASE_PRIVATE_KEY.substring(0, 30)}...` : undefined },
      { key: "NEXT_PUBLIC_PICOVOICE_ACCESS_KEY", value: process.env.NEXT_PUBLIC_PICOVOICE_ACCESS_KEY },
      { key: "GOOGLE_WEATHER_API_KEY", value: process.env.GOOGLE_WEATHER_API_KEY },
      { key: "NEXT_PUBLIC_STREAM_API_KEY", value: process.env.NEXT_PUBLIC_STREAM_API_KEY },
      { key: "GEMINI_API_KEY", value: process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 10)}...` : undefined },
      { key: "AWS_ACCESS_KEY_ID", value: process.env.AWS_ACCESS_KEY_ID },
      { key: "AWS_SECRET_ACCESS_KEY", value: process.env.AWS_SECRET_ACCESS_KEY ? "********" : undefined },
  ].filter(v => v.value);

  return (
    <div className="mx-auto w-full max-w-6xl">
       <div className="flex items-center justify-between px-4 lg:px-6">
          <div>
            <h1 className="text-3xl font-semibold">Workstation</h1>
            <p className="text-muted-foreground max-w-2xl mt-1">This is your personal command center for managing your profile, devices, and settings. Configure your professional credentials, manage device keys, customize your AI, and fine-tune your marketplace presence.</p>
          </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> New Capture
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Start New Reading</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/workstation/vision">
                <Eye className="mr-2 h-4 w-4" />
                <span>Vision Analysis</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/workstation/lidar">
                <ScanLine className="mr-2 h-4 w-4" />
                <span>LiDAR Capture</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Camera className="mr-2 h-4 w-4" />
              <span>Visual Capture</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mic className="mr-2 h-4 w-4" />
              <span>Audio Recording</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/inspections/new">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Start Full Inspection</span>
                </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="profile" className="relative">
        <div className="sticky top-0 z-20 pt-4 -mx-6 px-6 pb-2">
            <TabsList className="grid h-auto w-full grid-cols-1 md:grid-cols-5 lg:grid-cols-10 border p-1 bg-background/60 backdrop-blur-sm">
                <TabsTrigger value="profile" className="py-2"><User className="mr-2 h-4 w-4"/>Profile</TabsTrigger>
                <TabsTrigger value="credentials" className="py-2"><KeyRound className="mr-2 h-4 w-4"/>Credentials</TabsTrigger>
                <TabsTrigger value="keys" className="py-2"><KeyRound className="mr-2 h-4 w-4"/>Keys</TabsTrigger>
                <TabsTrigger value="templates" className="py-2"><FileText className="mr-2 h-4 w-4"/>Templates</TabsTrigger>
                <TabsTrigger value="integrations" className="py-2"><Link2 className="mr-2 h-4 w-4"/>Integrations</TabsTrigger>
                <TabsTrigger value="security" className="py-2"><User className="mr-2 h-4 w-4"/>Security</TabsTrigger>
                <TabsTrigger value="ai" className="py-2"><Sparkles className="mr-2 h-4 w-4"/>AI & Voice</TabsTrigger>
                <TabsTrigger value="marketplace" className="py-2"><Store className="mr-2 h-4 w-4"/>Marketplace</TabsTrigger>
                <TabsTrigger value="devices" className="py-2"><Cpu className="mr-2 h-4 w-4"/>Device Lab</TabsTrigger>
                <TabsTrigger value="data" className="py-2"><Database className="mr-2 h-4 w-4"/>Data & Privacy</TabsTrigger>
            </TabsList>
        </div>
        <div className={cn("space-y-4 pt-4 px-4 lg:px-6", 
            "[mask-image:linear-gradient(to_bottom,transparent_0,black_2rem,black_100%)]"
        )}>
            <TabsContent value="profile">
            <Card className="bg-card/60 backdrop-blur-sm">
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
                            <p className="text-sm text-muted-foreground -mt-1">Your legal name, used for verification.</p>
                            <Input id="name" type="text" className="w-full" defaultValue={user.name} />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="email">Email</Label>
                             <p className="text-sm text-muted-foreground -mt-1">Your primary contact and login email.</p>
                            <Input id="email" type="email" className="w-full" defaultValue="john.doe@scingular.com" />
                        </div>
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="bio">Professional Bio</Label>
                        <p className="text-sm text-muted-foreground -mt-1">A short summary of your experience. This appears on your public profile.</p>
                        <Textarea id="bio" defaultValue={user.bio} placeholder="Tell us about your experience, specialties, and what makes you a great inspector." />
                    </div>
                    <Separator />
                    <div className="grid gap-6">
                        <h4 className="text-lg font-semibold">Website & Socials</h4>
                        <p className="text-sm text-muted-foreground -mt-5">Link to your professional presence on the web.</p>
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
                        <p className="text-sm text-muted-foreground -mt-1">For verification, please upload a clear, forward-facing photo of yourself. This helps build trust in the marketplace.</p>
                        <Input id="profile-picture" type="file" accept="image/*" />
                    </div>
                </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                <Button>Save Profile</Button>
                </CardFooter>
            </Card>
            </TabsContent>
            <TabsContent value="credentials">
                <Card className="bg-card/60 backdrop-blur-sm">
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
                            <Link href="/workstation/certifications/add">
                                <PlusCircle className="mr-2 h-4 w-4" />Add Credential
                            </Link>
                        </Button>
                        <p className="text-xs text-muted-foreground ml-auto">*Verification may take 24-48 hours.</p>
                    </CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value="keys">
                <Card className="bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <KeyRound className="h-6 w-6 text-primary" />
                            <CardTitle>API &amp; Device Keys</CardTitle>
                        </div>
                        <CardDescription>
                            Manage the keys used by devices and services to interact with the LARI engine.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Key Name</TableHead>
                                    <TableHead>LARI Sub-Engine</TableHead>
                                    <TableHead>Entitlement</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockKeys.map(key => (
                                     <TableRow key={key.id} className="cursor-pointer">
                                        <TableCell className="font-medium">
                                          <Link href={`/workstation/keys/${key.id}`} className="hover:underline">
                                            {key.name}
                                             <div className="text-xs text-muted-foreground font-mono">{key.id}</div>
                                          </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{key.lariEngine}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={key.entitlement === 'Pro' || key.entitlement === 'Enterprise' || key.entitlement === 'MAX' ? 'pro' : 'secondary'}>{key.entitlement}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={key.status === 'Active' ? "default" : 'secondary'}>{key.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="border-t pt-6">
                       <Button asChild size="sm" variant="outline" className="h-8 gap-1">
                           <Link href="/finances">
                                <PlusCircle className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Purchase New Key
                                </span>
                           </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value="templates">
                <Card className="bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Template Builder</CardTitle>
                        <CardDescription>
                            Create and manage your personalized inspection templates for data collection and reports.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Template Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Last Modified</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockTemplates.map(template => (
                                    <TableRow key={template.id}>
                                        <TableCell className="font-medium">{template.name}</TableCell>
                                        <TableCell>{template.description}</TableCell>
                                        <TableCell>{template.date}</TableCell>
                                        <TableCell className="text-right">
                                             <Button size="sm" variant="outline">Edit</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="border-t p-6">
                        <Button><PlusCircle className="mr-2 h-4 w-4" />Create New Template</Button>
                    </CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value="integrations">
                <Card className="bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>App Integrations</CardTitle>
                        <CardDescription>Connect your external accounts to sync data with Scingular.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div>
                            <h4 className="text-lg font-semibold">Calendar Sync</h4>
                            <p className="text-sm text-muted-foreground">Sync your inspection schedule with your preferred calendar.</p>
                            <div className="grid gap-4 mt-4">
                                <div className="border rounded-lg p-4 flex items-center">
                                    <Calendar className="h-6 w-6 mr-4 text-muted-foreground" />
                                    <div className="flex-1">
                                        <p className="font-medium">Google Calendar</p>
                                        <p className="text-sm text-muted-foreground">Connected as john.doe@gmail.com</p>
                                    </div>
                                    <Button variant="destructive" size="sm">Disconnect</Button>
                                </div>
                                 <div className="border rounded-lg p-4 flex items-center">
                                    <Calendar className="h-6 w-6 mr-4 text-muted-foreground" />
                                    <div className="flex-1">
                                        <p className="font-medium">Microsoft Outlook</p>
                                        <p className="text-sm text-muted-foreground">Sync your events and availability.</p>
                                    </div>
                                    <Button variant="outline" size="sm">Connect</Button>
                                </div>
                                <div className="border rounded-lg p-4 flex items-center">
                                    <Calendar className="h-6 w-6 mr-4 text-muted-foreground" />
                                    <div className="flex-1">
                                        <p className="font-medium">Apple Calendar</p>
                                        <p className="text-sm text-muted-foreground">Sync via a secure iCal link.</p>
                                    </div>
                                    <Button variant="outline" size="sm">Connect</Button>
                                </div>
                            </div>
                        </div>
                         <Separator />
                         <div>
                            <h4 className="text-lg font-semibold">Other Connections</h4>
                            <p className="text-sm text-muted-foreground">Connect other tools to expand your workflow.</p>
                             <div className="grid gap-4 mt-4">
                                <div className="border rounded-lg p-4 flex items-center">
                                    <Calendar className="h-6 w-6 mr-4 text-muted-foreground" />
                                    <div className="flex-1">
                                        <p className="font-medium">Import via ICS Link</p>
                                        <p className="text-sm text-muted-foreground">Connect any calendar that provides a public or private .ics URL.</p>
                                    </div>
                                    <Button variant="outline" size="sm">Connect</Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="security">
                <Card className="bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Login & Security</CardTitle>
                        <CardDescription>
                        Manage your password and two-factor authentication.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid gap-3">
                            <Label htmlFor="email-sec">Email</Label>
                            <p className="text-sm text-muted-foreground -mt-1">This is the email address associated with your account.</p>
                            <Input id="email-sec" type="email" className="w-full" defaultValue="john.doe@scingular.com" disabled />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Password</p>
                                <p className="text-sm text-muted-foreground">It's a good practice to use a strong, unique password.</p>
                            </div>
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
            </TabsContent>
            <TabsContent value="ai">
                <Card className="bg-card/60 backdrop-blur-sm">
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
                        <p className="text-sm text-muted-foreground -mt-1">Select the audio device for voice commands.</p>
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
                             <p className="text-sm text-muted-foreground -mt-5">Manage how Scing connects to networks.</p>
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
                        <p className="text-sm text-muted-foreground -mt-1">Choose the voice for Scing's audio feedback.</p>
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
                        <p className="text-sm text-muted-foreground -mt-1">Adjust how sensitive the voice recognition is to your commands.</p>
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
            <TabsContent value="marketplace">
            <div className="grid gap-6">
                <Card className="bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Live Status & Updates</CardTitle>
                        <CardDescription>Control your real-time visibility and job alert preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                            <h4 className="font-medium">Available for Dispatch</h4>
                            <p className="text-sm text-muted-foreground">
                                Enable this to appear as 'On-Call' and available for immediate dispatch requests.
                            </p>
                            </div>
                            <Switch defaultChecked={user.onCall} />
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                            <h4 className="font-medium">Enable real-time location updates</h4>
                            <p className="text-sm text-muted-foreground">
                                Allow Scing to periodically update your location for more accurate local job matching.
                            </p>
                            </div>
                            <Switch />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="marketplace-notifications">Marketplace Notification Urgency</Label>
                            <p className="text-sm text-muted-foreground -mt-1">How often do you want to be notified about new jobs?</p>
                            <Select defaultValue="instant">
                                <SelectTrigger id="marketplace-notifications">
                                    <SelectValue placeholder="Select notification preference" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="instant">Instant: For all jobs in my area</SelectItem>
                                    <SelectItem value="relevant">Relevant: Only for jobs matching my skills</SelectItem>
                                    <SelectItem value="digest">Daily Digest: A summary of available jobs</SelectItem>
                                    <SelectItem value="none">I will check the marketplace manually</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
                 <Card className="bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Service Area & Zones</CardTitle>
                        <CardDescription>Define your geographical work zones to get relevant job requests.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid gap-3">
                            <Label htmlFor="primary-location">Primary Location / Home Base</Label>
                            <p className="text-sm text-muted-foreground -mt-1">The central point of your service area.</p>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="primary-location" defaultValue="Anytown, CA" className="pl-9" />
                            </div>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="service-radius">Service Radius: 50 miles</Label>
                             <p className="text-sm text-muted-foreground -mt-1">The maximum distance you're willing to travel from your primary location.</p>
                             <Slider id="service-radius" defaultValue={[50]} max={100} step={5} />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>5 mi</span>
                                <span>100 mi</span>
                            </div>
                        </div>
                         <div className="grid gap-3">
                            <Label>Custom Zones</Label>
                             <p className="text-sm text-muted-foreground -mt-1">Define specific counties, cities, or ZIP codes you serve.</p>
                            <div className="flex flex-wrap gap-2">
                               <Badge variant="secondary">Someville County</Badge>
                               <Badge variant="secondary">Zip: 90210-90214</Badge>
                            </div>
                            <Button variant="outline" size="sm" className="w-fit"><PlusCircle className="mr-2 h-4 w-4" /> Add Custom Zone</Button>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Service Offerings</CardTitle>
                        <CardDescription>
                            Select the specific inspection types you are certified and willing to perform from the marketplace.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search inspection types..." className="pl-9 rounded-full" />
                        </div>
                        <Accordion type="multiple" className="w-full">
                            {inspectionData.inspectionTypeCategories.map(category => (
                                <AccordionItem value={category.id} key={category.id}>
                                    <AccordionTrigger>{category.name}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 p-2">
                                            {category.types.map(type => (
                                                 <div key={type} className="flex items-center space-x-2">
                                                    <Checkbox id={`service-${type}`} defaultChecked={user.offeredServices.includes(type)} />
                                                    <Label htmlFor={`service-${type}`} className="font-normal text-sm leading-snug">{type}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                     <CardFooter className="border-t px-6 py-4">
                        <Button>Save Marketplace Settings</Button>
                    </CardFooter>
                </Card>
            </div>
            </TabsContent>
            <TabsContent value="devices">
                <Card className="bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Cpu className="h-6 w-6 text-primary" />
                            <CardTitle>Device Lab</CardTitle>
                        </div>
                        <CardDescription>
                            Manage, calibrate, and fine-tune your connected hardware and AI interfaces outside of active inspections.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card className="flex flex-col bg-card/60 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center gap-4 pb-4">
                                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-muted text-primary">
                                    <Eye className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">LARI-VISION Lab</CardTitle>
                                    <CardDescription>AI Image Analysis</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-2">
                                <p className="text-xs text-muted-foreground">Direct interface to the LARI-VISION sub-engine for visual data processing.</p>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href="/workstation/vision">Launch Interface</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                        {mockDevices.map(device => (
                            <Card key={device.id} className="flex flex-col bg-card/60 backdrop-blur-sm">
                                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-muted text-primary">
                                        <Cpu className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{device.name}</CardTitle>
                                        <CardDescription>{device.type.replace('Key-','')}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-2">
                                    <div className="flex items-center text-sm">
                                        <Badge variant={device.status === 'Connected' ? "default" : 'secondary'}>{device.status}</Badge>
                                        <p className="ml-auto text-xs text-muted-foreground">FW: {device.firmwareVersion}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Last seen: {device.lastSeen}</p>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild className="w-full">
                                        <Link href={`/workstation/devices/${device.id}`}>Tune & Calibrate</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </CardContent>
                    <CardFooter className="border-t pt-6">
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
                    <Card className="bg-card/60 backdrop-blur-sm">
                        <CardHeader>
                        <CardTitle>General Application Settings</CardTitle>
                        <CardDescription>
                            Manage general application preferences.
                        </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                           <WorkstationTimeFormatSwitch />
                           <WorkstationLocationSettings />
                        </CardContent>
                    </Card>
                    <Card className="bg-card/60 backdrop-blur-sm">
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
                    <Card className="bg-card/60 backdrop-blur-sm">
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
                    <Card className="bg-card/60 backdrop-blur-sm">
                        <CardHeader>
                        <CardTitle>API Keys & Environment</CardTitle>
                        <CardDescription>
                            A list of all API keys currently configured for your application. For security, some values are truncated.
                        </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Key</TableHead>
                                        <TableHead>Value</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {envVars.map((envVar) => (
                                        <TableRow key={envVar.key}>
                                            <TableCell className="font-mono text-xs">{envVar.key}</TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">{envVar.value}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
