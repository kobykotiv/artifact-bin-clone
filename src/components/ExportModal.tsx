import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileDown, 
  FileText, 
  FilePdf, 
  X 
} from 'lucide-react';
import { type ArtifactData } from '@/lib/services/db';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  artifacts: ArtifactData[];
  onExport: (artifacts: ArtifactData[], format: 'markdown' | 'pdf') => void;
}

export function ExportModal({ isOpen, onClose, artifacts, onExport }: ExportModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exportFormat, setExportFormat] = useState<'markdown' | 'pdf'>('markdown');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-background border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Export Artifacts</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 border-b space-y-2">
            <div className="flex gap-2">
              <Button
                variant={exportFormat === 'markdown' ? 'default' : 'outline'}
                onClick={() => setExportFormat('markdown')}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                Markdown
              </Button>
              <Button
                variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                onClick={() => setExportFormat('pdf')}
                className="flex-1"
              >
                <FilePdf className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-grow p-4">
            <div className="space-y-2">
              {artifacts.map(artifact => (
                <div
                  key={artifact.id}
                  className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md"
                >
                  <Checkbox
                    checked={selectedIds.has(artifact.id)}
                    onCheckedChange={(checked) => {
                      const newSelected = new Set(selectedIds);
                      if (checked) {
                        newSelected.add(artifact.id);
                      } else {
                        newSelected.delete(artifact.id);
                      }
                      setSelectedIds(newSelected);
                    }}
                  />
                  <span>{artifact.title}</span>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t flex justify-between items-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSelectedIds(new Set(artifacts.map(a => a.id)));
              }}
            >
              Select All
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const selectedArtifacts = artifacts.filter(a => selectedIds.has(a.id));
                  onExport(selectedArtifacts, exportFormat);
                }}
                disabled={selectedIds.size === 0}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
