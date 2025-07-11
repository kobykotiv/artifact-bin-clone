import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Save, Layout, Shuffle } from 'lucide-react';
import { toast } from 'sonner';

interface StartupOrgGeneratorProps {
  onSave: (data: StartupOrgData) => void;
}

interface StartupOrgData {
  companyName: string;
  industry: string;
  companySize: string;
  orgStructure: string;
  departments: Department[];
  roles: Role[];
}

interface Department {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  title: string;
  department: string;
  responsibilities: string[];
  reportingTo?: string;
}

const orgStructureOptions = [
  { label: "Flat Organization", value: "flat" },
  { label: "Hierarchical", value: "hierarchical" },
  { label: "Matrix", value: "matrix" },
  { label: "Team-Based", value: "team" },
  { label: "Functional", value: "functional" }
];

const industrySuggestions = [
  "Technology - SaaS", 
  "FinTech", 
  "Healthcare", 
  "E-commerce", 
  "EdTech", 
  "CleanTech"
];

const defaultDepartments = [
  { id: "exec", name: "Executive", description: "Company leadership and strategic direction" },
  { id: "prod", name: "Product", description: "Product development and management" },
  { id: "eng", name: "Engineering", description: "Technical implementation and infrastructure" },
  { id: "des", name: "Design", description: "UX/UI and product design" },
  { id: "mkt", name: "Marketing", description: "Brand, acquisition, and growth" },
  { id: "sales", name: "Sales", description: "Revenue generation and client relationships" },
  { id: "ops", name: "Operations", description: "Business operations and processes" }
];

const defaultRoles = [
  { 
    id: "ceo", 
    title: "CEO/Founder", 
    department: "exec",
    responsibilities: [
      "Overall company vision and strategy",
      "Fundraising and investor relations",
      "Culture development and leadership"
    ]
  },
  { 
    id: "cto", 
    title: "CTO/Technical Co-Founder", 
    department: "eng",
    responsibilities: [
      "Technical architecture and vision",
      "Engineering team leadership",
      "Technology stack decisions"
    ],
    reportingTo: "ceo"
  },
  { 
    id: "prd", 
    title: "Product Manager", 
    department: "prod",
    responsibilities: [
      "Product roadmap development",
      "Feature prioritization",
      "User research and requirements"
    ],
    reportingTo: "ceo"
  }
];

export function StartupOrgGenerator({ onSave }: StartupOrgGeneratorProps) {
  const [formData, setFormData] = useState<StartupOrgData>({
    companyName: '',
    industry: '',
    companySize: "Small (1-10)",
    orgStructure: "flat",
    departments: [...defaultDepartments],
    roles: [...defaultRoles]
  });

  const [newDepartment, setNewDepartment] = useState<Partial<Department>>({
    name: '',
    description: ''
  });

  const [newRole, setNewRole] = useState<Partial<Role>>({
    title: '',
    department: '',
    responsibilities: ['']
  });

  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  const handleInputChange = (field: keyof StartupOrgData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddDepartment = () => {
    if (!newDepartment.name) {
      toast.error('Department name is required');
      return;
    }

    const id = newDepartment.name.toLowerCase().replace(/\s+/g, '-');
    
    setFormData(prev => ({
      ...prev,
      departments: [
        ...prev.departments,
        {
          id,
          name: newDepartment.name,
          description: newDepartment.description || ''
        }
      ]
    }));
    
    setNewDepartment({ name: '', description: '' });
  };

  const handleAddRole = () => {
    if (!newRole.title || !newRole.department) {
      toast.error('Role title and department are required');
      return;
    }

    const id = newRole.title.toLowerCase().replace(/\s+/g, '-');
    
    setFormData(prev => ({
      ...prev,
      roles: [
        ...prev.roles,
        {
          id,
          title: newRole.title,
          department: newRole.department,
          responsibilities: newRole.responsibilities || [''],
          reportingTo: newRole.reportingTo
        }
      ]
    }));
    
    setNewRole({
      title: '',
      department: '',
      responsibilities: ['']
    });
  };

  const handleRemoveDepartment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.filter(dept => dept.id !== id),
      roles: prev.roles.filter(role => role.department !== id)
    }));
  };

  const handleRemoveRole = (id: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.filter(role => role.id !== id)
    }));
  };

  const handleResponsibilityChange = (index: number, value: string) => {
    setNewRole(prev => {
      const responsibilities = [...(prev.responsibilities || [''])];
      responsibilities[index] = value;
      return { ...prev, responsibilities };
    });
  };

  const addResponsibilityField = () => {
    setNewRole(prev => ({
      ...prev,
      responsibilities: [...(prev.responsibilities || ['']), '']
    }));
  };

  const handleSaveClick = () => {
    if (!formData.companyName) {
      toast.error('Company name is required');
      return;
    }

    onSave(formData);
    toast.success('Organization structure saved');
  };

  const generateRandomOrg = () => {
    const randomCompanyName = `${getRandomItem([
      "Nova", "Apex", "Quantum", "Zenith", "Prism", "Fusion", "Nexus", "Vector"
    ])} ${getRandomItem([
      "Tech", "Systems", "Solutions", "Labs", "Dynamics", "Innovations", "Platform"
    ])}`;

    setFormData({
      companyName: randomCompanyName,
      industry: getRandomItem(industrySuggestions),
      companySize: getRandomItem(["Small (1-10)", "Medium (11-50)", "Large (51-200)"]),
      orgStructure: getRandomItem(orgStructureOptions).value,
      departments: [...defaultDepartments],
      roles: [...defaultRoles]
    });

    toast.success("Generated random organization structure");
  };

  const getRandomItem = <T extends unknown>(items: T[]): T => {
    return items[Math.floor(Math.random() * items.length)];
  };

  const departmentOptions = formData.departments.map(dept => (
    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
  ));

  const roleOptions = formData.roles.map(role => (
    <SelectItem key={role.id} value={role.id}>{role.title}</SelectItem>
  ));

  return (
    <div className="space-y-6 pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Startup Organization Generator</h2>
          <p className="text-muted-foreground">Create your company's organizational structure</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateRandomOrg}>
            <Shuffle className="w-4 h-4 mr-2" />
            Generate Random
          </Button>
          <Button onClick={handleSaveClick}>
            <Save className="w-4 h-4 mr-2" />
            Save Structure
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Basic details about your startup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="e.g., Acme Inc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                placeholder="e.g., SaaS, FinTech, Healthcare"
                list="industry-suggestions"
              />
              <datalist id="industry-suggestions">
                {industrySuggestions.map((industry, i) => (
                  <option key={i} value={industry} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-size">Company Size</Label>
              <Select 
                value={formData.companySize} 
                onValueChange={(value) => handleInputChange('companySize', value)}
              >
                <SelectTrigger id="company-size">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Small (1-10)">Small (1-10 employees)</SelectItem>
                  <SelectItem value="Medium (11-50)">Medium (11-50 employees)</SelectItem>
                  <SelectItem value="Large (51-200)">Large (51-200 employees)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-structure">Organizational Structure</Label>
              <Select 
                value={formData.orgStructure} 
                onValueChange={(value) => handleInputChange('orgStructure', value)}
              >
                <SelectTrigger id="org-structure">
                  <SelectValue placeholder="Select structure" />
                </SelectTrigger>
                <SelectContent>
                  {orgStructureOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Departments Card */}
        <Card>
          <CardHeader>
            <CardTitle>Departments</CardTitle>
            <CardDescription>Define your company's departments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {formData.departments.map(dept => (
                <div key={dept.id} className="flex justify-between items-start p-3 border rounded-md">
                  <div>
                    <div className="font-medium">{dept.name}</div>
                    <div className="text-sm text-muted-foreground">{dept.description}</div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRemoveDepartment(dept.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dept-name">Department Name</Label>
                <Input
                  id="dept-name"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Marketing"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept-desc">Description</Label>
                <Input
                  id="dept-desc"
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., Handle branding and customer acquisition"
                />
              </div>
              <Button onClick={handleAddDepartment}>Add Department</Button>
            </div>
          </CardContent>
        </Card>

        {/* Roles Card - Full Width */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Roles & Responsibilities</CardTitle>
            <CardDescription>Define key positions and reporting structure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {formData.roles.map(role => (
                <div key={role.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-lg">{role.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Department: {formData.departments.find(d => d.id === role.department)?.name || role.department}
                      </div>
                      {role.reportingTo && (
                        <div className="text-sm text-muted-foreground">
                          Reports to: {formData.roles.find(r => r.id === role.reportingTo)?.title || role.reportingTo}
                        </div>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemoveRole(role.id)}
                    >
                      Remove
                    </Button>
                  </div>
                  
                  <div className="mt-2">
                    <div className="font-medium text-sm">Responsibilities:</div>
                    <ul className="list-disc pl-5 mt-1">
                      {role.responsibilities.map((resp, i) => (
                        <li key={i} className="text-sm">{resp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-4">
              <h3 className="font-medium">Add New Role</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role-title">Role Title</Label>
                  <Input
                    id="role-title"
                    value={newRole.title}
                    onChange={(e) => setNewRole(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Product Manager"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role-dept">Department</Label>
                  <Select 
                    value={newRole.department} 
                    onValueChange={(value) => setNewRole(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger id="role-dept">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role-reporting">Reports To (Optional)</Label>
                <Select 
                  value={newRole.reportingTo} 
                  onValueChange={(value) => setNewRole(prev => ({ ...prev, reportingTo: value }))}
                >
                  <SelectTrigger id="role-reporting">
                    <SelectValue placeholder="Select manager (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Responsibilities</Label>
                {newRole.responsibilities?.map((resp, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={resp}
                      onChange={(e) => handleResponsibilityChange(index, e.target.value)}
                      placeholder={`Responsibility ${index + 1}`}
                    />
                    {index === (newRole.responsibilities?.length || 0) - 1 && (
                      <Button variant="outline" type="button" onClick={addResponsibilityField}>
                        +
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button onClick={handleAddRole}>Add Role</Button>
            </div>
          </CardContent>
          <CardFooter className="border-t flex justify-end">
            <Button onClick={handleSaveClick}>
              <Save className="w-4 h-4 mr-2" />
              Save Organization Structure
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
