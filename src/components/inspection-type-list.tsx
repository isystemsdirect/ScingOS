
'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import inspectionData from '@/lib/inspection-types.json';

type InspectionTypeListProps = {
  selectionMode: 'single' | 'multiple';
  onSelectionChange?: (selection: string | string[]) => void;
};

export function InspectionTypeList({
  selectionMode,
  onSelectionChange,
}: InspectionTypeListProps) {
  const { inspectionTypeCategories } = inspectionData;
  const [singleSelection, setSingleSelection] = useState<string | null>(null);
  const [multipleSelection, setMultipleSelection] = useState<string[]>([]);

  const handleSingleChange = (value: string) => {
    setSingleSelection(value);
    if (onSelectionChange) {
      onSelectionChange(value);
    }
  };

  const handleMultipleChange = (id: string, checked: boolean | 'indeterminate') => {
    const newSelection = checked
      ? [...multipleSelection, id]
      : multipleSelection.filter((item) => item !== id);
    setMultipleSelection(newSelection);
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  };

  return (
    <Accordion type="multiple" className="w-full">
      {selectionMode === 'single' ? (
        <RadioGroup value={singleSelection ?? undefined} onValueChange={handleSingleChange}>
          {inspectionTypeCategories.map((category) => (
            <AccordionItem value={category.id} key={category.id}>
              <AccordionTrigger className="text-left hover:no-underline">
                {category.name}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pl-4 pt-2">
                  {category.types.map((type) => {
                    const uniqueId = `${category.id}-${type}`;
                    return (
                      <div key={uniqueId} className="flex items-center space-x-2">
                        <RadioGroupItem value={uniqueId} id={uniqueId} />
                        <Label
                          htmlFor={uniqueId}
                          className={cn(
                            'font-normal cursor-pointer',
                            singleSelection === uniqueId && 'font-semibold text-primary'
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
      ) : (
        inspectionTypeCategories.map((category) => (
          <AccordionItem value={category.id} key={category.id}>
            <AccordionTrigger className="text-left hover:no-underline">
              {category.name}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pl-4 pt-2">
                {category.types.map((type) => {
                  const uniqueId = `${category.id}-${type}`;
                  return (
                    <div key={uniqueId} className="flex items-center space-x-2">
                      <Checkbox
                        id={uniqueId}
                        checked={multipleSelection.includes(uniqueId)}
                        onCheckedChange={(checked) => handleMultipleChange(uniqueId, checked)}
                      />
                      <Label
                        htmlFor={uniqueId}
                        className={cn(
                          'font-normal cursor-pointer',
                          multipleSelection.includes(uniqueId) && 'font-semibold text-primary'
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
        ))
      )}
    </Accordion>
  );
}
