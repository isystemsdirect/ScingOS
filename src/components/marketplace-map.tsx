'use client'

import React, { useCallback, useState } from 'react'
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindow } from '@react-google-maps/api';
import type { Inspector, Client } from '@/lib/types';
import { Loader2, Briefcase, Building, AlertTriangle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 34.0522,
  lng: -118.2437
};

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
        {
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#1d2c4d"
            }
          ]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#8ec3b9"
            }
          ]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#1a3646"
            }
          ]
        },
        {
          "featureType": "administrative.country",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#4b6878"
            }
          ]
        },
        {
          "featureType": "administrative.land_parcel",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#64779e"
            }
          ]
        },
        {
          "featureType": "administrative.province",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#4b6878"
            }
          ]
        },
        {
          "featureType": "landscape.man_made",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#334e87"
            }
          ]
        },
        {
          "featureType": "landscape.natural",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#023e58"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#283d6a"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#6f9ba5"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#1d2c4d"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#023e58"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#3C7680"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#304a7d"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#98a5be"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#1d2c4d"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#2c6675"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#255763"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#b0d5ce"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#023e58"
            }
          ]
        },
        {
          "featureType": "transit",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#98a5be"
            }
          ]
        },
        {
          "featureType": "transit",
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#1d2c4d"
            }
          ]
        },
        {
          "featureType": "transit.line",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#283d6a"
            }
          ]
        },
        {
          "featureType": "transit.station",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#3a4762"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#0e1626"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#4e6d70"
            }
          ]
        }
      ]
};

interface MarketplaceMapProps {
    inspectors: Inspector[];
    clients: Client[];
}

export function MarketplaceMap({ inspectors, clients }: MarketplaceMapProps) {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey
  });

  const [selected, setSelected] = useState<Inspector | Client | null>(null);

  if (!googleMapsApiKey) {
    return (
        <div className="flex items-center justify-center h-full w-full bg-muted p-4">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Google Maps API Key Missing</AlertTitle>
                <AlertDescription>
                    To display the map, you need to provide a Google Maps API key. Please add your key to the `.env` file as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
                </AlertDescription>
            </Alert>
        </div>
    )
  }

  if (!isLoaded) return <div className="flex items-center justify-center h-full w-full bg-muted"><Loader2 className="h-8 w-8 animate-spin"/></div>

  return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        options={mapOptions}
      >
        {inspectors.map(inspector => (
            <MarkerF 
                key={`inspector-${inspector.id}`} 
                position={inspector.location}
                icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: 'hsl(var(--primary))',
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: 'hsl(var(--primary-foreground))'
                }}
                onClick={() => setSelected(inspector)}
            />
        ))}
        {clients.map(client => (
             <MarkerF 
                key={`client-${client.id}`} 
                position={client.location}
                icon={{
                    path: 'M 0,0 -5,-5 -5,-10 5,-10 5,-5 z',
                    fillColor: 'hsl(var(--secondary-foreground))',
                    fillOpacity: 1,
                    strokeWeight: 1,
                    strokeColor: 'hsl(var(--background))',
                    scale: 1.5,
                    anchor: new google.maps.Point(0, 0),
                }}
                onClick={() => setSelected(client)}
            />
        ))}
        {selected && (
            <InfoWindow
                position={'location' in selected ? selected.location : {lat: 0, lng: 0}}
                onCloseClick={() => setSelected(null)}
            >
                <div className="p-2 max-w-xs">
                    {'rating' in selected ? ( // It's an Inspector
                        <>
                           <h3 className="font-bold text-lg flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" />{selected.name}</h3>
                           <div className="text-sm my-2">
                               <Badge variant={selected.onCall ? 'default' : 'secondary'}>{selected.onCall ? 'On-Call' : 'Unavailable'}</Badge>
                                <p className="mt-1">Rating: {selected.rating} ({selected.reviews} reviews)</p>
                           </div>
                           <Button asChild size="sm">
                               <Link href={`/teams/${selected.id}/availability`}>View Profile</Link>
                           </Button>
                        </>
                    ) : ( // It's a Client
                        <>
                            <h3 className="font-bold text-lg flex items-center gap-2"><Building className="h-4 w-4 text-primary" />{selected.name}</h3>
                            <div className="text-sm my-2 text-muted-foreground">
                                <p>{selected.address.street}</p>
                                <p>{selected.address.city}, {selected.address.state}</p>
                            </div>
                            <Button asChild size="sm">
                               <Link href={`/clients/${selected.id}`}>View Details</Link>
                           </Button>
                        </>
                    )}
                </div>
            </InfoWindow>
        )}
      </GoogleMap>
  )
}
