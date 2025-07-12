import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { languages } from '@/lib/languages';
import { type ArtifactData } from '@/lib/services/db';
import { 
  Save, 
  X, 
  Settings, 
  Copy, 
  Download, 
  Code, 
  Eye,
  Search,
  Replace,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Users,
  MessageSquare,
  Bug,
  Zap,
  Clock,
  GitBranch
} from 'lucide-react';
import { JsonEditor } from './JsonEditor';
import { getAISuggestions } from '@/lib/aiSuggestions';
import { LivePreview } from './LivePreview';
import { VersionHistory } from './VersionHistory';
import { CommentSystem } from './CommentSystem';
import { CollaborationWorkspace } from './CollaborationWorkspace';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PromptGenerator } from './PromptGenerator';

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
  
  // Enhanced editor state
  const [theme, setTheme] = useState<'vs-dark' | 'vs-light' | 'hc-black'>('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>('off');
  const [minimap, setMinimap] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Enhanced AI and collaboration features
  const [aiCompletions, setAICompletions] = useState<string[]>([]);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [codeAnalysis, setCodeAnalysis] = useState<{issues: any[], suggestions: any[]}>({issues: [], suggestions: []});
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [realTimeChanges, setRealTimeChanges] = useState<any[]>([]);
  
  // Auto-save functionality
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  
  // Code analysis
  const [lintingEnabled, setLintingEnabled] = useState(true);
  const [autoFormat, setAutoFormat] = useState(true);

  const editorRef = useRef<any>(null);

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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editedArtifact.content);
  };

  const handleDownload = () => {
    const blob = new Blob([editedArtifact.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editedArtifact.title || 'artifact'}.${getFileExtension(editedArtifact.language)}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFileExtension = (language: string) => {
    const extensions = {
      javascript: 'js',
      typescript: 'ts',
      html: 'html',
      css: 'css',
      python: 'py',
      java: 'java',
      json: 'json',
      markdown: 'md',
      yaml: 'yml',
      xml: 'xml',
      sql: 'sql'
    };
    return extensions[language as keyof typeof extensions] || 'txt';
  };

  // AI-powered code completion
  const handleAICompletion = async (position: any) => {
    try {
      setAILoading(true);
      const currentCode = editedArtifact.content;
      const contextBefore = currentCode.substring(0, position.offset);
      const contextAfter = currentCode.substring(position.offset);
      
      // Mock AI completion API call
      const completions = await getAICodeCompletions(contextBefore, contextAfter, editedArtifact.language);
      setAICompletions(completions);
    } catch (error) {
      console.error('AI completion failed:', error);
    } finally {
      setAILoading(false);
    }
  };

  // Helper functions for AI features
  const getAICodeCompletions = async (contextBefore: string, contextAfter: string, language: string): Promise<string[]> => {
    // Mock AI completion API call - in real app would call OpenAI/Claude
    const mockCompletions = {
      javascript: [
        'const result = await fetch(',
        'if (condition) {',
        'return value;',
        'console.log(',
        'function handleClick() {'
      ],
      typescript: [
        'interface Props {',
        'const [state, setState] = useState<',
        'export default function',
        'type ActionType =',
        'async function getData(): Promise<'
      ],
      python: [
        'def function_name():',
        'if __name__ == "__main__":',
        'import numpy as np',
        'try:',
        'for item in items:'
      ],
      html: [
        '<div className="',
        '<button onClick={',
        '<input type="',
        '<img src="',
        '<a href="'
      ]
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockCompletions[language as keyof typeof mockCompletions] || [
      '// No suggestions available',
      '// Try a different context'
    ];
  };

  const performCodeAnalysis = async (code: string, language: string): Promise<{issues: any[], suggestions: any[]}> => {
    // Mock code analysis - in real app would use ESLint, TypeScript compiler, etc.
    const issues: any[] = [];
    const suggestions: any[] = [];
    
    if (language === 'javascript' || language === 'typescript') {
      // Check for common issues
      if (code.includes('var ')) {
        issues.push({
          line: code.split('\n').findIndex(line => line.includes('var ')) + 1,
          message: 'Use const or let instead of var',
          severity: 'warning',
          suggestion: 'Replace var with const or let'
        });
      }
      
      if (code.includes('console.log')) {
        issues.push({
          line: code.split('\n').findIndex(line => line.includes('console.log')) + 1,
          message: 'Remove console.log before production',
          severity: 'info',
          suggestion: 'Remove or replace with proper logging'
        });
      }
      
      // AI suggestions for improvements
      if (!code.includes('async') && code.includes('fetch')) {
        suggestions.push({
          title: 'Async/Await Pattern',
          description: 'Consider using async/await for better error handling',
          fix: 'Add async keyword and await fetch calls'
        });
      }
      
      if (code.includes('useState') && !code.includes('useCallback')) {
        suggestions.push({
          title: 'Performance Optimization',
          description: 'Consider using useCallback for event handlers',
          fix: 'Wrap handlers in useCallback'
        });
      }
    }
    
    return { issues, suggestions };
  };

  const insertCompletion = (completion: string) => {
    // Implementation to insert AI completion at cursor
    if (editorRef.current) {
      const editor = editorRef.current;
      const position = editor.getPosition();
      const range = {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      };
      
      editor.executeEdits('ai-completion', [{
        range: range,
        text: completion
      }]);
      
      editor.focus();
    }
  };

  const applyFix = (issue: any) => {
    // Implementation to apply quick fix
    if (!editorRef.current) return;
    
    const editor = editorRef.current;
    const model = editor.getModel();
    const line = model.getLineContent(issue.line);
    
    let fixedLine = line;
    
    // Apply specific fixes based on issue type
    if (issue.message.includes('var')) {
      fixedLine = line.replace(/\bvar\b/, 'const');
    } else if (issue.message.includes('console.log')) {
      // Comment out console.log
      fixedLine = line.replace(/console\.log\([^)]*\);?/, '// console.log removed');
    }
    
    const range = {
      startLineNumber: issue.line,
      startColumn: 1,
      endLineNumber: issue.line,
      endColumn: line.length + 1
    };
    
    editor.executeEdits('quick-fix', [{
      range: range,
      text: fixedLine
    }]);
  };

  const applySuggestion = (suggestion: any) => {
    // Implementation to apply AI suggestion
    if (!editorRef.current) return;
    
    const editor = editorRef.current;
    const selection = editor.getSelection();
    const selectedText = editor.getModel().getValueInRange(selection);
    
    let improvedCode = selectedText;
    
    // Apply specific improvements based on suggestion type
    if (suggestion.title.includes('Performance')) {
      // Add React.memo wrapper
      improvedCode = `React.memo(${selectedText})`;
    } else if (suggestion.title.includes('Async')) {
      // Add async/await pattern
      improvedCode = selectedText.replace(/\.then\(/, 'await ');
    }
    
    editor.executeEdits('apply-suggestion', [{
      range: selection,
      text: improvedCode
    }]);
  };

  const broadcastCursorPosition = (position: any) => {
    // Implementation to broadcast cursor position to collaborators
    // In a real app, this would use WebSocket or WebRTC
    const cursorData = {
      userId: 'current-user', // Get from auth context
      position: position,
      timestamp: Date.now(),
      artifactId: artifact.id
    };
    
    // Mock broadcast - replace with actual WebSocket implementation
    console.log('Broadcasting cursor position:', cursorData);
    
    // Update local active users display
    setActiveUsers(prev => {
      const updated = prev.filter(user => user.id !== 'current-user');
      return [...updated, {
        id: 'current-user',
        username: 'You',
        cursor: position,
        lastActive: new Date()
      }];
    });
  };

  const generateQuickFixes = (issues: any[]) => {
    // Implementation to generate quick fixes for issues
    return issues.map(issue => ({
      title: `Fix: ${issue.message}`,
      description: issue.suggestion,
      command: () => applyFix(issue),
      severity: issue.severity
    }));
  };

  // Real-time code analysis
  const analyzeCode = async (code: string) => {
    if (!lintingEnabled) return;
    
    try {
      const analysis = await performCodeAnalysis(code, editedArtifact.language);
      setCodeAnalysis(analysis);
    } catch (error) {
      console.error('Code analysis failed:', error);
    }
  };

  // Enhanced editor mount with AI features
  const handleEditorMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Add custom keybindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => {
      editor.getAction('editor.action.duplicateSelection')?.run();
    });
    
    // AI completion on Ctrl+Space
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
      const position = editor.getPosition();
      handleAICompletion(position);
    });
    
    // Quick fix on Ctrl+.
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Period, () => {
      showQuickFixes();
    });
    
    // Live collaboration cursor tracking
    editor.onDidChangeCursorPosition((e: any) => {
      // Broadcast cursor position to other users
      broadcastCursorPosition(e.position);
    });
    
    // Code analysis on content change
    editor.onDidChangeModelContent(() => {
      const code = editor.getValue();
      analyzeCode(code);
    });
  };

  // AI-powered quick fixes
  const showQuickFixes = () => {
    if (codeAnalysis.issues.length > 0) {
      // Show context menu with AI-suggested fixes
      const fixes = generateQuickFixes(codeAnalysis.issues);
      // Implementation would show Monaco editor quick fix menu
    }
  };

  // Auto-save implementation
  useEffect(() => {
    if (!autoSave || !isDirty) return;
    
    const timer = setTimeout(() => {
      handleSave();
      setLastSaved(new Date());
    }, 3000); // Auto-save after 3 seconds of inactivity
    
    return () => clearTimeout(timer);
  }, [editedArtifact.content, autoSave, isDirty]);

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  const findAndReplace = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.startFindReplaceAction')?.run();
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
        theme={theme}
        onChange={(value) => {
          setEditedArtifact(prev => ({ ...prev, content: value || '' }));
          setIsDirty(true);
        }}
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: minimap },
          fontSize: fontSize,
          fontFamily: 'JetBrains Mono, Consolas, monospace',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: wordWrap,
          lineNumbers: 'on',
          renderWhitespace: 'boundary',
          folding: true,
          bracketPairColorization: { enabled: true },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          renderLineHighlight: 'all',
          quickSuggestions: true,
          formatOnPaste: true,
          formatOnType: true,
          tabSize: 2,
          insertSpaces: true
        }}
      />
    );
  };

  // Enhanced settings panel with new features
  const renderEnhancedSettings = () => (
    <div className="border-b bg-muted/50 p-4">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
        <div className="space-y-2">
          <Label>Theme</Label>
          <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vs-dark">Dark</SelectItem>
              <SelectItem value="vs-light">Light</SelectItem>
              <SelectItem value="hc-black">High Contrast</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Font Size</Label>
          <Select value={fontSize.toString()} onValueChange={(value) => setFontSize(parseInt(value))}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12px</SelectItem>
              <SelectItem value="14">14px</SelectItem>
              <SelectItem value="16">16px</SelectItem>
              <SelectItem value="18">18px</SelectItem>
              <SelectItem value="20">20px</SelectItem>
            </SelectContent>
          </Select>
        </div>            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Word Wrap
                <Switch
                  checked={wordWrap === 'on'}
                  onCheckedChange={(checked) => setWordWrap(checked ? 'on' : 'off')}
                />
              </Label>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Minimap
                <Switch
                  checked={minimap}
                  onCheckedChange={setMinimap}
                />
              </Label>
            </div>
        
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Auto-save
            <Switch
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
          </Label>
        </div>
        
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            AI Assist
            <Switch
              checked={showAIPanel}
              onCheckedChange={setShowAIPanel}
            />
          </Label>
        </div>
        
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Linting
            <Switch
              checked={lintingEnabled}
              onCheckedChange={setLintingEnabled}
            />
          </Label>
        </div>
        
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Auto Format
            <Switch
              checked={autoFormat}
              onCheckedChange={setAutoFormat}
            />
          </Label>
        </div>
      </div>
      
      {autoSave && (
        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
          <Clock className="w-3 h-3" />
          Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </div>
  );

  // AI suggestions panel
  const renderAIPanel = () => (
    <div className="w-80 border-l bg-muted/20 p-4 overflow-y-auto">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <h3 className="font-medium">AI Assistant</h3>
        </div>
        
        {/* Code completions */}
        {aiCompletions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Suggestions</h4>
            <div className="space-y-2">
              {aiCompletions.map((completion, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="sm"
                  className="w-full text-left justify-start h-auto p-2"
                  onClick={() => insertCompletion(completion)}
                >
                  <code className="text-xs">{completion}</code>
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* Code analysis */}
        {codeAnalysis.issues.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Bug className="w-3 h-3" />
              Issues ({codeAnalysis.issues.length})
            </h4>
            <div className="space-y-2">
              {codeAnalysis.issues.map((issue, i) => (
                <div key={i} className="p-2 rounded bg-red-50 dark:bg-red-900/20 text-xs">
                  <div className="font-medium text-red-600 dark:text-red-400">
                    Line {issue.line}: {issue.severity}
                  </div>
                  <div className="text-red-500 dark:text-red-300">{issue.message}</div>
                  {issue.suggestion && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-6 text-xs"
                      onClick={() => applyFix(issue)}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Quick Fix
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* AI suggestions */}
        {codeAnalysis.suggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Improvements</h4>
            <div className="space-y-2">
              {codeAnalysis.suggestions.map((suggestion, i) => (
                <div key={i} className="p-2 rounded bg-blue-50 dark:bg-blue-900/20 text-xs">
                  <div className="font-medium text-blue-600 dark:text-blue-400">
                    {suggestion.title}
                  </div>
                  <div className="text-blue-500 dark:text-blue-300">{suggestion.description}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 h-6 text-xs"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    Apply
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Gemini AI modal state
  const [showGeminiModal, setShowGeminiModal] = useState(false);
  const [geminiPrompt, setGeminiPrompt] = useState('');
  const [geminiPlans, setGeminiPlans] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [geminiGeneratedCode, setGeminiGeneratedCode] = useState('');
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [geminiPromptVars, setGeminiPromptVars] = useState<any>(null);
  const [geminiPromptType, setGeminiPromptType] = useState(undefined);

  // Gemini AI workflow handlers
  const handleGeminiPromptSave = (generatedPrompt: string, inputs: any, promptType: any) => {
    setGeminiPrompt(generatedPrompt);
    setGeminiPromptVars(inputs);
    setGeminiPromptType(promptType);
    setGeminiPlans([]);
    setSelectedPlan(null);
    setGeminiGeneratedCode('');
    // Trigger plan generation
    handleGeminiPlanGen(generatedPrompt);
  };

  const handleGeminiPlanGen = async (prompt: string) => {
    setGeminiLoading(true);
    setGeminiError(null);
    setGeminiPlans([]);
    setSelectedPlan(null);
    setGeminiGeneratedCode('');
    try {
      // Simulate Gemini plan generation (replace with real API call)
      await new Promise(r => setTimeout(r, 800));
      setGeminiPlans([
        'Plan 1: Simple functional React component',
        'Plan 2: Component with hooks and state',
        'Plan 3: Component with context and effects'
      ]);
    } catch (e) {
      setGeminiError('Failed to generate plans.');
    } finally {
      setGeminiLoading(false);
    }
  };

  const handleGeminiCodeGen = async () => {
    if (!selectedPlan) return;
    setGeminiLoading(true);
    setGeminiError(null);
    try {
      // Simulate Gemini code generation (replace with real API call)
      await new Promise(r => setTimeout(r, 1200));
      setGeminiGeneratedCode(
        selectedPlan.includes('hooks')
          ? `import React, { useState } from 'react';\n\nexport default function GeminiComponent() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(count + 1)}>Count: {count}</button>\n  );\n}`
          : selectedPlan.includes('context')
          ? `import React, { useContext } from 'react';\nimport { MyContext } from './context';\n\nexport default function GeminiComponent() {\n  const value = useContext(MyContext);\n  return <div>Context value: {value}</div>;\n}`
          : `import React from 'react';\n\nexport default function GeminiComponent() {\n  return <div>Hello from Gemini!</div>;\n}`
      );
    } catch (e) {
      setGeminiError('Failed to generate code.');
    } finally {
      setGeminiLoading(false);
    }
  };

  const handleGeminiAccept = () => {
    setEditedArtifact(prev => ({ ...prev, content: geminiGeneratedCode }));
    setIsDirty(true);
    setShowGeminiModal(false);
  };

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      {/* Gemini AI Modal */}
      <Dialog open={showGeminiModal} onOpenChange={setShowGeminiModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate React Component with Gemini AI</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Step 1: Prompt Generator */}
            {!geminiPrompt && (
              <PromptGenerator
                onSave={handleGeminiPromptSave}
              />
            )}
            {/* Step 2: Plan selection */}
            {geminiPrompt && geminiPlans.length > 0 && !selectedPlan && (
              <div>
                <div className="font-medium mb-2">Select a plan:</div>
                <div className="space-y-2">
                  {geminiPlans.map((plan, i) => (
                    <Button
                      key={i}
                      variant={selectedPlan === plan ? 'default' : 'outline'}
                      size="sm"
                      className="w-full text-left justify-start"
                      onClick={() => setSelectedPlan(plan)}
                    >
                      {plan}
                    </Button>
                  ))}
                </div>
                <Button
                  className="mt-4 w-full"
                  disabled={!selectedPlan || geminiLoading}
                  onClick={handleGeminiCodeGen}
                >
                  Generate Code
                </Button>
              </div>
            )}
            {/* Step 3: Code preview/edit */}
            {geminiGeneratedCode && (
              <div>
                <div className="font-medium mb-2">Generated Code (editable):</div>
                <Editor
                  height="200px"
                  defaultValue={geminiGeneratedCode}
                  language="javascript"
                  theme={theme}
                  onChange={val => setGeminiGeneratedCode(val || '')}
                  options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: 'on' }}
                />
                <Button className="mt-4 w-full" onClick={handleGeminiAccept}>
                  Use this code
                </Button>
              </div>
            )}
            {geminiError && <div className="text-red-500 text-sm">{geminiError}</div>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowGeminiModal(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
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
        
        <div className="flex items-center gap-2">
          {/* Enhanced toolbar */}
          <Button size="sm" variant="ghost" onClick={handleCopyCode} title="Copy code">
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDownload} title="Download">
            <Download className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={formatCode} title="Format code">
            <Code className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={findAndReplace} title="Find & Replace">
            <Search className="h-4 w-4" />
          </Button>
          
          {/* AI Assistant toggle */}
          <Button
            size="sm"
            variant={showAIPanel ? "default" : "ghost"}
            onClick={() => setShowAIPanel(!showAIPanel)}
            title="AI Assistant"
          >
            <Sparkles className="h-4 w-4" />
          </Button>
          
          {/* Collaboration features */}
          <Button
            size="sm"
            variant={showCollaboration ? "default" : "ghost"}
            onClick={() => setShowCollaboration(!showCollaboration)}
            title="Collaboration"
          >
            <Users className="h-4 w-4" />
            {activeUsers.length > 0 && (
              <span className="ml-1 text-xs">{activeUsers.length}</span>
            )}
          </Button>
          
          <Button
            size="sm"
            variant={showComments ? "default" : "ghost"}
            onClick={() => setShowComments(!showComments)}
            title="Comments"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant={showVersionHistory ? "default" : "ghost"}
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            title="Version History"
          >
            <GitBranch className="h-4 w-4" />
          </Button>
          
          {/* Settings */}
          <Button
            size="sm"
            variant={showSettings ? "default" : "ghost"}
            onClick={() => setShowSettings(!showSettings)}
            title="Editor settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          {/* Fullscreen */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          
          <div className="h-4 w-px bg-border" />
          
          {/* Save/Cancel */}
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
            {isDirty && <Badge variant="secondary" className="ml-2">•</Badge>}
          </Button>
        </div>
      </CardHeader>

      {/* Settings Panel */}
      {showSettings && renderEnhancedSettings()}

      <CardContent className="p-0 flex-grow flex">
        <div className={`flex-grow ${showPreview ? 'w-1/2' : showAIPanel ? 'flex-1' : 'w-full'}`}>
          {renderEditor()}
        </div>
        
        {/* Live Preview */}
        {showPreview && (
          <div className="w-1/2 border-l">
            <LivePreview 
              artifact={editedArtifact} 
              isVisible={true}
              className="h-full border-0 rounded-none"
            />
          </div>
        )}
        
        {/* AI Panel */}
        {showAIPanel && renderAIPanel()}
      </CardContent>

      {/* Enhanced footer with collaboration status */}
      <div className="p-4 border-t bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button size="sm" variant="outline" onClick={handleAISuggestions} disabled={aiLoading}>
              {aiLoading ? 'Loading AI Suggestions...' : 'Get AI Suggestions'}
            </Button>
            
            {autoSave && isDirty && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Auto-saving...
              </div>
            )}
          </div>
          
          {/* Collaboration status */}
          {activeUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {activeUsers.length} user{activeUsers.length > 1 ? 's' : ''} editing
              </span>
              <div className="flex -space-x-1">
                {activeUsers.slice(0, 3).map((user, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs text-white">
                    {user.username[0].toUpperCase()}
                  </div>
                ))}
                {activeUsers.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-gray-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs text-white">
                    +{activeUsers.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {aiError && <div className="text-red-500 mt-2 text-sm">{aiError}</div>}
        {aiSuggestions.length > 0 && (
          <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
            {aiSuggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        )}
      </div>

      {/* Collaboration Modal */}
      <CollaborationWorkspace
        artifactId={artifact.id}
        open={showCollaboration}
        onClose={() => setShowCollaboration(false)}
      />

      {/* Version History Modal */}
      <VersionHistory
        artifactId={artifact.id}
        onRevert={(content) => {
          setEditedArtifact(prev => ({ ...prev, content }));
          setIsDirty(true);
        }}
      />

      {/* Comments Modal */}
      <CommentSystem
        artifactId={artifact.id}
        open={showComments}
        onClose={() => setShowComments(false)}
      />
    </div>
  );
}
