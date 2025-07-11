import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Upload, File as FileIcon, X } from 'lucide-react'; // Added FileIcon and X
import { toast } from 'sonner';
import { supportedUploadExtensions } from '@/lib/utils/fileTypes';
import { cn } from '@/lib/utils'; // Import cn utility

interface FileUploadDialogProps {
  onUpload: (file: File) => Promise<void>;
  triggerLabel?: string;
  className?: string;
}

export function FileUploadDialog({ onUpload, triggerLabel = "Upload File", className }: FileUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false); // State for drag-and-drop visual feedback

  const handleFileChange = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      // Basic validation (can be expanded)
      const file = files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      if (!supportedUploadExtensions.includes(`.${fileExtension}`)) {
          toast.error(`Unsupported file type: .${fileExtension}`);
          setSelectedFile(null);
          return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  }, []);

  const handleUploadClick = async () => {
    if (!selectedFile) {
      toast.warning("Please select or drop a file first.");
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(selectedFile);
      setIsOpen(false); // Close dialog on successful upload
    } catch (error) {
      // Error is usually handled in the onUpload prop, but log here too
      console.error("Upload failed in dialog:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Reset state when dialog opens or closes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedFile(null);
      setIsUploading(false);
      setDragOver(false);
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
    const files = event.dataTransfer.files;
    handleFileChange(files);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Upload className="w-4 h-4 mr-2" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Artifact</DialogTitle>
        </DialogHeader>
        <div
          className={cn(
            "mt-4 border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors",
            dragOver && "border-primary bg-primary/10",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload-input')?.click()} // Trigger hidden input click
        >
          <input
            id="file-upload-input"
            type="file"
            accept={supportedUploadExtensions}
            onChange={(e) => handleFileChange(e.target.files)}
            disabled={isUploading}
            className="hidden" // Hide the default input
          />
          {selectedFile ? (
            <div className="flex flex-col items-center gap-2">
              <FileIcon className="w-10 h-10 text-primary" />
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-destructive hover:text-destructive"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the outer div click
                    setSelectedFile(null);
                }}
                disabled={isUploading}
              >
                <X className="w-4 h-4 mr-1" /> Remove
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Upload className="w-10 h-10" />
              <p className="font-medium">Drag & drop file here</p>
              <p className="text-sm">or click to browse</p>
              <p className="text-xs mt-2">(Supported: {supportedUploadExtensions.replaceAll(',', ', ')})</p>
            </div>
          )}
        </div>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline" disabled={isUploading}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleUploadClick} disabled={!selectedFile || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...
              </>
            ) : "Upload Artifact"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
