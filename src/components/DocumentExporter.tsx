import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Download, FileText, FileImage } from 'lucide-react';
import { ArtifactData } from '@/lib/services/db';
import { exportArtifact, exportProject } from '@/lib/utils/exportUtils';

interface DocumentExporterProps {
  artifacts: ArtifactData[];
  selectedArtifactId?: string | null;
}

export function DocumentExporter({ artifacts, selectedArtifactId }: DocumentExporterProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<'pdf' | 'docx'>('pdf');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  const [exportMode, setExportMode] = useState<'single' | 'all'>(selectedArtifactId ? 'single' : 'all');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let blob: Blob;
      
      if (exportMode === 'single' && selectedArtifactId) {
        const artifact = artifacts.find(a => a.id === selectedArtifactId);
        if (!artifact) {
          throw new Error('Selected artifact not found');
        }
        
        blob = await exportArtifact(artifact, {
          format,
          includeMetadata,
          includeTimestamp
        });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${artifact.title || 'document'}.${format}`;
        link.click();
        URL.revokeObjectURL(url);
        
        toast.success(`Exported ${artifact.title} as ${format.toUpperCase()}`);
      } else {
        // Export all artifacts as a single document
        blob = await exportProject(artifacts, {
          format,
          includeMetadata,
          includeTimestamp
        });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `project-export.${format}`;
        link.click();
        URL.revokeObjectURL(url);
        
        toast.success(`Exported ${artifacts.length} artifacts as ${format.toUpperCase()}`);
      }
      
      setOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export document');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Document</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h3 className="font-medium">Export Format</h3>
              <RadioGroup value={format} onValueChange={(value) => setFormat(value as 'pdf' | 'docx')} className="export-options">
                <div className={`export-format-card ${format === 'pdf' ? 'selected' : ''}`}>
                  <FileText className="h-8 w-8 mx-auto mb-2" />
                  <RadioGroupItem value="pdf" id="pdf" className="sr-only" />
                  <Label htmlFor="pdf">PDF Document</Label>
                </div>
                <div className={`export-format-card ${format === 'docx' ? 'selected' : ''}`}>
                  <FileImage className="h-8 w-8 mx-auto mb-2" />
                  <RadioGroupItem value="docx" id="docx" className="sr-only" />
                  <Label htmlFor="docx">Word Document</Label>
                </div>
              </RadioGroup>
            </div>
            
            {selectedArtifactId && (
              <div className="space-y-2">
                <h3 className="font-medium">What to Export</h3>
                <RadioGroup value={exportMode} onValueChange={(value) => setExportMode(value as 'single' | 'all')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single">Current Document Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all">All Documents ({artifacts.length})</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
            
            <div className="space-y-2">
              <h3 className="font-medium">Options</h3>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="metadata" 
                  checked={includeMetadata} 
                  onCheckedChange={(checked) => setIncludeMetadata(!!checked)} 
                />
                <Label htmlFor="metadata">Include Metadata</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="timestamp" 
                  checked={includeTimestamp} 
                  onCheckedChange={(checked) => setIncludeTimestamp(!!checked)} 
                />
                <Label htmlFor="timestamp">Include Export Timestamp</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
