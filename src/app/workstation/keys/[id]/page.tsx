
'use client';
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  ChevronLeft,
  KeyRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function KeyManagementPage() {
  const params = useParams<{ id: string }>();
  
  if (!params.id) {
    notFound();
  }
  
  const keyDetails: {[key: string]: {name: string, description: string, capabilities: {[key: string]: string}}} = {
    'key_vision_std_abc123': {
        name: "LARI-VISION",
        description: "Image/Video/CCTV/Drone/Direct Visual",
        capabilities: {
            "Construction": "Facade, roof, bridge, tunnel, elevator, crane, traffic, site safety",
            "Energy": "Solar array, wind turbine, substation, oil/gas tanks/platforms, nuclear visual checks",
            "Water": "Tank/reservoir, pump station, canal, dam",
            "Transportation": "Vehicle, rail rolling stock, cargo bay, road surface, airport field marking",
            "Manufacturing": "Packed goods, batch output, label and packaging checks, cleanroom monitoring",
            "Healthcare": "Medical device surface, internal endoscopy, facility safety",
            "Agriculture": "Livestock visual, produce grading, storage/warehouse",
            "Environmental": "Landfill, hazardous waste, soil/air visible pollutants"
        }
    }
  }
  
  // A real implementation would fetch this data, for now we just use a placeholder for any non-mapped key.
  const details = keyDetails[params.id] || {
        name: "LARI Engine Key",
        description: "Manages a specific LARI sub-engine.",
        capabilities: {
            "General": "This key enables access to a specialized LARI sub-engine for advanced data processing."
        }
  }


  return (
    <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
      <div className="grid gap-8">
        <div className="flex items-center gap-4">
          <Link href="/workstation?tab=keys">
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back to Workstation</span>
            </Button>
          </Link>
          <div className="h-10 w-10 flex items-center justify-center bg-muted rounded-lg">
              <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            {details.name}
          </h1>
          <Badge variant="secondary" className="font-mono">{params.id}</Badge>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>{details.name}</CardTitle>
                <CardDescription>{details.description}</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm prose-invert max-w-none">
                <h4 className="text-foreground">Industry Applications:</h4>
                <ul>
                    {Object.entries(details.capabilities).map(([industry, uses]) => (
                        <li key={industry}><strong>{industry}:</strong> {uses}</li>
                    ))}
                </ul>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
