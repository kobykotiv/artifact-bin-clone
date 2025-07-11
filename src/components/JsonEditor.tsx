import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { JsonFormView } from './JsonFormView';
import { formatJSON } from '@/lib/utils/formatHelpers';
import { AlertTriangle, Code, FileJson } from 'lucide-react';
import { toast } from 'sonner';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function JsonEditor({ value, onChange, readOnly = false }: JsonEditorProps) {
  const [mode, setMode] = useState<'raw' | 'form'>('raw');
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  
  // Parse the JSON string when value changes
  useEffect(() => {
    try {
      const parsed = JSON.parse(value || '{}');
      setParsedJson(parsed);
      setParseError(null);
    } catch (error) {
      setParseError((error as Error).message);
      // Don't update parsedJson if there's an error
    }
  }, [value]);

  // Handle changes from the form view
  const handleFormChange = (newJson: any) => {
    try {
      // Format the JSON with proper indentation
      const formatted = formatJSON(newJson);
      onChange(formatted);
    } catch (error) {
      toast.error('Error updating JSON');
    }
  };

  // Format the raw JSON
  const handleFormat = () => {
    try {
      const formatted = formatJSON(JSON.parse(value || '{}'));
      onChange(formatted);
      toast.success('JSON formatted');
    } catch (error) {
      toast.error('Invalid JSON');
    }
  };

  return (
    <div className="json-editor">
      <Tabs value={mode} onValueChange={(val) => setMode(val as 'raw' | 'form')} className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <TabsList>
            <TabsTrigger value="raw" className="flex items-center gap-1">
              <Code className="h-4 w-4" />
              <span>Raw JSON</span>
            </TabsTrigger>
            <TabsTrigger value="form" className="flex items-center gap-1" disabled={!!parseError}>
              <FileJson className="h-4 w-4" />
              <span>Form View</span>
            </TabsTrigger>
          </TabsList>
          
          {mode === 'raw' && !readOnly && (
            <Button size="sm" variant="outline" onClick={handleFormat}>
              Format JSON
            </Button>
          )}
        </div>
        
        <TabsContent value="raw">
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            readOnly={readOnly}
            className="min-h-[300px] font-mono"
          />
          
          {parseError && (
            <div className="mt-2 p-2 bg-destructive/10 text-destructive rounded flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <strong>Invalid JSON:</strong> {parseError}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="form">
          {parsedJson && (
            <div className="border rounded-md p-4 bg-card">
              <JsonFormView
                jsonData={parsedJson}
                onChange={handleFormChange}
                readOnly={readOnly}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
