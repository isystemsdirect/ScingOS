
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF, WeatherLayer, CloudLayer } from '@react-google-maps/api';
import type { Inspector, Client } from '@/lib/types';
import { Loader2, AlertTriangle, Map, Satellite, Layers, Cloud, Wind } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

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
          "stylers": [{ "color": "#242f3e" }]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [{ "color": "#746855" }]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [{ "color": "#242f3e" }]
        },
        {
          "featureType": "administrative.locality",
          "elementType": "labels.text.fill",
          "stylers": [{ "color": "#d59563" }]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.fill",
          "stylers": [{ "color": "#d59563" }]
        },
        {
          "featureType": "poi.park",
          "elementType": "geometry",
          "stylers": [{ "color": "#263c3f" }]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.fill",
          "stylers": [{ "color": "#6b9a76" }]
        },
        {
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [{ "color": "#38414e" }]
        },
        {
          "featureType": "road",
          "elementType": "geometry.stroke",
          "stylers": [{ "color": "#212a37" }]
        },
        {
          "featureType": "road",
          "elementType": "labels.text.fill",
          "stylers": [{ "color": "#9ca5b3" }]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry",
          "stylers": [{ "color": "#746855" }]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry.stroke",
          "stylers": [{ "color": "#1f2835" }]
        },
        {
          "featureType": "road.highway",
          "elementType": "labels.text.fill",
          "stylers": [{ "color": "#f3d19c" }]
        },
        {
          "featureType": "transit",
          "elementType": "geometry",
          "stylers": [{ "color": "#2f3948" }]
        },
        {
          "featureType": "transit.station",
          "elementType": "labels.text.fill",
          "stylers": [{ "color": "#d59563" }]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [{ "color": "#17263c" }]
        },
        {
          "featureType": "water",
          "elementType": "labels.text.fill",
          "stylers": [{ "color": "#515c6d" }]
        },
        {
          "featureType": "water",
          "elementType": "labels.text.stroke",
          "stylers": [{ "color": "#17263c" }]
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
    libraries: ['places', 'weather'],
    preventGoogleFontsLoading: true,
    googleMapsScriptBaseUrl: isApiKeyMissing ? '' : undefined,
  });

  const [map, setMap] = useState(null)
  const [center, setCenter] = useState(initialCenter);
  const [zoom, setZoom] = useState(10);
  const [activeInspector, setActiveInspector] = useState<Inspector | null>(null);
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [activeWeatherLayer, setActiveWeatherLayer] = useState<string | null>(null);
  const [mapTypeId, setMapTypeId] = useState('roadmap');

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
          options={{...mapOptions, mapTypeId}}
          onLoad={onLoad}
        >
            {activeWeatherLayer === 'precipitation' && <WeatherLayer />}
            {activeWeatherLayer === 'clouds' && <CloudLayer />}

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
        <TooltipProvider>
            <div className="absolute top-2 right-2 flex flex-col gap-2">
                 <Tooltip>
                    <TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => setMapTypeId(mapTypeId === 'roadmap' ? 'satellite' : 'roadmap')}><Layers className="h-4 w-4"/></Button></TooltipTrigger>
                    <TooltipContent><p>Toggle Map Type</p></TooltipContent>
                 </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => setActiveWeatherLayer(activeWeatherLayer === 'precipitation' ? null : 'precipitation')}><Cloud className="h-4 w-4"/></Button></TooltipTrigger>
                    <TooltipContent><p>Toggle Precipitation</p></TooltipContent>
                 </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => setActiveWeatherLayer(activeWeatherLayer === 'clouds' ? null : 'clouds')}><Cloud className="h-4 w-4"/></Button></TooltipTrigger>
                    <TooltipContent><p>Toggle Cloud Cover</p></TooltipContent>
                 </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => setActiveWeatherLayer(activeWeatherLayer === 'wind' ? null : 'wind')}><Wind className="h-4 w-4"/></Button></TooltipTrigger>
                    <TooltipContent><p>Toggle Wind Speed</p></TooltipContent>
                 </Tooltip>
            </div>
        </TooltipProvider>
      </div>
  )
}
