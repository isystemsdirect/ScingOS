
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import type { Inspector, Client } from '@/lib/types';
import { Loader2, Briefcase, Building, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const initialCenter = {
  lat: 34.0522,
  lng: -118.2437
};

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    scrollwheel: true,
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
  const router = useRouter();
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey,
  });

  const [center, setCenter] = useState(initialCenter);
  const [zoom, setZoom] = useState(10);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setZoom(12);
        },
        () => {
          console.log("Geolocation permission denied. Using default location.");
        }
      );
    }
  }, []);

  if (loadError) {
    return (
        <div className="flex items-center justify-center h-full w-full bg-muted p-4">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Could Not Load Map</AlertTitle>
                <AlertDescription>
                    There was an error loading the Google Maps script. This may be due to an invalid API key or network issue.
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
        zoom={zoom}
        options={mapOptions}
      >
        {inspectors.map(inspector => (
            <MarkerF 
                key={`inspector-${inspector.id}`} 
                position={inspector.location}
                icon={{
                    path: 'M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4z',
                    fillColor: '#00A9FF',
                    fillOpacity: 1,
                    strokeWeight: 0,
                    scale: 1,
                    anchor: new window.google.maps.Point(12, 12),
                }}
                onClick={() => router.push(`/teams/${inspector.id}/availability`)}
            />
        ))}
        {clients.map(client => (
             <MarkerF 
                key={`client-${client.id}`}
                position={client.location}
                icon={{
                    path: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z',
                    fillColor: '#33FFDD',
                    fillOpacity: 1,
                    strokeWeight: 0,
                    scale: 1,
                    anchor: new window.google.maps.Point(12, 12),
                }}
                onClick={() => router.push(`/clients/${client.id}`)}
            />
        ))}
      </GoogleMap>
  )
}
