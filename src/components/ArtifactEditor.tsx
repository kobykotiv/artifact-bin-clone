import React, { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArtifactPreview } from "@/components/ArtifactPreview";
import { Save, Copy, Trash2, Check, Code, Eye, GitBranch, Maximize } from "lucide-react";
import { type Artifact } from "@/lib/db";
import { toast } from "sonner";
import { languages } from "@/lib/languages";

interface ArtifactEditorProps {
  artifact?: Artifact;
  onSave: (artifact: Partial<Artifact>) => void;
  onDelete: () => void;
  onFork: (artifact: Artifact) => void;
  onFullscreen: (artifact: Artifact) => void;
  isNew?: boolean;
}

const PROJECT_GENERATOR_LANG = 'project-generator';

export function ArtifactEditor({
  artifact,
  onSave,
  onDelete,
  onFork,
  onFullscreen,
  isNew = false,
}: ArtifactEditorProps) {
  const [title, setTitle] = useState(artifact?.title || "");
  const [language, setLanguage] = useState(artifact?.language || "javascript");
  const [code, setCode] = useState(artifact?.code || "");
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("code");

  useEffect(() => {
    if (artifact) {
      setTitle(artifact.title);
      setLanguage(artifact.language);
      setCode(artifact.code);
      setActiveTab("code");
    } else {
      setTitle("");
      setLanguage("javascript");
      setCode("");
      setActiveTab("code");
    }
  }, [artifact]);

  const handleSave = () => {
    if (!code.trim()) {
      toast.error("Cannot save empty artifact");
      return;
    }
    
    onSave({
      title: title || "Untitled",
      language,
      code,
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this artifact?")) {
      onDelete();
    }
  };

  const handleFork = () => {
    if (artifact) {
      onFork(artifact);
    }
  };

  const handleFullscreen = () => {
    if (artifact) {
      onFullscreen(artifact);
    }
  };

  const isPreviewable = ['html', 'css', 'javascript', 'markdown'].includes(language);

  if (!artifact || artifact.language === PROJECT_GENERATOR_LANG) {
    return null;
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="px-4 py-3 space-y-0 border-b">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Artifact title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 text-base font-medium border-0 shadow-none focus-visible:ring-0 px-1"
          />
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-grow overflow-hidden">
        <div className="px-4 pt-3 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="code" className="gap-1">
              <Code className="h-4 w-4" /> Code
            </TabsTrigger>
            {isPreviewable && (
              <TabsTrigger value="preview" className="gap-1">
                <Eye className="h-4 w-4" /> Preview
              </TabsTrigger>
            )}
          </TabsList>
          {isPreviewable && (
            <Button variant="ghost" size="sm" onClick={handleFullscreen} className="gap-1">
              <Maximize className="h-4 w-4" />
              Fullscreen
            </Button>
          )}
        </div>

        <TabsContent
          value="code"
          className="flex-grow overflow-auto p-0 m-0 focus-visible:ring-0"
        >
          <Textarea
            placeholder="Paste or type your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-full min-h-[400px] rounded-none border-0 resize-none font-mono text-sm leading-relaxed p-4 focus-visible:ring-0"
          />
        </TabsContent>

        {isPreviewable && (
          <TabsContent
            value="preview"
            className="flex-grow overflow-auto p-4 m-0 focus-visible:ring-0 bg-muted/10"
          >
            {artifact && (
              <ArtifactPreview
                artifact={{ ...artifact, code }}
                isVisible={activeTab === "preview"}
              />
            )}
          </TabsContent>
        )}
      </Tabs>

      <CardFooter className="px-4 py-3 border-t flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button variant="outline" onClick={handleCopy} className="gap-2">
            {copySuccess ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            Copy
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button variant="secondary" onClick={handleFork} className="gap-2">
              <GitBranch className="h-4 w-4" />
              Fork
            </Button>
          )}
          {!isNew && (
            <Button variant="destructive" onClick={handleDelete} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
