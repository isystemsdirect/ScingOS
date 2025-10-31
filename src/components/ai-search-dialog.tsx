
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Loader2, FileText, Bot, Mic, Camera, X } from 'lucide-react';
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
} from '@/ai/flows/lari-compliance';
import { processVoiceCommand } from '@/ai/flows/lari-scing-bridge';
import { textToSpeech } from '@/ai/flows/lari-narrator';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { mockSubscriptionPlans } from '@/lib/data';
import Link from 'next/link';

const searchSchema = z.object({
  query: z.string().min(3, 'Search query must be at least 3 characters.'),
});

type DialogState = 'idle' | 'listening' | 'processing' | 'speaking';

export function AiSearchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CrossCheckStandardsOutput | null>(
    null
  );
  const [isVisualSearchActive, setIsVisualSearchActive] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const [dialogState, setDialogState] = useState<DialogState>('idle');
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);


  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: '',
    },
  });
  
  const currentPlan = mockSubscriptionPlans.find(plan => plan.isCurrent);
  const isProOrEnterprise = currentPlan && (currentPlan.name === 'Pro' || currentPlan.name === 'Enterprise');

  const processAndRespond = useCallback(async (text: string) => {
    setDialogState('processing');
    try {
      // 1. Send transcribed text to LARI to understand intent
      const commandResult = await processVoiceCommand({ command: text });
      
      let responseText = `Understood. Executing action: ${commandResult.action.replace(/_/g, ' ')}.`;

      // Example of handling a specific action - this can be expanded
      // if (commandResult.action === 'get_weather') {
      //   // You would call your weather tool here.
      //   responseText = "Fetching weather for you.";
      // }
      
      // 3. Send the text response to LARI to generate speech
      const { audio } = await textToSpeech(responseText);
      
      // 4. SCING plays the audio response
      const audioEl = new Audio(audio);
      audioEl.onplay = () => setDialogState('speaking');
      audioEl.onended = () => setDialogState('idle');
      audioEl.onerror = (e) => {
        console.error("Audio playback error:", e);
        // Fallback to browser speech if audio fails
        toast({
            variant: "destructive",
            title: "Audio Error",
            description: "Could not play the audio response."
        })
        setDialogState('idle');
      }
      audioEl.play();

    } catch (error) {
      console.error("Error processing command or generating speech:", error);
       toast({
        variant: "destructive",
        title: "Processing Error",
        description: "I'm sorry, I had trouble processing that command."
      });
      setDialogState('idle');
    }
  }, [toast]);


  // Initialize SpeechRecognition
  useEffect(() => {
    // Ensure this runs only in the browser
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      recognition.continuous = false; // Stop after first result
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const currentTranscript = event.results[event.results.length - 1][0].transcript.trim();
        setTranscript(currentTranscript);
        form.setValue('query', currentTranscript);
        processAndRespond(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({
          variant: 'destructive',
          title: 'Speech Recognition Error',
          description: event.error === 'not-allowed' ? 'Microphone access denied.' : `An error occurred: ${event.error}`,
        });
        setDialogState('idle');
      };

      recognition.onend = () => {
         // Only reset state if it was 'listening', to avoid race conditions
         if (dialogState === 'listening') {
          setDialogState('idle');
        }
      };

    }
  }, [toast, form, processAndRespond, dialogState]);
  
  const handleMicClick = () => {
    if (!recognitionRef.current) {
      toast({
        variant: 'destructive',
        title: 'Speech Recognition Not Supported',
        description: 'Your browser does not support this feature.',
      });
      return;
    }

    if (dialogState === 'listening') {
      recognitionRef.current.stop();
      setDialogState('idle');
    } else if (dialogState === 'idle') {
      try {
        recognitionRef.current.start();
        setDialogState('listening');
      } catch (error) {
         console.error("Could not start recognition:", error);
         toast({
          variant: "destructive",
          title: "Could not start listening",
          description: "Microphone might already be in use or is unavailable."
        })
        setDialogState('idle');
      }
    }
  };


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
    setDialogState('idle');
    recognitionRef.current?.stop();
    if(window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
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
  
  const getMicButtonClass = () => {
    switch (dialogState) {
      case 'listening': return 'text-destructive animate-pulse';
      case 'speaking':
      case 'processing': return 'text-accent animate-pulse';
      default: return 'text-muted-foreground';
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-sm text-muted-foreground rounded-md"
        >
          <Search className="mr-2 h-4 w-4" />
          <span>{isProOrEnterprise ? 'Consult Scing Professional' : 'Consult Scing'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {isProOrEnterprise ? 'Scing Pro Search' : 'SCINGULAR AI Search'}
          </DialogTitle>
          <DialogDescription>
            {isVisualSearchActive ? "Position the subject in the frame and capture." : "Cross-check standards, ask questions, or issue voice commands to your AI model."}
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
                       <Loader2 className="h-8 w-8 animate-spin text-accent"/>
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
                            placeholder={isProOrEnterprise ? "Consult Scing Professional" : "Consult Scing."}
                            className={cn("pr-20 rounded-md", capturedImage ? "pl-12" : "pl-9")}
                            {...field}
                          />
                          <div className="absolute right-1 top-1/2 flex -translate-y-1/2">
                             <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => setIsVisualSearchActive(true)}>
                                <Camera className="h-4 w-4 text-muted-foreground" />
                                <span className="sr-only">Use visual search</span>
                            </Button>
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={handleMicClick} disabled={dialogState === 'processing' || dialogState === 'speaking'}>
                                <Mic className={cn("h-4 w-4 transition-colors", getMicButtonClass())} />
                                <span className="sr-only">Use voice command</span>
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading || dialogState !== 'idle'}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Ask'
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
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              )}
              {results && (
                 <div className="max-h-[50vh] overflow-y-auto pr-4 space-y-4">
                  {results.codeCitations && results.codeCitations.length > 0 ? (
                    results.codeCitations.map((citation, index) => (
                      <div key={index} className="rounded-lg border p-4">
                        <div className="flex items-start gap-3">
                          <Bot className="h-6 w-6 text-accent flex-shrink-0" />
                          <div>
                            <p className="font-semibold">{citation}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {results.excerpts[index]}
                            </p>
                            <Link href={results.fullDocLinks[index] || '#'} target="_blank" className="text-xs text-accent hover:underline mt-2 inline-block">
                              View Full Document ({results.jurisdictions[index]})
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-8 border rounded-lg">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Results Found</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          The AI couldn't find any matching standards for your query. Try rephrasing your search or uploading more documents to your library.
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
