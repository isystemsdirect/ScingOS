
'use client';

import { useState } from 'react';
import type { Job, Inspector } from '@/lib/types';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Check, User, MapPin, Briefcase, FileText, Search, Users, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';

interface DispatchWizardProps {
  job: Job;
  availableInspectors: Inspector[];
}

export function DispatchWizard({ job, availableInspectors }: DispatchWizardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedInspector, setSelectedInspector] = useState<Inspector | null>(null);
  const [instructions, setInstructions] = useState('');

  const handleNext = () => {
    if (step === 1 && !selectedInspector) {
      toast({
        variant: 'destructive',
        title: 'No Inspector Selected',
        description: 'Please select an inspector to assign to this job.',
      });
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleDispatch = () => {
    // In a real app, you would send this data to your backend
    console.log({
      jobId: job.id,
      inspectorId: selectedInspector?.id,
      instructions,
    });
    toast({
      title: 'Job Dispatched!',
      description: `${job.type} has been assigned to ${selectedInspector?.name}.`,
    });
    setIsOpen(false);
    // Reset state for next time
    setTimeout(() => {
        setStep(1);
        setSelectedInspector(null);
        setInstructions('');
    }, 500);
  };
  
  const getStepClass = (currentStep: number) => {
      if (step > currentStep) return 'bg-primary text-primary-foreground';
      if (step === currentStep) return 'bg-primary/50 border border-primary text-primary-foreground';
      return 'bg-muted text-muted-foreground';
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full">Dispatch</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-card/80 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Dispatch Job: {job.type}</DialogTitle>
          <DialogDescription>Assign this job to an available inspector.</DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-center my-4">
            <div className="flex items-center gap-4 text-xs">
                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center font-bold", getStepClass(1))}>1</div>
                <Separator className="w-16" />
                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center font-bold", getStepClass(2))}>2</div>
                <Separator className="w-16" />
                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center font-bold", getStepClass(3))}>3</div>
            </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h4 className="font-semibold">Step 1: Select Inspector</h4>
             <Tabs defaultValue="team">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="team"><Users className="mr-2 h-4 w-4" />Team</TabsTrigger>
                    <TabsTrigger value="marketplace"><Store className="mr-2 h-4 w-4" />Marketplace</TabsTrigger>
                </TabsList>
                <TabsContent value="team" className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search team members..." className="pl-9" />
                    </div>
                    <div className="max-h-[40vh] overflow-y-auto space-y-3 pr-2">
                      {availableInspectors.map((inspector) => {
                        const avatar = PlaceHolderImages.find((p) => p.id === inspector.imageHint);
                        const isSelected = selectedInspector?.id === inspector.id;
                        return (
                          <div
                            key={inspector.id}
                            onClick={() => setSelectedInspector(inspector)}
                            className={cn(
                              'p-4 rounded-lg border flex items-center gap-4 cursor-pointer transition-colors',
                              isSelected ? 'bg-primary/20 border-primary ring-2 ring-primary' : 'hover:bg-muted/50'
                            )}
                          >
                            {avatar && <Image src={avatar.imageUrl} alt={inspector.name} width={40} height={40} className="rounded-full" />}
                            <div className="flex-1">
                              <p className="font-semibold">{inspector.name}</p>
                              <p className="text-sm text-muted-foreground">{inspector.location.name}</p>
                            </div>
                            {isSelected && <Check className="h-5 w-5 text-primary" />}
                          </div>
                        );
                      })}
                    </div>
                </TabsContent>
                <TabsContent value="marketplace" className="space-y-4">
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search marketplace for inspectors..." className="pl-9" />
                    </div>
                    <div className="text-center text-muted-foreground py-12">
                        <p>Marketplace search coming soon.</p>
                    </div>
                </TabsContent>
             </Tabs>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h4 className="font-semibold">Step 2: Add Instructions</h4>
            <div>
              <Label htmlFor="instructions">Dispatch Instructions (Optional)</Label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g., 'Client will meet you on site. Please call them 30 mins prior to arrival.'"
                className="mt-2 min-h-[150px]"
              />
            </div>
          </div>
        )}

        {step === 3 && selectedInspector && (
          <div className="space-y-4">
            <h4 className="font-semibold">Step 3: Review & Confirm</h4>
            <div className="space-y-4 rounded-lg border p-4 bg-background/50">
              <div className="flex items-center gap-4">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Assigning to</p>
                  <p className="font-semibold">{selectedInspector.name}</p>
                </div>
              </div>
               <div className="flex items-center gap-4">
                <Briefcase className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">For Job</p>
                  <p className="font-semibold">{job.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">At Location</p>
                  <p className="font-semibold">{job.address}</p>
                </div>
              </div>
              {instructions && (
                 <div className="flex items-start gap-4">
                  <FileText className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">With Instructions</p>
                    <blockquote className="mt-2 border-l-2 pl-4 italic text-sm">{instructions}</blockquote>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="pt-4">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNext} className="ml-auto">
              Next
            </Button>
          ) : (
            <Button onClick={handleDispatch} className="ml-auto">
              Confirm & Dispatch
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
