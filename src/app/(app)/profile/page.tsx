import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mockInspectors } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Briefcase, Calendar, Edit, Mail, MapPin, Phone, Star, ShieldCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const user = mockInspectors[0];
  const avatar = PlaceHolderImages.find((p) => p.id === user.imageHint);

  return (
    <div className="grid max-w-4xl mx-auto gap-8">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          View and manage your public inspector profile.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-[200px_1fr]">
        <div className="flex flex-col items-center gap-4">
          {avatar && (
            <Image
              src={avatar.imageUrl}
              alt={user.name}
              width={160}
              height={160}
              className="rounded-full border-4 border-primary/20 shadow-lg"
              data-ai-hint={avatar.imageHint}
            />
          )}
          <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Change Photo</Button>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <div className="flex-1">
                <CardTitle className="text-4xl">{user.name}</CardTitle>
                <CardDescription className="text-lg">Inspector</CardDescription>
              </div>
              <Button asChild>
                <a href="/settings">Edit Profile</a>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center gap-4 rounded-md border bg-muted/50 p-4">
                <div className="flex flex-1 items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{user.rating}</span>
                    <span className="text-muted-foreground">({user.reviews} reviews)</span>
                </div>
                <div className="flex flex-1 items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{user.location}</span>
                </div>
                 <div className="flex flex-1 items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{user.onCall ? 'On-Call' : 'Unavailable'}</span>
                </div>
            </div>

            <div className="grid gap-4">
                <h3 className="text-xl font-semibold">About Me</h3>
                <p className="text-sm text-muted-foreground">{user.bio}</p>
            </div>
            
            <Separator />

            <div className="grid gap-4">
                <h3 className="text-xl font-semibold">Contact Information</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <span>john.doe@scingular.com</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <span>(555) 123-4567</span>
                    </div>
                     <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <span>Member since: Jan 1, 2023</span>
                    </div>
                </div>
            </div>

            <Separator />

            <div>
                <h3 className="text-xl font-semibold">Certifications</h3>
                <div className="space-y-4 mt-4">
                {user.certifications.map((cert) => (
                    <div key={cert.id} className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">{cert.name}</p>
                            <p className="text-sm text-muted-foreground">
                                ID: {cert.id} {cert.verified && <Badge variant="secondary" className="ml-2">Verified</Badge>}
                            </p>
                            <p className="text-xs text-muted-foreground">Expires: {cert.expiresAt}</p>
                        </div>
                    </div>
                ))}
                </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-xl font-semibold">Active Marketplace Dispatch Fields</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">This is a list of inspection types you have opted-in to for the Marketplace.</p>
              <div className="flex flex-wrap gap-2">
                {user.offeredServices.map((service) => (
                    <Badge key={service} variant="default">{service}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
