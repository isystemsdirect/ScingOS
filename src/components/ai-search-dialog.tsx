
'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Loader2, FileText, ExternalLink, Mic, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  crossCheckStandards,
  type CrossCheckStandardsOutput,
} from '@/ai/flows/cross-check-standards';
import { Progress } from './ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const searchSchema = z.object({
  query: z.string().min(3, 'Search query must be at least 3 characters.'),
});

export function AiSearchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CrossCheckStandardsOutput | null>(
    null
  );
  const [isVisualSearchActive, setIsVisualSearchActive] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);


  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: '',
    },
  });

  useEffect(() => {
    let stream: MediaStream | null = null;
    const getCameraPermission = async () => {
      if (isVisualSearchActive && hasCameraPermission === null) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setHasCameraPermission(true);
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
          });
        }
      }
    }
    getCameraPermission();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if(videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [isVisualSearchActive, hasCameraPermission, toast]);

  const handleMicClick = async () => {
    setIsListening(true);
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Speech recognition logic would go here
        console.log("Microphone access granted");
        toast({
            title: "Microphone Enabled",
            description: "Voice command functionality is ready."
        });
        // For demonstration, stop listening after a few seconds
        setTimeout(() => setIsListening(false), 3000);
    } catch (error) {
        console.error("Error accessing microphone:", error);
        toast({
            variant: "destructive",
            title: "Microphone Access Denied",
            description: "Please enable microphone permissions in your browser settings."
        });
        setIsListening(false);
    }
  };


  async function onSubmit(values: z.infer<typeof searchSchema>) {
    setIsLoading(true);
    setResults(null);
    try {
      // Here you would also pass the capturedImage if it exists
      const searchResults = await crossCheckStandards({
        searchText: values.query,
      });
      setResults(searchResults);
    } catch (error) {
      console.error('AI Search failed:', error);
      toast({
        variant: "destructive",
        title: "Search Failed",
        description: "There was an error processing your search request."
      });
    }
    setIsLoading(false);
    setCapturedImage(null);
    setIsVisualSearchActive(false);
  }

  function handleCapture() {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/png');
        setCapturedImage(dataUri);
        form.setValue('query', 'Visual search from captured image');
        setIsVisualSearchActive(false); // Close camera view after capture
      }
    }
  }

  const resetSearch = () => {
    setCapturedImage(null);
    setResults(null);
    form.reset();
    setIsVisualSearchActive(false);
    setHasCameraPermission(null);
    if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
  }
  
  const handleOpenChange = (open: boolean) => {
    if(!open) {
      resetSearch();
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-sm text-muted-foreground md:w-2/3 lg:w-1/3"
        >
          <Search className="mr-2 h-4 w-4" />
          <span>Consult Scing</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Scingular AI Search</DialogTitle>
          <DialogDescription>
            {isVisualSearchActive ? "Position the subject in the frame and capture." : "Cross-reference your query against a vast library of codes and standards."}
          </DialogDescription>
        </DialogHeader>

        {isVisualSearchActive ? (
          <div className="space-y-4">
             <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
               <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                {hasCameraPermission === false && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                         <Alert variant="destructive">
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                                To use visual search, please allow camera access in your browser settings and refresh the page.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
                {hasCameraPermission === null && !capturedImage && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                       <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                       <p className="mt-2 text-sm text-muted-foreground">Starting camera...</p>
                   </div>
                )}
             </div>
             <canvas ref={canvasRef} className="hidden" />
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => { setIsVisualSearchActive(false); resetSearch(); }}>Cancel</Button>
              <Button onClick={handleCapture} disabled={!hasCameraPermission}>Capture Image</Button>
            </div>
          </div>
        ) : (
          <>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
                <FormField
                  control={form.control}
                  name="query"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative">
                          {capturedImage ? (
                            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md overflow-hidden">
                               <Image src={capturedImage} alt="Captured image" width={28} height={28} />
                            </div>
                          ) : (
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          )}
                          <Input
                            placeholder="Consult Scing."
                            className={cn("pl-8 pr-20", capturedImage && "pl-12")}
                            {...field}
                          />
                          <div className="absolute right-1 top-1/2 flex -translate-y-1/2">
                             <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsVisualSearchActive(true)}>
                                <Camera className="h-4 w-4 text-muted-foreground" />
                                <span className="sr-only">Use visual search</span>
                            </Button>
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleMicClick} disabled={isListening}>
                                <Mic className={cn("h-4 w-4 text-muted-foreground", isListening && "text-primary animate-pulse")} />
                                <span className="sr-only">Use voice command</span>
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Search'
                  )}
                </Button>
                 {capturedImage && (
                    <Button type="button" variant="ghost" size="icon" onClick={resetSearch}><X className="h-4 w-4"/></Button>
                )}
              </form>
            </Form>
            <div className="mt-4 space-y-4">
              {isLoading && (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {results && (
                <div className="max-h-[50vh] overflow-y-auto pr-4">
                  {results.codeCitations?.length > 0 ? (
                    <ul className="space-y-4">
                      {results.codeCitations.map((citation, index) => (
                        <li key={index} className="rounded-lg border p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-primary">
                              {citation}
                            </h4>
                            <span className="text-sm font-medium text-muted-foreground">
                              {results.jurisdictions?.[index]}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground italic">
                            "{results.excerpts?.[index]}"
                          </p>
                          <div className="mt-3 flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Relevance</span>
                                <span>
                                  {((results.relevanceScores?.[index] ?? 0) * 100).toFixed(0)}%
                                </span>
                              </div>
                              <Progress
                                value={(results.relevanceScores?.[index] ?? 0) * 100}
                                className="h-2"
                              />
                            </div>

                            {results.fullDocLinks?.[index] && (
                              <Button asChild size="sm" variant="outline">
                                <a
                                  href={results.fullDocLinks[index]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View Document
                                </a>
                              </Button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center p-8 border rounded-lg">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Results Found</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          The AI couldn't find any matching standards for your query. Try rephrasing your search.
                        </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

    