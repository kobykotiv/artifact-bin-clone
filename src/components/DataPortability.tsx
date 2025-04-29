import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { exportArtifacts, importArtifacts } from '@/lib/export';
import { toast } from 'sonner';

interface DataPortabilityProps {
  onImportComplete: () => Promise<void>;
}

export function DataPortability({ onImportComplete }: DataPortabilityProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleExport = async () => {
    try {
      toast.loading('Preparing export...');
      await exportArtifacts();
      toast.dismiss();
      toast.success('Export successful');
    } catch (error) {
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : 'Export failed');
    }
  };
  
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      toast.loading('Importing artifacts...');
      const result = await importArtifacts(file);
      
      // Reset the file input
      e.target.value = '';
      
      // Refresh artifacts list
      await onImportComplete();
      
      toast.dismiss();
      toast.success(`Imported ${result.imported} of ${result.total} artifacts`);
    } catch (error) {
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : 'Import failed');
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline" 
        size="sm"
        className="gap-2"
        onClick={handleExport}
      >
        <Download className="h-4 w-4" />
        Export
      </Button>
      
      <Button
        variant="outline" 
        size="sm"
        className="gap-2"
        onClick={handleImportClick}
      >
        <Upload className="h-4 w-4" />
        Import
      </Button>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".zip"
        className="hidden"
      />
    </div>
  );
}
