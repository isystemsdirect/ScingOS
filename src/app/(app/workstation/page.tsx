

import Link from "next/link"
import { CircleUser, Cpu, Palette, PlusCircle, Trash2, Globe, Linkedin, Facebook, History, Mic, Camera, Sparkles, Database, KeyRound, User, Settings, Store, Bell, SlidersHorizontal, Bot, Wifi, Bluetooth, MapPin, Search } from "lucide-react"

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
    { id: "key_thermal_std_ghi789", name: "Standard Thermal Key", lariEngine: "LARI-THERMAL", entitlement: "Core", status: "Active" },
    { id: "key_audio_std_jkl012", name: "Standard Audio Key", lariEngine: "LARI-AUDIO", entitlement: "Core", status: "Active" },
    { id: "key_dose_pro_def456", name: "Professional Drone Key", lariEngine: "LARI-DOSE", entitlement: "Pro", status: "Active" },
    { id: "key_mapper_ent_ghi789", name: "Enterprise LiDAR Key", lariEngine: "LARI-MAPPER", entitlement: "Enterprise", status: "Inactive" },
    { id: "key_prism_max_jkl012", name: "Max Spectrometer Key", lariEngine: "LARI-PRISM", entitlement: "MAX", status: "Active" },
    { id: "key_sonar_max_mno345", name: "Max Sonar Key", lariEngine: "LARI-SONAR", entitlement: "MAX", status: "Inactive" },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="px-4 lg:px-6 text-3xl font-semibold">Workstation</h1>

      <Tabs defaultValue="profile" className="relative">
        <div className="sticky top-0 z-20 pt-4 -mx-6 px-6 pb-2">
            <TabsList className="grid h-auto w-full grid-cols-1 md:grid-cols-4 lg:grid-cols-8 border p-1 bg-background/95 backdrop-blur-sm">
                <TabsTrigger value="profile" className="py-2"><User className="mr-2 h-4 w-4"/>Profile</TabsTrigger>
                <TabsTrigger value="credentials" className="py-2"><KeyRound className="mr-2 h-4 w-4"/>Credentials</TabsTrigger>
                <TabsTrigger value="security" className="py-2"><User className="mr-2 h-4 w-4"/>Security</TabsTrigger>
                <TabsTrigger value="ai" className="py-2"><Sparkles className="mr-2 h-4 w-4"/>AI & Voice</TabsTrigger>
                <TabsTrigger value="camera" className="py-2"><Camera className="mr-2 h-4 w-4"/>Camera</TabsTrigger>
                <TabsTrigger value="marketplace" className="py-2"><Store className="mr-2 h-4 w-4"/>Marketplace</TabsTrigger>
                <TabsTrigger value="devices" className="py-2"><Cpu className="mr-2 h-4 w-4"/>Device Lab</TabsTrigger>
                <TabsTrigger value="data" className="py-2"><Database className="mr-2 h-4 w-4"/>Data & Privacy</TabsTrigger>
            </TabsList>
        </div>
        <div className={cn("space-y-4 pt-4 px-4 lg:px-6", 
            "[mask-image:linear-gradient(to_bottom,transparent_0,black_2rem,black_100%)]"
        )}>
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
            <TabsContent value="credentials">
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
                            <Link href="/workstation/certifications/add">
                                <PlusCircle className="mr-2 h-4 w-4" />Add Credential
                            </Link>
                        </Button>
                        <p className="text-xs text-muted-foreground ml-auto">*Verification may take 24-48 hours.</p>
                    </CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value="security">
                <Card>
                    <CardHeader>
                        <CardTitle>Login & Security</CardTitle>
                        <CardDescription>
                        Manage your password and two-factor authentication.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid gap-3">
                            <Label htmlFor="email-sec">Email</Label>
                            <Input id="email-sec" type="email" className="w-full" defaultValue="john.doe@scingular.com" disabled />
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
            <div className="grid gap-6">
                <Card>
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
                 <Card>
                    <CardHeader>
                        <CardTitle>Service Area & Zones</CardTitle>
                        <CardDescription>Define your geographical work zones to get relevant job requests.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid gap-4">
                            <Label htmlFor="primary-location">Primary Location / Home Base</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="primary-location" defaultValue="Anytown, CA" className="pl-9" />
                            </div>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="service-radius">Service Radius: 50 miles</Label>
                             <Slider id="service-radius" defaultValue={[50]} max={100} step={5} />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>5 mi</span>
                                <span>100 mi</span>
                            </div>
                        </div>
                         <div className="grid gap-3">
                            <Label>Custom Zones</Label>
                            <div className="flex flex-wrap gap-2">
                               <Badge variant="secondary">Someville County</Badge>
                               <Badge variant="secondary">Zip: 90210-90214</Badge>
                            </div>
                            <Button variant="outline" size="sm" className="w-fit"><PlusCircle className="mr-2 h-4 w-4" /> Add Custom Zone</Button>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Service Offerings</CardTitle>
                        <CardDescription>
                            Select the specific inspection types you are certified and willing to perform from the marketplace.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search inspection types..." className="pl-9" />
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
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mockDevices.map(device => (
                            <Card key={device.id} className="flex flex-col">
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
                                        <Badge variant={device.status === 'Connected' ? 'default' : 'secondary'}>{device.status}</Badge>
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
            <TabsContent value="keys">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <KeyRound className="h-6 w-6 text-primary" />
                            <CardTitle>API & Device Keys</CardTitle>
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
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockKeys.map(key => (
                                    <TableRow key={key.id}>
                                        <TableCell className="font-medium">
                                            {key.name}
                                            <div className="text-xs text-muted-foreground font-mono">{key.id}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{key.lariEngine}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={key.entitlement === 'Pro' || key.entitlement === 'Enterprise' ? 'pro' : 'secondary'}>{key.entitlement}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={key.status === 'Active' ? 'default' : 'secondary'}>{key.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4"/></Button>
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
            <TabsContent value="data">
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>
                            Manage general application preferences.
                        </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                <h4 className="font-medium">Time Format</h4>
                                <p className="text-sm text-muted-foreground">
                                    Choose between standard (12-hour) and military (24-hour) time.
                                </p>
                                </div>
                                <Switch id="time-format-switch" />
                            </div>
                        </CardContent>
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
        </div>
      </Tabs>
    </div>
  )
}
