

import Image from "next/image"
import { ListFilter, MapPin, Search, Star, ShieldCheck } from "lucide-react"

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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { mockInspectors } from "@/lib/data"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export default function MarketplacePage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Inspector Marketplace</h1>
            <p className="text-muted-foreground">
              Find and dispatch certified inspectors in your area.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  Available Now
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Top Rated</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  InterNACHI Certified
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, location, or certification..."
            className="w-full rounded-md bg-card pl-9"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockInspectors.map((inspector) => {
            const avatar = PlaceHolderImages.find(p => p.id === inspector.imageHint);
            return (
              <Card key={inspector.id} className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="flex flex-row items-start gap-4 p-4 bg-muted/20">
                  {avatar && (
                    <Image
                      src={avatar.imageUrl}
                      alt={inspector.name}
                      width={80}
                      height={80}
                      className="rounded-full border-4 border-background"
                      data-ai-hint={avatar.imageHint}
                    />
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-xl">{inspector.name}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span>{inspector.rating}</span>
                      <span>({inspector.reviews} reviews)</span>
                    </div>
                     <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4" />
                      <span>{inspector.location}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="font-semibold text-sm mb-2">Certifications</p>
                  <div className="flex flex-wrap gap-2">
                    {inspector.certifications.map((cert) => (
                      <Badge key={cert.id} variant="secondary" className="gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        {cert.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full">
                    {inspector.onCall ? "Dispatch Now" : "Request Booking"}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
