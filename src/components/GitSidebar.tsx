import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GitBranch, 
  GitCommit, 
  GitMerge, 
  GitPullRequest,
  Plus,
  Check,
  X
} from 'lucide-react';
import { createTicketFromTemplate } from '@/lib/services/jira';
import { templates, formatTicket } from '@/lib/templates/ticketGenerator';

interface GitCommitData {
  id: string;
  message: string;
  author: string;
  date: string;
  branch: string;
  changes: number;
}

export function GitSidebar() {
  const [commits] = useState<GitCommitData[]>([
    {
      id: '1234abc',
      message: 'Add payment processing',
      author: 'You',
      date: '2m ago',
      branch: 'main',
      changes: 5
    },
    // Add more mock commits as needed
  ]);

  const handleCreateTicket = (type: 'bug' | 'feature' | 'prompt') => {
    let ticket;
    switch (type) {
      case 'bug':
        ticket = templates.bugReport({
          component: 'PromptEngine',
          error: 'Invalid prompt structure detected',
          steps: [
            'Open prompt editor',
            'Add new variable',
            'System crashes'
          ]
        });
        break;
      case 'feature':
        ticket = templates.featureRequest({
          feature: 'AI Prompt Templates',
          description: 'Add support for custom prompt templates',
          acceptance: [
            'Users can create custom templates',
            'Templates support variables',
            'Templates can be exported'
          ]
        });
        break;
      case 'prompt':
        ticket = templates.promptUpdate({
          component: 'PromptEngine',
          currentPrompt: 'Generate {{type}} code',
          suggestedPrompt: 'Generate {{type}} code with {{framework}}'
        });
        break;
    }

    if (ticket) {
      const markdown = formatTicket(ticket);
      // Use markdown content for display or export
      console.log(markdown);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          <span className="font-medium">main</span>
        </div>
        <Button variant="ghost" size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-grow">
        <div className="p-2 space-y-4">
          {/* Branch Info */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Current Branch</h3>
            <div className="flex items-center gap-2 text-sm">
              <GitBranch className="h-4 w-4" />
              <span>main</span>
              <Badge variant="secondary" className="ml-auto">
                Latest
              </Badge>
            </div>
          </div>

          {/* Commit History */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Recent Commits</h3>
            <div className="space-y-2">
              {commits.map(commit => (
                <div 
                  key={commit.id}
                  className="p-2 border rounded-md hover:bg-muted/50 cursor-pointer"
                >
                  <div className="flex items-start gap-2">
                    <GitCommit className="h-4 w-4 mt-1 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {commit.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {commit.author} • {commit.date}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Changes */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Changes</h3>
            <div className="space-y-1">
              <div className="flex items-center text-sm">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>2 files changed</span>
              </div>
              <div className="flex items-center text-sm">
                <Plus className="h-4 w-4 text-blue-500 mr-2" />
                <span>50 additions</span>
              </div>
              <div className="flex items-center text-sm">
                <X className="h-4 w-4 text-red-500 mr-2" />
                <span>12 deletions</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-2 border-t">
        <Button variant="outline" className="w-full">
          <GitPullRequest className="h-4 w-4 mr-2" />
          Create Pull Request
        </Button>
      </div>

      <div className="p-4 border-t">
        <Button 
          variant="outline" 
          className="w-full mb-2"
          onClick={() => handleCreateTicket('prompt')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Ticket
        </Button>
      </div>
    </div>
  );
}
