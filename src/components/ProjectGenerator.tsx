import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { type ArtifactData } from '@/lib/services/db';
import { Copy, Save, GitFork, Users, Code, Layout, Plus, Trash, Shuffle } from 'lucide-react'; // Keep necessary icons
import { getRandomItem } from '@/lib/utils/random';
import { featureImplementations, generateImplementation, type FeatureType } from '@/lib/constants/featureImplementations';

// --- Interfaces ---
interface ProjectFeature {
    id: string;
    name: string;
    description: string;
    implementation?: {
        pattern: string;
        components: string[];
        apis: string[];
        dataModel: string[];
        library: string;
    };
}

interface ProjectData {
    id: string; // Internal ID for the project data itself
    name: string;
    description: string;
    problem: string;
    customers: string;
    customerLocation: string;
    applicationType: string;
    dataModel: string;
    userRole: string;
    features: ProjectFeature[];
    pseudocode: string;
    contributors: string[];
    forks: number;
    stars: number; // Added stars for potential future use
}

interface ProjectGeneratorProps {
    artifact: ArtifactData;
    onSave: (updatedArtifact: ArtifactData) => Promise<void> | void;
    onFork: (artifactToFork: ArtifactData) => Promise<void> | void;
    isTemplate?: boolean; // Flag for when used as a template in Dashboard tabs
}

// --- Default Data ---
const defaultProjectData: ProjectData = {
    id: crypto.randomUUID(),
    name: 'Untitled Project Specification',
    description: '',
    problem: '',
    customers: '',
    customerLocation: '',
    applicationType: 'Web App',
    dataModel: '',
    userRole: '',
    features: [],
    pseudocode: '',
    contributors: ['You'],
    forks: 0,
    stars: 0,
};

// --- Component ---
const ProjectGenerator: React.FC<ProjectGeneratorProps> = ({ artifact, onSave, onFork, isTemplate = false }) => {
    const [project, setProject] = useState<ProjectData>(defaultProjectData);
    const [currentView, setCurrentView] = useState<'generator' | 'code' | 'collaboration'>('generator');
    const [newFeatureName, setNewFeatureName] = useState('');
    const [newFeatureDesc, setNewFeatureDesc] = useState('');

    // --- Load Data ---
    useEffect(() => {
        try {
            if (artifact.content) {
                const parsedData = JSON.parse(artifact.content);
                // Basic validation to ensure it looks like project data
                if (parsedData.name && Array.isArray(parsedData.features)) {
                    setProject(parsedData);
                } else {
                    console.warn("Artifact content doesn't match ProjectData structure, using default.");
                    setProject({ ...defaultProjectData, id: crypto.randomUUID(), name: artifact.title || defaultProjectData.name });
                }
            } else {
                 // If content is empty but it's not a template, use default with artifact title
                 if (!isTemplate) {
                     setProject({ ...defaultProjectData, id: crypto.randomUUID(), name: artifact.title || defaultProjectData.name });
                 } else {
                     // If it IS a template, keep the absolute default
                     setProject(defaultProjectData);
                 }
            }
        } catch (error) {
            console.error("Error parsing project data:", error);
             // Fallback on error
             if (!isTemplate) {
                 setProject({ ...defaultProjectData, id: crypto.randomUUID(), name: artifact.title || defaultProjectData.name });
             } else {
                 setProject(defaultProjectData);
             }
        }
        // Reset view when artifact changes
        setCurrentView('generator');
    }, [artifact, isTemplate]); // Rerun when artifact or template status changes

    // --- Handlers ---
    const handleInputChange = (field: keyof Omit<ProjectData, 'features' | 'contributors' | 'forks' | 'stars' | 'id'>, value: string) => {
        setProject(prev => ({ ...prev, [field]: value }));
    };

    const handleAddFeature = () => {
        if (!newFeatureName.trim()) {
            toast.error("Feature name cannot be empty.");
            return;
        }

        // Try to match feature with known implementations
        const featureType = Object.keys(featureImplementations).find(key =>
            featureImplementations[key as FeatureType].name.toLowerCase() === newFeatureName.toLowerCase()
        ) as FeatureType | undefined;

        const newFeature: ProjectFeature = {
            id: crypto.randomUUID(),
            name: newFeatureName.trim(),
            description: newFeatureDesc.trim(),
            implementation: featureType ? generateImplementation(featureType) : undefined
        };

        setProject(prev => ({ ...prev, features: [...prev.features, newFeature] }));
        setNewFeatureName('');
        setNewFeatureDesc('');
    };

    const handleRemoveFeature = (id: string) => {
        setProject(prev => ({ ...prev, features: prev.features.filter(f => f.id !== id) }));
    };

    const handleSaveClick = async () => {
        const updatedArtifact: ArtifactData = {
            ...artifact,
            title: project.name || 'Untitled Project Specification',
            content: JSON.stringify(project, null, 2),
            language: 'project-spec', // Ensure language is set correctly
            fileType: 'json',        // Ensure fileType is set correctly
            updatedAt: new Date().toISOString(),
        };
        try {
            await onSave(updatedArtifact);
            // toast.success('Project specification saved.'); // Toast handled in Dashboard
        } catch (error) {
            console.error("Failed to save project spec:", error);
            // toast.error('Failed to save project specification.'); // Toast handled in Dashboard
        }
    };

    const handleForkClick = () => {
        onFork(artifact);
    };

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text)
            .then(() => toast.success(`${type} copied to clipboard`))
            .catch(() => toast.error(`Failed to copy ${type}`));
    };

    // --- Random Generation (Simple Example) ---
     const generateRandomProject = () => {
         const problems = ['finding good local events', 'managing team tasks effectively', 'learning new programming languages', 'tracking personal fitness goals'];
         const customers = ['students', 'remote teams', 'developers', 'fitness enthusiasts'];
         const locations = ['urban areas', 'globally', 'university campuses', 'online communities'];
         const appTypes = ['Web App', 'Mobile App (iOS)', 'Mobile App (Android)', 'Cross-Platform App', 'Desktop App', 'API Service'];
         const roles = ['Admin', 'User', 'Moderator', 'Guest', 'Editor'];

         setProject(prev => ({
             ...prev, // Keep existing ID, features, contributors etc.
             name: `Project ${Math.floor(Math.random() * 1000)} Spec`,
             description: `A new project focusing on ${getRandomItem(problems)}.`,
             problem: getRandomItem(problems),
             customers: getRandomItem(customers),
             customerLocation: getRandomItem(locations),
             applicationType: getRandomItem(appTypes),
             userRole: getRandomItem(roles),
             dataModel: '{ "users": [], "posts": [] }', // Simple placeholder
             pseudocode: `function main() {\n  // TODO: Implement core logic\n}`,
         }));
         toast.info("Generated random project details.");
     };


    return (
        <div className="flex flex-col h-full p-4 bg-white rounded-lg shadow overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="text-xl font-bold truncate pr-2" title={project.name}>
                    {project.name || 'Untitled Project'}
                </div>
                <div className="flex space-x-2">
                    <Button size="sm" variant={currentView === 'generator' ? 'default' : 'secondary'} onClick={() => setCurrentView('generator')}>
                        <Layout className="w-4 h-4 mr-1" /> Generator
                    </Button>
                    <Button size="sm" variant={currentView === 'code' ? 'default' : 'secondary'} onClick={() => setCurrentView('code')}>
                        <Code className="w-4 h-4 mr-1" /> Pseudocode
                    </Button>
                    <Button size="sm" variant={currentView === 'collaboration' ? 'default' : 'secondary'} onClick={() => setCurrentView('collaboration')}>
                        <Users className="w-4 h-4 mr-1" /> Collaboration
                    </Button>
                </div>
            </div>

            {/* Main content area with scrolling */}
            <div className="flex-grow overflow-y-auto pr-2 pb-2"> {/* Added pb-2 */}
                {currentView === 'generator' && (
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <Card>
                            <CardHeader><CardTitle>Project Overview</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="proj-name">Project Name</Label>
                                    <Input id="proj-name" value={project.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="E.g., Event Discovery App" />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="proj-desc">Description</Label>
                                    <Textarea id="proj-desc" value={project.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Briefly describe the project's purpose." />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="proj-problem">Problem Statement</Label>
                                    <Textarea id="proj-problem" value={project.problem} onChange={(e) => handleInputChange('problem', e.target.value)} placeholder="What problem does this project solve?" />
                                </div>
                            </CardContent>
                             <CardFooter>
                                <Button variant="outline" size="sm" onClick={generateRandomProject}>
                                    <Shuffle className="w-4 h-4 mr-2" /> Randomize Overview
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Target Audience & Scope */}
                        <Card>
                            <CardHeader><CardTitle>Target & Scope</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="proj-customers">Target Customers</Label>
                                    <Input id="proj-customers" value={project.customers} onChange={(e) => handleInputChange('customers', e.target.value)} placeholder="E.g., University Students" />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="proj-location">Customer Location</Label>
                                    <Input id="proj-location" value={project.customerLocation} onChange={(e) => handleInputChange('customerLocation', e.target.value)} placeholder="E.g., Urban Areas, Online" />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="proj-apptype">Application Type</Label>
                                    <Select value={project.applicationType} onValueChange={(value) => handleInputChange('applicationType', value)}>
                                        <SelectTrigger id="proj-apptype"><SelectValue placeholder="Select type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Web App">Web App</SelectItem>
                                            <SelectItem value="Mobile App (iOS)">Mobile App (iOS)</SelectItem>
                                            <SelectItem value="Mobile App (Android)">Mobile App (Android)</SelectItem>
                                            <SelectItem value="Cross-Platform App">Cross-Platform App</SelectItem>
                                            <SelectItem value="Desktop App">Desktop App</SelectItem>
                                            <SelectItem value="API Service">API Service</SelectItem>
                                            <SelectItem value="CLI Tool">CLI Tool</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="proj-role">Primary User Role</Label>
                                    <Input id="proj-role" value={project.userRole} onChange={(e) => handleInputChange('userRole', e.target.value)} placeholder="E.g., Registered User, Admin" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Data Model */}
                        <Card>
                            <CardHeader><CardTitle>Data Model (Simplified)</CardTitle></CardHeader>
                            <CardContent>
                                <Textarea
                                    value={project.dataModel}
                                    onChange={(e) => handleInputChange('dataModel', e.target.value)}
                                    placeholder='Define main data structures (e.g., JSON, pseudo-schema)\n{\n  "users": [\n    { "id": "string", "name": "string", "email": "string" }\n  ],\n  "events": [\n    { "id": "string", "title": "string", "date": "date", "creatorId": "string" }\n  ]\n}'
                                    rows={6}
                                    className="font-mono text-sm"
                                />
                            </CardContent>
                        </Card>

                        {/* Features */}
                        <Card>
                            <CardHeader><CardTitle>Core Features</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {project.features.length > 0 ? (
                                    <ul className="space-y-3">
                                        {project.features.map(feature => (
                                            <li key={feature.id} className="flex flex-col p-3 border rounded-md bg-muted/50">
                                                <div className="flex justify-between">
                                                    <div>
                                                        <p className="font-medium">{feature.name}</p>
                                                        {feature.description && <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>}
                                                    </div>
                                                    <Button variant="ghost" size="sm" onClick={() => handleRemoveFeature(feature.id)} className="ml-2 text-destructive hover:text-destructive">
                                                        <Trash className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                {feature.implementation && (
                                                    <div className="mt-2 pt-2 border-t text-sm">
                                                        <p><strong>Pattern:</strong> {feature.implementation.pattern}</p>
                                                        <p><strong>Library:</strong> {feature.implementation.library}</p>
                                                        {feature.implementation.components.length > 0 && (
                                                            <p><strong>Components:</strong> {feature.implementation.components.join(', ')}</p>
                                                        )}
                                                        {feature.implementation.apis.length > 0 && (
                                                            <p><strong>APIs:</strong> {feature.implementation.apis.join(', ')}</p>
                                                        )}
                                                        {feature.implementation.dataModel.length > 0 && (
                                                            <p><strong>Data Models:</strong> {feature.implementation.dataModel.join(', ')}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No features added yet.</p>
                                )}
                                <div className="space-y-2 pt-4 border-t">
                                    <Label htmlFor="new-feature-name">New Feature Name</Label>
                                    <Input id="new-feature-name" value={newFeatureName} onChange={(e) => setNewFeatureName(e.target.value)} placeholder="E.g., User Authentication" />
                                    <Label htmlFor="new-feature-desc">Description (Optional)</Label>
                                    <Input id="new-feature-desc" value={newFeatureDesc} onChange={(e) => setNewFeatureDesc(e.target.value)} placeholder="Briefly describe the feature" />
                                    <Button onClick={handleAddFeature} size="sm">
                                        <Plus className="w-4 h-4 mr-1" /> Add Feature
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {currentView === 'code' && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Pseudocode / High-Level Logic</CardTitle>
                             <Button size="sm" variant="ghost" onClick={() => copyToClipboard(project.pseudocode, 'Pseudocode')}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={project.pseudocode}
                                onChange={(e) => handleInputChange('pseudocode', e.target.value)}
                                placeholder="Write high-level logic or pseudocode for core features..."
                                rows={15}
                                className="font-mono text-sm"
                            />
                        </CardContent>
                    </Card>
                )}

                {currentView === 'collaboration' && (
                    <Card>
                        <CardHeader><CardTitle>Collaboration</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Contributors</Label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {project.contributors.map((contributor, index) => (
                                        <Badge key={index} variant="secondary">{contributor}</Badge>
                                    ))}
                                    {/* Add contributor input later if needed */}
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                    <GitFork className="w-4 h-4" />
                                    <span>{project.forks} Forks</span>
                                </div>
                                {/* Stars display if needed */}
                                {/* <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                    <Star className="w-4 h-4" />
                                    <span>{project.stars} Stars</span>
                                </div> */}
                            </div>
                             {/* Fork Button - only show if not a template */}
                             {!isTemplate && (
                                <Button onClick={handleForkClick} variant="outline">
                                    <GitFork className="w-4 h-4 mr-2" /> Fork this Project
                                </Button>
                             )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t flex-shrink-0">
                <Button onClick={handleSaveClick} className="w-full">
                    <Save className="w-4 h-4 mr-2" /> Save Project Specification
                </Button>
            </div>
        </div>
    );
};

export { ProjectGenerator };
// export default ProjectGenerator;
