
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUploadZone } from '@/components/vision/ImageUploadZone';
import { AnalysisControls } from '@/components/vision/AnalysisControls';
import { FindingsDisplay } from '@/components/vision/FindingsDisplay';
import type { VisionAnalysisOptions, VisionFinding } from '@/lib/vision-data';
import { mockVisionAnalysis } from '@/lib/vision-data';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, Database, Camera, Video, AlertTriangle, Monitor, Sparkles, Mic, Search, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { MetadataDisplay } from '@/components/vision/MetadataDisplay';
import { CameraControls } from '@/components/vision/CameraControls';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

export default function LariVisionPage() {
  const [image, setImage] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any | null>(null);
  const [analysisOptions, setAnalysisOptions] = useState<VisionAnalysisOptions>({
    detectCracks: true,
    detectCorrosion: true,
    detectSpalling: false,
    ocr: true,
    showConfidence: true,
  });
  const [findings, setFindings] = useState<VisionFinding[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { toast } = useToast();

  const getCameraPermission = useCallback(async (showAlerts = true) => {
    try {
      // Get permission and initial stream
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      
      // Enumerate devices
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
       // Stop the initial stream, the effect for selectedDeviceId will start the correct one
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      if (showAlerts) {
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
          });
      }
    }
  }, [toast, selectedDeviceId]);

   useEffect(() => {
    // Check for permission silently on load
    getCameraPermission(false);
  }, [getCameraPermission]);

  useEffect(() => {
    if (selectedDeviceId && hasCameraPermission) {
      let stream: MediaStream;
      const startStream = async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { deviceId: { exact: selectedDeviceId } } 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error("Error starting selected camera stream:", error);
            toast({
                variant: "destructive",
                title: "Failed to Start Camera",
                description: "Could not start the selected camera. It might be in use by another application."
            })
        }
      };
      startStream();

      return () => {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      };
    }
  }, [selectedDeviceId, hasCameraPermission, toast]);


  const handleImageProcessed = ({ imageBase64, metadata }: { imageBase64: string, metadata: any }) => {
    setImage(imageBase64);
    setMetadata(metadata);
  };
  
  const handleAnalyze = async () => {
    if (!image) {
      toast({
        variant: 'destructive',
        title: 'No Image Selected',
        description: 'Please upload or capture an image before running the analysis.',
      });
      return;
    }
    setIsLoading(true);
    setFindings(null);

    console.log("Starting analysis with options:", analysisOptions);
    console.log("Image metadata:", metadata);
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const mockResults = mockVisionAnalysis(analysisOptions);
    setFindings(mockResults);

    setIsLoading(false);
    toast({
      title: 'Analysis Complete',
      description: `LARI-VISION identified ${mockResults.length} potential findings.`,
    });
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUri = canvas.toDataURL('image/png');
            handleImageProcessed({ imageBase64: dataUri, metadata: { source: 'Live Capture', device: selectedDeviceId } });
            toast({
              title: "Image Captured",
              description: "The current frame has been captured and is ready for analysis."
            })
        }
    }
  };

  const handleReset = () => {
    setImage(null);
    setFindings(null);
    setMetadata(null);
    setIsLoading(false);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">LARI-VISION Lab</h1>
          <p className="text-muted-foreground max-w-3xl mt-1">
            The direct interface to the LARI-VISION sub-engine. Upload an image, configure analysis parameters, and receive structured, actionable insights from the AI.
          </p>
        </div>
        
         <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Scing Vision Search: Describe a visual anomaly to find in archives (e.g., 'hairline cracks on concrete, last 30 days')..."
            className="w-full rounded-full bg-card/60 backdrop-blur-sm pl-12 h-12 text-base"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                <Mic className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">Use voice command</span>
              </Button>
              <Button type="button" size="icon" className="h-8 w-8 rounded-full">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start">
          <div className="space-y-8">
            <Card className="bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Video className="h-5 w-5"/> Live Capture & Input</CardTitle>
                <CardDescription>Capture an image from a connected device or upload a file.</CardDescription>
              </CardHeader>
              <CardContent>
                {hasCameraPermission === false ? (
                     <div className="p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center">
                        <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
                        <h3 className="font-semibold">Camera Access Required</h3>
                        <p className="text-sm text-muted-foreground mt-2 mb-4">To use the live capture feature, SCINGULAR needs permission to access your camera.</p>
                        <Button onClick={() => getCameraPermission(true)}>
                           <Wifi className="mr-2 h-4 w-4" /> Grant Permission
                        </Button>
                    </div>
                ) : hasCameraPermission === null ? (
                    <div className="flex items-center justify-center h-48 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin mr-2"/>
                        Initializing camera...
                    </div>
                ): (
                   <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden border">
                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                   </div>
                )}
                <Separator className="my-4" />
                <ImageUploadZone onImageProcessed={handleImageProcessed} onReset={handleReset} currentImage={image} />
                <canvas ref={canvasRef} className="hidden" />
              </CardContent>
            </Card>
            
            {image && (
                <Card className="bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5"/> Analysis Results</CardTitle>
                        <CardDescription>
                            {isLoading ? 'The AI is analyzing your image...' : findings ? 'Review the findings identified by LARI-VISION. Click on a finding to highlight it.' : 'Analysis complete. No findings to display based on current criteria.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <FindingsDisplay image={image} findings={findings} isLoading={isLoading} />
                    </CardContent>
                </Card>
            )}
          </div>
          
          <div className="sticky top-20 space-y-8">
            <Card className="bg-card/60 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Monitor className="h-5 w-5"/> Device & Capture Controls</CardTitle>
                </CardHeader>
                <CardContent>
                    <CameraControls 
                        devices={devices}
                        selectedDeviceId={selectedDeviceId}
                        onDeviceChange={setSelectedDeviceId}
                        onCapture={handleCapture}
                        onConnect={() => getCameraPermission(true)}
                        hasPermission={!!hasCameraPermission}
                        disabled={isLoading}
                    />
                </CardContent>
            </Card>
            
             <Card className="bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Analysis Controls</CardTitle>
                <CardDescription>Configure the LARI-VISION parameters.</CardDescription>
              </CardHeader>
              <CardContent>
                <AnalysisControls
                  options={analysisOptions}
                  onOptionChange={setAnalysisOptions}
                  disabled={isLoading || !!findings}
                />
              </CardContent>
              <Separator />
               <CardContent className="py-6">
                <Button onClick={handleAnalyze} disabled={!image || isLoading || !!findings} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Analyze Image
                    </>
                  )}
                </Button>
                 {findings && (
                    <Button onClick={handleReset} variant="outline" className="w-full mt-2">
                        Analyze Another Image
                    </Button>
                 )}
              </CardContent>
            </Card>

            {metadata && (
              <Card className="bg-card/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5"/> Photo Metadata</CardTitle>
                  <CardDescription>Extracted EXIF data from the uploaded image.</CardDescription>
                </CardHeader>
                <CardContent>
                  <MetadataDisplay metadata={metadata} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
