import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { saaSFinancialFreedomGuide } from '@/lib/businessGuides/saaSFinancialFreedomGuide';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Target, Zap, BookOpen } from 'lucide-react'; // Added icons

// Helper function to replace placeholders
const replacePlaceholders = (text: string, variables: Record<string, string>): string => {
  let processedText = text;
  for (const key in variables) {
    const placeholder = `{{${key}}}`;
    if (variables[key]) {
      processedText = processedText.replace(new RegExp(placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), variables[key]);
    }
  }
  return processedText;
};

// Helper function to render content with markdown-like lists and bolding
const renderContent = (content: string) => {
    const lines = content.split('\n').map(line => line.trim());
    return lines.map((line, index) => {
        if (line.startsWith('- **') && line.includes('**:')) { // Main point: - **Title**: Description
            const parts = line.substring(2).split('**:');
            const title = parts[0]?.substring(2).trim(); // Remove "**"
            const description = parts.slice(1).join('**:').trim();
            return (
                <div key={index} className="mt-3">
                    <h4 className="text-md font-semibold text-primary flex items-center">
                        <Zap size={16} className="mr-2 text-yellow-500" />
                        {title}
                    </h4>
                    {description && <p className="text-sm text-muted-foreground ml-5">{description}</p>}
                </div>
            );
        } else if (line.startsWith('  - *Action*:')) { // Action item
            const actionText = line.substring(13).trim();
            return (
                <p key={index} className="text-sm text-blue-600 dark:text-blue-400 ml-8 flex items-start">
                    <Target size={15} className="mr-2 mt-0.5 flex-shrink-0 text-green-500" />
                    <span><strong>Action:</strong> {actionText}</span>
                </p>
            );
        } else if (line.startsWith('  - *Financial Fantasy Focus*:')) { // Financial focus
            const focusText = line.substring(28).trim();
            return (
                <p key={index} className="text-sm text-purple-600 dark:text-purple-400 ml-8 flex items-start">
                    <Lightbulb size={15} className="mr-2 mt-0.5 flex-shrink-0 text-orange-500" />
                    <span><strong>Financial Fantasy Focus:</strong> {focusText}</span>
                </p>
            );
        } else if (line.startsWith('  - *') && line.includes('*:')) { // Other sub-points like "Tech Stack Trade-offs"
            const parts = line.substring(4).split('*:');
            const subTitle = parts[0]?.trim();
            const subDescription = parts.slice(1).join('*:').trim();
            return (
                 <p key={index} className="text-sm text-muted-foreground ml-8 flex items-start">
                    <BookOpen size={15} className="mr-2 mt-0.5 flex-shrink-0 text-gray-500" />
                    <span><strong>{subTitle}:</strong> {subDescription}</span>
                </p>
            );
        } else if (line.startsWith('- ')) { // Simple list item
            return <li key={index} className="text-sm text-muted-foreground ml-5 list-disc">{line.substring(2)}</li>;
        }
        return null; // Ignore empty lines or lines that don't match patterns
    }).filter(Boolean);
};


export function SaaSFinancialFreedomGuideTab() {
  const guide = saaSFinancialFreedomGuide;

  return (
    <ScrollArea className="h-full p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg p-6">
            <CardTitle className="text-3xl font-bold">{guide.title}</CardTitle>
            {guide.introduction && (
              <CardDescription className="text-purple-200 mt-2 text-lg">
                {guide.introduction}
              </CardDescription>
            )}
          </CardHeader>
        </Card>

        {guide.sections.map((section) => (
          <Card key={section.id} className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Badge variant="secondary" className="mr-3 text-sm">{section.id.replace('phase', 'Phase ')}</Badge>
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              {renderContent(replacePlaceholders(section.content, guide.templateVariables))}
            </CardContent>
          </Card>
        ))}

        {guide.footer && (
          <Card className="mt-8 bg-gray-50 dark:bg-gray-800">
            <CardContent className="p-6">
              <p className="text-center text-sm text-muted-foreground italic">
                {guide.footer}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
