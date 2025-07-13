import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  File, 
  FileText, 
  Code, 
  Image, 
  Archive, 
  X, 
  Check,
  AlertCircle,
  Plus
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  artifactType?: string;
  bin?: string;
  tags?: string[];
}

const artifactTypes = [
  { value: 'code', label: 'Code Snippet', icon: Code },
  { value: 'document', label: 'Document', icon: FileText },
  { value: 'image', label: 'Image', icon: Image },
  { value: 'template', label: 'Template', icon: File },
  { value: 'archive', label: 'Archive', icon: Archive },
];

const mockBins = [
  { value: 'frontend', label: 'Frontend Components' },
  { value: 'backend', label: 'Backend APIs' },
  { value: 'docs', label: 'Documentation' },
  { value: 'templates', label: 'Templates' },
];

export function UploadPage() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'files' | 'text' | 'url'>('files');
  const [textContent, setTextContent] = useState('');
  const [urlContent, setUrlContent] = useState('');
  const [artifactMetadata, setArtifactMetadata] = useState({
    name: '',
    description: '',
    type: '',
    bin: '',
    tags: '',
    language: '',
    visibility: 'private'
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending' as const
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'text/*': ['.txt', '.md', '.json', '.xml', '.csv'],
      'application/*': ['.json', '.xml', '.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
      'text/plain': ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.go', '.rs']
    }
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const updateFileMetadata = (id: string, updates: Partial<UploadFile>) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === id ? { ...file, ...updates } : file
      )
    );
  };

  const simulateUpload = async (file: UploadFile) => {
    updateFileMetadata(file.id, { status: 'uploading' });
    
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      updateFileMetadata(file.id, { progress });
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    
    // Simulate API call
    try {
      const formData = new FormData();
      formData.append('file', file.file);
      formData.append('type', file.artifactType || 'document');
      formData.append('bin', file.bin || '');
      
      const response = await fetch('/api/artifacts/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        updateFileMetadata(file.id, { status: 'completed' });
      } else {
        updateFileMetadata(file.id, { 
          status: 'error', 
          error: 'Upload failed. Please try again.' 
        });
      }
    } catch (error) {
      updateFileMetadata(file.id, { 
        status: 'error', 
        error: 'Network error. Please check your connection.' 
      });
    }
  };

  const uploadAll = () => {
    files
      .filter((file) => file.status === 'pending')
      .forEach((file) => simulateUpload(file));
  };

  const handleTextUpload = async () => {
    try {
      const response = await fetch('/api/artifacts/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: textContent,
          ...artifactMetadata,
          tags: artifactMetadata.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        })
      });

      if (response.ok) {
        setTextContent('');
        setArtifactMetadata({
          name: '', description: '', type: '', bin: '', tags: '', language: '', visibility: 'private'
        });
      }
    } catch (error) {
      console.error('Failed to upload text content:', error);
    }
  };

  const handleUrlUpload = async () => {
    try {
      const response = await fetch('/api/artifacts/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlContent,
          ...artifactMetadata,
          tags: artifactMetadata.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        })
      });

      if (response.ok) {
        setUrlContent('');
        setArtifactMetadata({
          name: '', description: '', type: '', bin: '', tags: '', language: '', visibility: 'private'
        });
      }
    } catch (error) {
      console.error('Failed to upload from URL:', error);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.includes('text') || file.name.endsWith('.md')) return FileText;
    if (file.name.match(/\.(js|ts|jsx|tsx|py|java|cpp|c|go|rs)$/)) return Code;
    return File;
  };

  const getStatusColor = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'uploading': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
    }
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending': return AlertCircle;
      case 'uploading': return Upload;
      case 'completed': return Check;
      case 'error': return AlertCircle;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload</h1>
        <p className="text-muted-foreground">Add new artifacts to your collection</p>
      </div>

      <Tabs value={uploadMethod} onValueChange={(value: any) => setUploadMethod(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="files">Upload Files</TabsTrigger>
          <TabsTrigger value="text">Text/Code</TabsTrigger>
          <TabsTrigger value="url">From URL</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-6">
          {/* File Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle>Drop Files</CardTitle>
              <CardDescription>Drag and drop files or click to select</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">
                  {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                </p>
                <p className="text-muted-foreground">
                  or <span className="text-primary">click to browse</span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Supports: Code files, Documents, Images, Archives
                </p>
              </div>
            </CardContent>
          </Card>

          {/* File List */}
          {files.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Files ({files.length})</CardTitle>
                  <CardDescription>Configure and upload your files</CardDescription>
                </div>
                <Button onClick={uploadAll} disabled={!files.some(f => f.status === 'pending')}>
                  Upload All
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {files.map((fileItem) => {
                  const FileIcon = getFileIcon(fileItem.file);
                  const StatusIcon = getStatusIcon(fileItem.status);
                  
                  return (
                    <div key={fileItem.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{fileItem.file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(fileItem.file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`h-4 w-4 ${getStatusColor(fileItem.status)}`} />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(fileItem.id)}
                            disabled={fileItem.status === 'uploading'}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {fileItem.status === 'uploading' && (
                        <Progress value={fileItem.progress} className="w-full" />
                      )}

                      {fileItem.status === 'error' && fileItem.error && (
                        <p className="text-sm text-red-600">{fileItem.error}</p>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <Select
                          value={fileItem.artifactType || ''}
                          onValueChange={(value) => updateFileMetadata(fileItem.id, { artifactType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Artifact Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {artifactTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={fileItem.bin || ''}
                          onValueChange={(value) => updateFileMetadata(fileItem.id, { bin: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Bin" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockBins.map((bin) => (
                              <SelectItem key={bin.value} value={bin.value}>
                                {bin.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="text" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create from Text</CardTitle>
              <CardDescription>Paste code or text content directly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={artifactMetadata.name}
                    onChange={(e) => setArtifactMetadata({ ...artifactMetadata, name: e.target.value })}
                    placeholder="Artifact name"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={artifactMetadata.type}
                    onValueChange={(value) => setArtifactMetadata({ ...artifactMetadata, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {artifactTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={artifactMetadata.description}
                  onChange={(e) => setArtifactMetadata({ ...artifactMetadata, description: e.target.value })}
                  placeholder="Describe this artifact"
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste your code or text here..."
                  className="min-h-[300px] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bin">Bin</Label>
                  <Select
                    value={artifactMetadata.bin}
                    onValueChange={(value) => setArtifactMetadata({ ...artifactMetadata, bin: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bin" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBins.map((bin) => (
                        <SelectItem key={bin.value} value={bin.value}>
                          {bin.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={artifactMetadata.tags}
                    onChange={(e) => setArtifactMetadata({ ...artifactMetadata, tags: e.target.value })}
                    placeholder="Comma-separated tags"
                  />
                </div>
              </div>

              <Button onClick={handleTextUpload} className="w-full" disabled={!textContent.trim()}>
                <Plus className="mr-2 h-4 w-4" />
                Create Artifact
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="url" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import from URL</CardTitle>
              <CardDescription>Import content from a URL or repository</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={urlContent}
                  onChange={(e) => setUrlContent(e.target.value)}
                  placeholder="https://example.com/file.js"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="url-name">Name</Label>
                  <Input
                    id="url-name"
                    value={artifactMetadata.name}
                    onChange={(e) => setArtifactMetadata({ ...artifactMetadata, name: e.target.value })}
                    placeholder="Artifact name"
                  />
                </div>
                <div>
                  <Label htmlFor="url-type">Type</Label>
                  <Select
                    value={artifactMetadata.type}
                    onValueChange={(value) => setArtifactMetadata({ ...artifactMetadata, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {artifactTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleUrlUpload} className="w-full" disabled={!urlContent.trim()}>
                <Upload className="mr-2 h-4 w-4" />
                Import from URL
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default UploadPage;
