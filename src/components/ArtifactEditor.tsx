import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { languages } from '@/lib/languages';
import { type ArtifactData } from '@/lib/services/db';
import { Save, X } from 'lucide-react';
import { JsonEditor } from './JsonEditor';
import { getAISuggestions } from '@/lib/aiSuggestions';

interface ArtifactEditorProps {
  artifact: ArtifactData;
  onSave: (updatedArtifact: ArtifactData) => void;
  onCancel: () => void;
}

export function ArtifactEditor({ artifact, onSave, onCancel }: ArtifactEditorProps) {
  const [editedArtifact, setEditedArtifact] = useState<ArtifactData>(artifact);
  const [isDirty, setIsDirty] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<string[]>([]);
  const [aiLoading, setAILoading] = useState(false);
  const [aiError, setAIError] = useState<string | null>(null);

  const handleSave = () => {
    onSave({
      ...editedArtifact,
      updatedAt: new Date().toISOString()
    });
    setIsDirty(false);
  };

  const handleAISuggestions = async () => {
    setAILoading(true);
    setAIError(null);
    try {
      const suggestions = await getAISuggestions(editedArtifact);
      setAISuggestions(suggestions);
    } catch (e) {
      setAIError('Failed to fetch AI suggestions.');
    } finally {
      setAILoading(false);
    }
  };

  const renderEditor = () => {
    if (artifact.language === 'json') {
      return (
        <JsonEditor 
          value={editedArtifact.content} 
          onChange={(value) => {
            setEditedArtifact(prev => ({ ...prev, content: value || '' }));
            setIsDirty(true);
          }} 
        />
      );
    }
    
    return (
      <Editor
        height="100%"
        defaultValue={editedArtifact.content}
        language={editedArtifact.language}
        theme="vs-dark"
        onChange={(value) => {
          setEditedArtifact(prev => ({ ...prev, content: value || '' }));
          setIsDirty(true);
        }}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'JetBrains Mono',
          scrollBeyondLastLine: false,
          automaticLayout: true
        }}
      />
    );
  };

  return (
    <>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-4 flex-1">
          <Input
            value={editedArtifact.title}
            onChange={(e) => {
              setEditedArtifact(prev => ({ ...prev, title: e.target.value }));
              setIsDirty(true);
            }}
            placeholder="Artifact Title"
            className="max-w-xs"
          />
          <Input
            value={editedArtifact.tags?.join(', ') || ''}
            onChange={e => {
              const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
              setEditedArtifact(prev => ({ ...prev, tags }));
              setIsDirty(true);
            }}
            placeholder="Tags (comma separated)"
            className="max-w-xs"
          />
          <Select
            value={editedArtifact.language}
            onValueChange={(value) => {
              setEditedArtifact(prev => ({ ...prev, language: value }));
              setIsDirty(true);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map(lang => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onCancel}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave}
            disabled={!isDirty}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-grow">
        {renderEditor()}
        <div className="p-4 border-t bg-muted">
          <Button size="sm" variant="outline" onClick={handleAISuggestions} disabled={aiLoading}>
            {aiLoading ? 'Loading AI Suggestions...' : 'Get AI Suggestions'}
          </Button>
          {aiError && <div className="text-red-500 mt-2">{aiError}</div>}
          {aiSuggestions.length > 0 && (
            <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
              {aiSuggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          )}
        </div>
      </CardContent>
    </>
  );
}
