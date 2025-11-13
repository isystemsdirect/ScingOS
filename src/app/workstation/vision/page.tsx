
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUploadZone } from '@/components/vision/ImageUploadZone';
import { AnalysisControls } from '@/components/vision/AnalysisControls';
import { FindingsDisplay } from '@/components/vision/FindingsDisplay';
import type { VisionAnalysisOptions, VisionFinding } from '@/lib/vision-data';
import { mockVisionAnalysis } from '@/lib/vision-data';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function LariVisionPage() {
  const [image, setImage] = useState<string | null>(null);
  const [analysisOptions, setAnalysisOptions] = useState<VisionAnalysisOptions>({
    detectCracks: true,
    detectCorrosion: true,
    detectSpalling: false,
    ocr: true,
    showConfidence: true,
  });
  const [findings, setFindings] = useState<VisionFinding[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!image) {
      toast({
        variant: 'destructive',
        title: 'No Image Selected',
        description: 'Please upload an image before running the analysis.',
      });
      return;
    }
    setIsLoading(true);
    setFindings(null);

    // Simulate API call to LARI-VISION
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // In a real app, this would be an API call:
    // const results = await fetch('/api/analyze-image', { ... });
    const mockResults = mockVisionAnalysis(analysisOptions);
    setFindings(mockResults);

    setIsLoading(false);
    toast({
      title: 'Analysis Complete',
      description: `LARI-VISION identified ${mockResults.length} potential findings.`,
    });
  };

  const handleReset = () => {
    setImage(null);
    setFindings(null);
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start">
          <div className="space-y-8">
            <Card className="bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Image Analysis</CardTitle>
                <CardDescription>Upload an image to begin the analysis process.</CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploadZone onImageSelect={setImage} onReset={handleReset} currentImage={image} />
              </CardContent>
            </Card>
            
            {image && (
                <Card className="bg-card/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Analysis Results</CardTitle>
                        <CardDescription>
                            {isLoading ? 'The AI is analyzing your image...' : 'Review the findings identified by LARI-VISION. Click on a finding to highlight it.'}
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
          </div>
        </div>
      </div>
    </div>
  );
}
