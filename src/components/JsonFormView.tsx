import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface JsonFormViewProps {
  jsonData: any;
  onChange: (newJson: any) => void;
  readOnly?: boolean;
}

/**
 * A component that renders JSON data as form inputs
 * Supports nested objects, arrays, and primitive values
 */
export function JsonFormView({ jsonData, onChange, readOnly = false }: JsonFormViewProps) {
  const [formData, setFormData] = useState<any>(jsonData);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
  // Update form data when jsonData changes
  useEffect(() => {
    setFormData(jsonData);
  }, [jsonData]);

  // Update parent component with form data changes
  const handleChange = (newData: any) => {
    setFormData(newData);
    onChange(newData);
  };

  // Handle changes to primitive values (string, number, boolean)
  const handleFieldChange = (path: string[], value: any) => {
    const newData = { ...formData };
    let current = newData;
    
    // Navigate to the parent object
    for (let i = 0; i < path.length - 1; i++) {
      if (current[path[i]] === undefined) {
        if (typeof path[i+1] === 'number') {
          current[path[i]] = [];
        } else {
          current[path[i]] = {};
        }
      }
      current = current[path[i]];
    }
    
    // Set the value
    const lastKey = path[path.length - 1];
    current[lastKey] = value;
    
    handleChange(newData);
  };

  // Add a new item to an array
  const handleAddArrayItem = (path: string[]) => {
    const newData = { ...formData };
    let current = newData;
    
    // Navigate to the array
    for (const key of path) {
      if (current[key] === undefined) {
        current[key] = [];
      }
      current = current[key];
    }
    
    // Determine the type of the new item based on existing items
    let newItem;
    if (Array.isArray(current) && current.length > 0) {
      const lastItem = current[current.length - 1];
      if (typeof lastItem === 'object' && lastItem !== null) {
        newItem = Array.isArray(lastItem) ? [] : {};
      } else {
        newItem = typeof lastItem === 'string' ? '' : 
                 typeof lastItem === 'number' ? 0 : 
                 typeof lastItem === 'boolean' ? false : '';
      }
    } else {
      // Default to empty string if array is empty
      newItem = '';
    }
    
    current.push(newItem);
    handleChange(newData);
    
    // Expand the section for the new item
    const newPath = [...path, (current.length - 1).toString()].join('.');
    setExpandedSections({ ...expandedSections, [newPath]: true });
  };

  // Remove an item from an array
  const handleRemoveArrayItem = (path: string[], index: number) => {
    const newData = { ...formData };
    let current = newData;
    
    // Navigate to the array
    for (const key of path) {
      if (!current[key]) return;
      current = current[key];
    }
    
    if (Array.isArray(current) && index >= 0 && index < current.length) {
      current.splice(index, 1);
      handleChange(newData);
    }
  };

  // Toggle section expansion state
  const toggleSection = (path: string) => {
    setExpandedSections({
      ...expandedSections,
      [path]: !expandedSections[path]
    });
  };

  // Render a form field based on the value type
  const renderField = (path: string[], key: string, value: any, isArrayItem = false) => {
    const fieldPath = [...path, key];
    const fieldId = fieldPath.join('.');
    const isExpanded = expandedSections[fieldId] !== false; // Default to expanded
    
    // Return JSX based on the type of the value
    if (value === null) {
      return (
        <div key={fieldId} className="form-group">
          <Label htmlFor={fieldId}>{formatLabel(key)}</Label>
          <Input 
            id={fieldId}
            value="null"
            readOnly={true}
            className="text-muted-foreground"
          />
        </div>
      );
    }
    
    if (typeof value === 'string') {
      // For multiline strings, use textarea
      const isMultiline = value.includes('\n') || value.length > 100;
      return (
        <div key={fieldId} className="form-group">
          <Label htmlFor={fieldId}>{formatLabel(key)}</Label>
          {isMultiline ? (
            <Textarea 
              id={fieldId}
              value={value}
              onChange={(e) => handleFieldChange(fieldPath, e.target.value)}
              readOnly={readOnly}
              rows={Math.min(10, value.split('\n').length + 1)}
            />
          ) : (
            <Input 
              id={fieldId}
              value={value}
              onChange={(e) => handleFieldChange(fieldPath, e.target.value)}
              readOnly={readOnly}
            />
          )}
        </div>
      );
    }
    
    if (typeof value === 'number') {
      return (
        <div key={fieldId} className="form-group">
          <Label htmlFor={fieldId}>{formatLabel(key)}</Label>
          <Input 
            id={fieldId}
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(fieldPath, parseFloat(e.target.value) || 0)}
            readOnly={readOnly}
          />
        </div>
      );
    }
    
    if (typeof value === 'boolean') {
      return (
        <div key={fieldId} className="form-group flex items-center space-x-2 my-4">
          <Switch 
            id={fieldId} 
            checked={value}
            onCheckedChange={(checked) => handleFieldChange(fieldPath, checked)}
            disabled={readOnly}
          />
          <Label htmlFor={fieldId}>{formatLabel(key)}</Label>
        </div>
      );
    }
    
    if (Array.isArray(value)) {
      return (
        <div key={fieldId} className="my-4">
          <Collapsible open={isExpanded} onOpenChange={() => toggleSection(fieldId)}>
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center p-0">
                  {isExpanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                  <Label className="cursor-pointer">{formatLabel(key)} [{value.length}]</Label>
                </Button>
              </CollapsibleTrigger>
              {!readOnly && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleAddArrayItem(fieldPath)}
                  title={`Add item to ${key}`}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
            <CollapsibleContent>
              <div className="pl-4 border-l-2 border-muted mt-2">
                {value.map((item, i) => (
                  <div key={`${fieldId}.${i}`} className="relative mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">[{i}]</span>
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleRemoveArrayItem(fieldPath, i)}
                          title="Remove item"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    {renderField(fieldPath, i.toString(), item, true)}
                  </div>
                ))}
                {value.length === 0 && (
                  <div className="text-sm text-muted-foreground italic my-2">Empty array</div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      );
    }
    
    if (typeof value === 'object') {
      return (
        <div key={fieldId} className="my-4">
          <Collapsible open={isExpanded} onOpenChange={() => toggleSection(fieldId)}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center p-0">
                {isExpanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                <Label className="cursor-pointer">{formatLabel(key)}</Label>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pl-4 border-l-2 border-muted mt-2">
                <Card className="border-dashed">
                  <CardContent className="p-4">
                    {Object.keys(value).length === 0 ? (
                      <div className="text-sm text-muted-foreground italic">Empty object</div>
                    ) : (
                      Object.entries(value).map(([k, v]) => renderField(fieldPath, k, v))
                    )}
                  </CardContent>
                </Card>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      );
    }
    
    return (
      <div key={fieldId} className="form-group">
        <Label htmlFor={fieldId}>{formatLabel(key)}</Label>
        <Input 
          id={fieldId}
          value={String(value)}
          onChange={(e) => handleFieldChange(fieldPath, e.target.value)}
          readOnly={readOnly}
        />
      </div>
    );
  };
  
  // Format a key as a label (capitalize, add spaces)
  const formatLabel = (key: string) => {
    if (/^\d+$/.test(key)) return `Item ${parseInt(key) + 1}`;
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ');
  };

  // Handle errors in the JSON
  if (!formData) {
    return (
      <div className="bg-destructive/10 p-4 rounded-md text-destructive">
        Invalid JSON data
      </div>
    );
  }

  return (
    <div className="json-form-view space-y-4">
      {typeof formData === 'object' && !Array.isArray(formData) ? (
        Object.entries(formData).map(([key, value]) => renderField([], key, value))
      ) : Array.isArray(formData) ? (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Array ({formData.length} items)</h3>
            {!readOnly && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleAddArrayItem([])}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            )}
          </div>
          {formData.map((item, i) => renderField([], i.toString(), item, true))}
        </div>
      ) : (
        <div className="form-group">
          <Label htmlFor="root">Value</Label>
          <Input 
            id="root"
            value={String(formData)}
            onChange={(e) => handleChange(e.target.value)}
            readOnly={readOnly}
          />
        </div>
      )}
    </div>
  );
}
