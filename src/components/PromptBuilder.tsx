import { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PromptVariable {
  id: string;
  options: string[];
}

interface PromptBuilderProps {
  template: Template;
  onPromptChange: (prompt: string) => void;
}

const promptTemplates: Record<string, { template: string; variables: Record<string, string[]> }> = {
  javascript: {
    template: "Create a {{type}} that {{action}} using {{framework}} and {{feature}}",
    variables: {
      type: ['web app', 'CLI tool', 'REST API', 'React component', 'Node.js service'],
      action: ['manages user authentication', 'processes data in real-time', 'integrates with external APIs', 'handles file uploads'],
      framework: ['Express.js', 'Next.js', 'React', 'Vue.js', 'Angular'],
      feature: ['WebSockets', 'Server-Sent Events', 'JWT authentication', 'Redis caching']
    }
  },
  python: {
    template: "Build a {{type}} to {{action}} with {{library}} and implement {{feature}}",
    variables: {
      type: ['data pipeline', 'ML model', 'web scraper', 'automation script', 'FastAPI service'],
      action: ['analyze sentiment', 'classify images', 'process time series data', 'extract information'],
      library: ['pandas', 'scikit-learn', 'TensorFlow', 'PyTorch', 'NumPy'],
      feature: ['async processing', 'multiprocessing', 'GPU acceleration', 'caching']
    }
  }
};

export function PromptBuilder({ template, onPromptChange }: PromptBuilderProps) {
  const [selections, setSelections] = useState<Record<string, string>>({});
  
  const promptConfig = useMemo(() => {
    return promptTemplates[template.language || template.type.toLowerCase()] || {
      template: "Create a {{type}} that {{action}}",
      variables: {
        type: ['component', 'service', 'utility', 'system'],
        action: ['solves a problem', 'improves efficiency', 'adds value', 'helps users']
      }
    };
  }, [template]);

  const buildPrompt = (selections: Record<string, string>) => {
    let prompt = promptConfig.template;
    Object.entries(selections).forEach(([key, value]) => {
      prompt = prompt.replace(`{{${key}}}`, value);
    });
    return prompt;
  };

  return (
    <div className="p-4 space-y-4 bg-muted/50 rounded-lg">
      <h3 className="font-medium">Customize your prompt:</h3>
      <div className="space-y-3">
        {Object.entries(promptConfig.variables).map(([varName, options]) => (
          <div key={varName} className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-24">{varName}:</span>
            <Select
              value={selections[varName]}
              onValueChange={(value) => {
                const newSelections = { ...selections, [varName]: value };
                setSelections(newSelections);
                onPromptChange(buildPrompt(newSelections));
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={`Select ${varName}`} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
      <div className="pt-2 text-sm">
        <p className="font-medium">Generated Prompt:</p>
        <p className="text-muted-foreground">{buildPrompt(selections)}</p>
      </div>
    </div>
  );
}
