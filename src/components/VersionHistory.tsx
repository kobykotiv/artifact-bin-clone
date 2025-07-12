import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { History, Check, GitCommit, Clock, RefreshCw, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { versioningService, type ArtifactVersion } from '@/lib/versioning';
import { toast } from 'sonner';
import DiffViewer from 'react-diff-viewer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PixelatedAvatar from '@/components/PixelatedAvatar';
import { Input } from '@/components/ui/input';

interface VersionHistoryProps {
  artifactId: string | null;
  onRevert: (content: string) => void;
}

export function VersionHistory({ 
  artifactId, 
  onRevert
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<ArtifactVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [diffContent, setDiffContent] = useState<{ oldText: string; newText: string } | null>(null);
  const [diffMode, setDiffMode] = useState<'side-by-side' | 'inline'>('side-by-side');
  const [diffPair, setDiffPair] = useState<{ left: string; right: string } | null>(null);
  const [editLabelOpen, setEditLabelOpen] = useState(false);
  const [labelEditVersionId, setLabelEditVersionId] = useState<string | null>(null);
  const [labelInput, setLabelInput] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState<string[]>([]);

  useEffect(() => {
    if (artifactId) {
      const fetchVersions = async () => {
        const fetchedVersions = await versioningService.getVersions(artifactId);
        setVersions(fetchedVersions);
        // The first version in the list is the current one
        if (fetchedVersions.length > 0) {
          setSelectedVersionId(fetchedVersions[0].id);
        }
      };
      fetchVersions();
    } else {
      setVersions([]);
      setSelectedVersionId(null);
    }
  }, [artifactId]);

  const handleRevert = async () => {
    if (!artifactId || !selectedVersionId) return;

    const versionToRevert = await versioningService.getVersion(artifactId, selectedVersionId);
    if (versionToRevert) {
      onRevert(versionToRevert.content);
      toast.success(`Reverted to version from ${new Date(versionToRevert.createdAt).toLocaleString()}`);
    } else {
      toast.error("Could not find the selected version to revert.");
    }
  };

  const handleViewDiff = async (leftVersionId: string, rightVersionId?: string) => {
    if (!artifactId) return;
    const left = await versioningService.getVersion(artifactId, leftVersionId);
    let right;
    if (rightVersionId) {
      right = await versioningService.getVersion(artifactId, rightVersionId);
    } else {
      right = versions[0]; // Default: diff against current
    }
    if (left && right) {
      setDiffContent({ oldText: left.content, newText: right.content });
      setDiffPair({ left: leftVersionId, right: right.id });
      setShowDiff(true);
    }
  };

  const handleEditLabel = (versionId: string, currentLabel: string) => {
    setLabelEditVersionId(versionId);
    setLabelInput(currentLabel || '');
    setEditLabelOpen(true);
  };

  const handleSaveLabel = async () => {
    if (!artifactId || !labelEditVersionId) return;
    await versioningService.updateCommitMessage(artifactId, labelEditVersionId, labelInput);
    setVersions(versions => versions.map(v => v.id === labelEditVersionId ? { ...v, commitMessage: labelInput } : v));
    setEditLabelOpen(false);
    setLabelEditVersionId(null);
    setLabelInput('');
    toast.success('Commit message updated!');
  };

  const handleCompareSelect = (versionId: string) => {
    if (compareSelection.includes(versionId)) {
      setCompareSelection(compareSelection.filter(id => id !== versionId));
    } else if (compareSelection.length < 2) {
      setCompareSelection([...compareSelection, versionId]);
    } else {
      setCompareSelection([compareSelection[1], versionId]);
    }
  };

  const handleCompareDiff = () => {
    if (compareSelection.length === 2) {
      handleViewDiff(compareSelection[0], compareSelection[1]);
      setCompareMode(false);
      setCompareSelection([]);
    }
  };

  if (!artifactId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <Clock className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
          <p>Select an artifact to view version history</p>
        </div>
      </div>
    );
  }
  
  if (versions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <History className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
          <p>No version history available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="version-history-neobrutalist p-2 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2 w-full">
        <h3 className="font-medium">Version History</h3>
        <div className="flex gap-2 items-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRevert}
            disabled={!selectedVersionId || selectedVersionId === versions[0]?.id}
            className="neobrutalist-version-btn"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-2" />
            Revert to Selected
          </Button>
          <Button
            variant={compareMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setCompareMode(!compareMode);
              setCompareSelection([]);
            }}
            className="neobrutalist-version-btn"
          >
            {compareMode ? 'Cancel Compare' : 'Compare Versions'}
          </Button>
        </div>
      </div>
      {compareMode && (
        <div className="mb-2 text-xs text-muted-foreground flex items-center gap-2">
          <span>Select any two versions to compare.</span>
          <Button size="sm" disabled={compareSelection.length !== 2} onClick={handleCompareDiff}>
            Compare Selected
          </Button>
        </div>
      )}
      <ScrollArea className="flex-grow min-h-0 w-full">
        <div className="space-y-1.5">
          {versions.map((version, index) => (
            <div key={version.id} className="relative">
              <Button
                variant="ghost"
                className={cn(
                  "neobrutalist-version-btn w-full justify-start text-left h-auto py-2",
                  selectedVersionId === version.id && "bg-muted",
                  compareMode && compareSelection.includes(version.id) && 'ring-2 ring-blue-500'
                )}
                onClick={() => {
                  if (compareMode) {
                    handleCompareSelect(version.id);
                  } else {
                    setSelectedVersionId(version.id);
                  }
                }}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-2 mt-0.5">
                    {index === 0 ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <GitCommit className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm leading-tight">
                        {version.commitMessage || `Update at ${new Date(version.createdAt).toLocaleTimeString()}`}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-1 px-1 py-0.5 h-5 text-xs"
                        onClick={e => {
                          e.stopPropagation();
                          handleEditLabel(version.id, version.commitMessage || '');
                        }}
                      >
                        {version.commitMessage ? 'Edit' : 'Add'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {new Date(version.createdAt).toLocaleString()}
                    </p>
                    {index === 0 && <span className="text-xs font-semibold text-green-600">(Current)</span>}
                  </div>
                </div>
              </Button>
              {!compareMode && index !== 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="neobrutalist-version-btn absolute right-2 top-2 z-10"
                  onClick={() => handleViewDiff(version.id)}
                >
                  View Diff
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      {/* Edit Label Dialog */}
      <Dialog open={editLabelOpen} onOpenChange={setEditLabelOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{labelEditVersionId ? 'Edit Commit Message' : 'Add Commit Message'}</DialogTitle>
          </DialogHeader>
          <Input
            value={labelInput}
            onChange={e => setLabelInput(e.target.value)}
            placeholder="Enter commit message..."
            className="mb-2"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditLabelOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveLabel} disabled={!labelInput.trim()}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Diff Dialog */}
      <Dialog open={showDiff} onOpenChange={setShowDiff}>
        <DialogContent className="neobrutalist-diff-dialog max-w-3xl">
          <DialogHeader className="neobrutalist-diff-header">
            <DialogTitle>Version Diff</DialogTitle>
            <div className="neobrutalist-diff-controls flex gap-2 items-center mt-2">
              <Button
                size="sm"
                variant={diffMode === 'side-by-side' ? 'default' : 'outline'}
                onClick={() => setDiffMode('side-by-side')}
                className={diffMode === 'side-by-side' ? 'active' : ''}
              >
                Side by Side
              </Button>
              <Button
                size="sm"
                variant={diffMode === 'inline' ? 'default' : 'outline'}
                onClick={() => setDiffMode('inline')}
                className={diffMode === 'inline' ? 'active' : ''}
              >
                Inline
              </Button>
            </div>
          </DialogHeader>
          {diffContent && (
            <DiffViewer
              oldValue={diffContent.oldText}
              newValue={diffContent.newText}
              splitView={diffMode === 'side-by-side'}
              showDiffOnly={false}
              leftTitle="Selected Version"
              rightTitle="Current Version"
              styles={{
                variables: {
                  light: {
                    diffViewerBackground: '#f8fafc',
                  },
                },
                diffContainer: {
                  border: '2px solid #222',
                  background: '#fff',
                  borderRadius: '0.25rem',
                  boxShadow: '2px 2px 0 #222',
                  fontFamily: 'JetBrains Mono, Menlo, Monaco, monospace',
                },
                line: { fontFamily: 'JetBrains Mono, Menlo, Monaco, monospace', fontSize: 13 },
                wordDiff: { fontFamily: 'JetBrains Mono, Menlo, Monaco, monospace', fontSize: 13 },
                contentText: { fontFamily: 'JetBrains Mono, Menlo, Monaco, monospace', fontSize: 13 },
                content: { fontFamily: 'JetBrains Mono, Menlo, Monaco, monospace', fontSize: 13 },
                gutter: { fontFamily: 'JetBrains Mono, Menlo, Monaco, monospace', fontSize: 13 },
              }}
              renderContent={str => (
                <pre style={{ margin: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>{str}</pre>
              )}
            />
          )}
        </DialogContent>
      </Dialog>
      {/* Mobile Navigation Menu */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#fffbe6] border-t-2 border-[#222] flex sm:hidden justify-around items-center py-2 shadow-lg">
        <Button variant="ghost" size="icon" className="neobrutalist-version-btn" aria-label="Home">
          <History className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" className="neobrutalist-version-btn" aria-label="Artifacts">
          <FileText className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" className="neobrutalist-version-btn" aria-label="Profile">
          <PixelatedAvatar seed={1234} size={24} />
        </Button>
      </nav>
    </div>
  );
}
