import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface SlotMachineProps {
  options: string[];
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function SlotMachine({ options, label, value, onChange }: SlotMachineProps) {
  const currentIndex = options.findIndex(option => option === value) || 0;
  
  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % options.length;
    onChange(options[nextIndex]);
  };
  
  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + options.length) % options.length;
    onChange(options[prevIndex]);
  };
  
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-2">
        <Button size="icon" variant="outline" onClick={handlePrev}>
          <ChevronUp className="h-4 w-4" />
        </Button>
        <div className="flex-grow text-center py-2 border rounded-md">
          {value || options[0]}
        </div>
        <Button size="icon" variant="outline" onClick={handleNext}>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
