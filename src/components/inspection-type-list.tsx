
'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import inspectionData from '@/lib/inspection-types.json';

export function InspectionTypeList() {
  const { inspectionTypeCategories } = inspectionData;
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  return (
    <Accordion type="single" collapsible className="w-full">
      <RadioGroup value={selectedValue ?? undefined} onValueChange={setSelectedValue}>
        {inspectionTypeCategories.map((category) => (
          <AccordionItem value={category.id} key={category.id}>
            <AccordionTrigger className="text-left hover:no-underline">
              {category.name}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pl-4 pt-2">
                {category.types.map((type, index) => {
                  const uniqueId = `${category.id}-${index}`;
                  return (
                    <div key={uniqueId} className="flex items-center space-x-2">
                      <RadioGroupItem value={uniqueId} id={uniqueId} />
                      <Label
                        htmlFor={uniqueId}
                        className={cn(
                          'font-normal',
                          selectedValue === uniqueId && 'font-semibold text-primary'
                        )}
                      >
                        {type}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </RadioGroup>
    </Accordion>
  );
}
