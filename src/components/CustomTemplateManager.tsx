import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserDefinedTemplate, loadUserTemplates, addUserTemplate, updateUserTemplate, deleteUserTemplate, UserTemplateField } from '@/lib/userTemplateManager';
import { PlusCircle, Edit, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface CustomTemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialField: UserTemplateField = { name: '', label: '', type: 'text', placeholder: '' };
const initialTemplateFormState: Omit<UserDefinedTemplate, 'id'> = {
  name: '',
  description: '',
  templateType: 'prompt',
  content: '',
  fields: [initialField],
  icon: 'FileText',
};

export function CustomTemplateManager({ isOpen, onClose }: CustomTemplateManagerProps) {
  const [templates, setTemplates] = useState<UserDefinedTemplate[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<UserDefinedTemplate | null>(null);
  const [currentFormData, setCurrentFormData] = useState<Omit<UserDefinedTemplate, 'id'>>(initialTemplateFormState);

  useEffect(() => {
    if (isOpen) {
      setTemplates(loadUserTemplates());
    }
  }, [isOpen]);

  const handleOpenForm = (template?: UserDefinedTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setCurrentFormData({
        name: template.name,
        description: template.description || '',
        templateType: template.templateType,
        content: template.content,
        fields: template.fields.length > 0 ? template.fields : [initialField],
        icon: template.icon || 'FileText',
      });
    } else {
      setEditingTemplate(null);
      setCurrentFormData(initialTemplateFormState);
    }
    setIsFormOpen(true);
  };

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: keyof Omit<UserDefinedTemplate, 'id'>, value: string) => {
     setCurrentFormData(prev => ({ ...prev, [name]: value as UserDefinedTemplate['templateType'] | UserDefinedTemplate['icon'] }));
  };

  const handleFieldChange = (index: number, fieldProp: keyof UserTemplateField, value: string) => {
    const updatedFields = [...currentFormData.fields];
    updatedFields[index] = { ...updatedFields[index], [fieldProp]: value };
    setCurrentFormData(prev => ({ ...prev, fields: updatedFields }));
  };

  const addField = () => {
    setCurrentFormData(prev => ({ ...prev, fields: [...prev.fields, initialField] }));
  };

  const removeField = (index: number) => {
    const updatedFields = currentFormData.fields.filter((_, i) => i !== index);
    setCurrentFormData(prev => ({ ...prev, fields: updatedFields.length > 0 ? updatedFields : [initialField] }));
  };

  const handleSaveTemplate = () => {
    if (!currentFormData.name || !currentFormData.content) {
        toast.error("Template name and content are required.");
        return;
    }
    if (currentFormData.fields.some(f => !f.name || !f.label)) {
        toast.error("All custom fields must have a name and label.");
        return;
    }

    if (editingTemplate) {
      updateUserTemplate({ ...editingTemplate, ...currentFormData });
      toast.success(`Template "${currentFormData.name}" updated.`);
    } else {
      addUserTemplate(currentFormData);
      toast.success(`Template "${currentFormData.name}" added.`);
    }
    setTemplates(loadUserTemplates());
    setIsFormOpen(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (templateId: string, templateName: string) => {
    if (window.confirm(`Are you sure you want to delete the template "${templateName}"?`)) {
      deleteUserTemplate(templateId);
      setTemplates(loadUserTemplates());
      toast.success(`Template "${templateName}" deleted.`);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Custom Templates</DialogTitle>
          <DialogDescription>Create, edit, or delete your JSON-based templates for prompts, documents, or pseudocode.</DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          <Button onClick={() => handleOpenForm()}><PlusCircle className="mr-2 h-4 w-4" /> Add New Template</Button>
        </div>

        {isFormOpen ? (
          <Card>
            <CardHeader>
              <CardTitle>{editingTemplate ? 'Edit' : 'Add New'} Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input id="templateName" name="name" value={currentFormData.name} onChange={handleFormInputChange} placeholder="e.g., My Custom Prompt" />
                </div>
                <div>
                  <Label htmlFor="templateIcon">Icon (Lucide)</Label>
                  <Input id="templateIcon" name="icon" value={currentFormData.icon || 'FileText'} onChange={handleFormInputChange} placeholder="e.g., FileText, Zap" />
                </div>
              </div>
              <div>
                <Label htmlFor="templateDescription">Description</Label>
                <Textarea id="templateDescription" name="description" value={currentFormData.description} onChange={handleFormInputChange} placeholder="Briefly describe what this template is for." />
              </div>
              <div>
                <Label htmlFor="templateType">Template Type</Label>
                <Select name="templateType" value={currentFormData.templateType} onValueChange={(val) => handleSelectChange('templateType', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prompt">Prompt</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="pseudocode">Pseudocode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="templateContent">Template Content (use {{variableName}} for placeholders)</Label>
                <Textarea id="templateContent" name="content" value={currentFormData.content} onChange={handleFormInputChange} placeholder="Your template string here..." className="min-h-[150px] font-mono" />
              </div>
              <div>
                <Label>Fields for Variables</Label>
                {currentFormData.fields.map((field, index) => (
                  <Card key={index} className="p-3 my-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label>Variable Name (in template)</Label><Input value={field.name} onChange={(e) => handleFieldChange(index, 'name', e.target.value)} placeholder="e.g., projectName" /></div>
                      <div><Label>Display Label (in UI)</Label><Input value={field.label} onChange={(e) => handleFieldChange(index, 'label', e.target.value)} placeholder="e.g., Project Name" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Field Type</Label>
                        <Select value={field.type} onValueChange={(val) => handleFieldChange(index, 'type', val)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="textarea">Textarea</SelectItem>
                            <SelectItem value="array">Array (one item per line)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Placeholder (optional)</Label><Input value={field.placeholder || ''} onChange={(e) => handleFieldChange(index, 'placeholder', e.target.value)} /></div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => removeField(index)} disabled={currentFormData.fields.length <=1}>Remove Field</Button>
                  </Card>
                ))}
                <Button variant="outline" size="sm" onClick={addField} className="mt-2">Add Field</Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveTemplate}><Save className="mr-2 h-4 w-4" /> Save Template</Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {templates.length === 0 && <p>No custom templates yet. Click "Add New Template" to create one.</p>}
            {templates.map(template => (
              <Card key={template.id} className="flex justify-between items-center p-3">
                <div>
                  <p className="font-semibold">{template.name} <span className="text-xs text-muted-foreground">({template.templateType})</span></p>
                  <p className="text-sm text-muted-foreground">{template.description || 'No description'}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenForm(template)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteTemplate(template.id, template.name)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
