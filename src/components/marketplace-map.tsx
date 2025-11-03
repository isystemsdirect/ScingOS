
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import type { Inspector, Client } from '@/lib/types';
import { Loader2, AlertTriangle } from 'lucide-react';
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
        "featureType": "all",
        "elementType": "all",
        "stylers": [
          {
            "invert_lightness": true
          },
          {
            "saturation": "-9",
          },
          {
            "lightness": "0",
          },
          {
            "gamma": "0.59",
          },
          {
            "hue": "#000000"
          }
        ]
      },
      {
          "featureType": "all",
          "elementType": "labels.text.fill",
          "stylers": [
              {
                  "color": "#ffffff"
              }
          ]
      },
      {
          "featureType": "all",
          "elementType": "labels.text.stroke",
          "stylers": [
              {
                  "color": "#000000"
              },
              {
                  "lightness": 13
              }
          ]
      },
      {
          "featureType": "administrative",
          "elementType": "geometry.fill",
          "stylers": [
              {
                  "color": "#000000"
              }
          ]
      },
      {
          "featureType": "administrative",
          "elementType": "geometry.stroke",
          "stylers": [
              {
                  "color": "#144b53"
              },
              {
                  "lightness": 14
              },
              {
                  "weight": 1.4
              }
          ]
      },
      {
          "featureType": "landscape",
          "elementType": "all",
          "stylers": [
              {
                  "color": "#08304b"
              }
          ]
      },
      {
          "featureType": "poi",
          "elementType": "geometry",
          "stylers": [
              {
                  "color": "#0c4152"
              },
              {
                  "lightness": 5
              }
          ]
      },
      {
          "featureType": "road.highway",
          "elementType": "geometry.fill",
          "stylers": [
              {
                  "color": "#000000"
              }
          ]
      },
      {
          "featureType": "road.highway",
          "elementType": "geometry.stroke",
          "stylers": [
              {
                  "color": "#0b434f"
              },
              {
                  "lightness": 25
              }
          ]
      },
      {
          "featureType": "road.arterial",
          "elementType": "geometry.fill",
          "stylers": [
              {
                  "color": "#000000"
              }
          ]
      },
      {
          "featureType": "road.arterial",
          "elementType": "geometry.stroke",
          "stylers": [
              {
                  "color": "#0b3d51"
              },
              {
                  "lightness": 16
              }
          ]
      },
      {
          "featureType": "road.local",
          "elementType": "geometry",
          "stylers": [
              {
                  "color": "#000000"
              }
          ]
      },
      {
          "featureType": "transit",
          "elementType": "all",
          "stylers": [
              {
                  "color": "#146474"
              }
          ]
      },
      {
          "featureType": "water",
          "elementType": "all",
          "stylers": [
              {
                  "color": "#021019"
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
  
  const isApiKeyMissing = !googleMapsApiKey || googleMapsApiKey === "YOUR_API_KEY_HERE";

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey,
    libraries: ['places'],
    preventGoogleFontsLoading: true,
    googleMapsScriptBaseUrl: isApiKeyMissing ? '' : undefined, // Prevent loading if key is missing
  });

  const [map, setMap] = useState(null)
  const [center, setCenter] = useState(initialCenter);
  const [zoom, setZoom] = useState(10);
  const [activeInspector, setActiveInspector] = useState<Inspector | null>(null);
  const [activeClient, setActiveClient] = useState<Client | null>(null);

  const onLoad = React.useCallback(function callback(map: any) {
    setMap(map)
  }, [])

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

  if (isApiKeyMissing) {
      return (
          <div className="flex items-center justify-center h-full w-full bg-muted p-4">
              <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Google Maps API Key Missing</AlertTitle>
                  <AlertDescription>
                      Please add your `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to the .env file to enable the map.
                  </AlertDescription>
              </Alert>
          </div>
      )
  }

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
      <div className="relative w-full h-full">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={zoom}
          options={mapOptions}
          onLoad={onLoad}
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
                  onMouseOver={() => setActiveInspector(inspector)}
                  onMouseOut={() => setActiveInspector(null)}
              />
          ))}
          {activeInspector && (
              <InfoWindowF
                  position={activeInspector.location}
                  onCloseClick={() => setActiveInspector(null)}
                  options={{
                      pixelOffset: new window.google.maps.Size(0, -30)
                  }}
              >
                  <div className="p-1 bg-card text-card-foreground rounded-lg shadow-lg">
                      <h4 className="font-bold text-sm">{activeInspector.name}</h4>
                      <p className="text-xs text-muted-foreground">{activeInspector.location.name}</p>
                  </div>
              </InfoWindowF>
          )}

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
                  onMouseOver={() => setActiveClient(client)}
                  onMouseOut={() => setActiveClient(null)}
              />
          ))}
          {activeClient && (
              <InfoWindowF
                  position={activeClient.location}
                  onCloseClick={() => setActiveClient(null)}
                  options={{
                      pixelOffset: new window.google.maps.Size(0, -30)
                  }}
              >
                  <div className="p-1 bg-card text-card-foreground rounded-lg shadow-lg">
                      <h4 className="font-bold text-sm">{activeClient.name}</h4>
                      <p className="text-xs text-muted-foreground">{activeClient.address.street}, {activeClient.address.city}</p>
                  </div>
              </InfoWindowF>
          )}
        </GoogleMap>
      </div>
  )
}
