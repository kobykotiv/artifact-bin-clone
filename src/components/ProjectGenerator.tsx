import React, { useState, useEffect } from 'react';
import { Share2, GitBranch, Code, Save, Download, Users, Layout, Database, UserIcon, Lightbulb, Zap, Copy, Check, Loader2 } from 'lucide-react'; // Added Loader2
// Use ArtifactData type from db service for consistency
import { type ArtifactData } from '@/lib/services/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ProjectGeneratorProps {
    artifact: ArtifactData; // Use ArtifactData type
    onSave: (updatedArtifactData: Partial<ArtifactData>) => Promise<void> | void; // Allow async save
    onFork: (artifactToFork: ArtifactData) => Promise<void> | void; // Allow async fork
}

// Define the structure of the project data stored within artifact.content
interface ProjectState {
    id: string;
    name: string;
    description: string;
    problem: string;
    customers: string;
    customerLocation: string;
    applicationType: string;
    dataModel: string;
    userRole: string;
    features: string[];
    pseudocode: string;
    contributors: string[];
    forks: number;
    stars: number; // Assuming stars might be added later
}


const ProjectGenerator: React.FC<ProjectGeneratorProps> = ({ artifact, onSave, onFork }) => {
    // Function to generate unique IDs
    const generateUniqueId = () => Math.random().toString(36).substr(2, 9);

    // Safely parse artifact content or initialize default project state
    const parseInitialProject = (): ProjectState => { // Return type ProjectState
        try {
            // Use artifact.content which holds the JSON string
            if (artifact.content) {
                const parsed = JSON.parse(artifact.content);
                // Ensure essential fields exist and have correct types
                return {
                    id: parsed.id || generateUniqueId(),
                    name: parsed.name || artifact.title || '',
                    description: parsed.description || '',
                    problem: parsed.problem || '',
                    customers: parsed.customers || '',
                    customerLocation: parsed.customerLocation || '',
                    applicationType: parsed.applicationType || '',
                    dataModel: parsed.dataModel || '',
                    userRole: parsed.userRole || '',
                    features: Array.isArray(parsed.features) ? parsed.features : [],
                    pseudocode: parsed.pseudocode || '',
                    contributors: Array.isArray(parsed.contributors) ? parsed.contributors : ['You'],
                    forks: typeof parsed.forks === 'number' ? parsed.forks : 0,
                    stars: typeof parsed.stars === 'number' ? parsed.stars : 0,
                };
            }
        } catch (e) {
            console.error("Failed to parse artifact content for project generator:", e);
            toast.error("Failed to load project data. Using defaults.");
        }
        // Default state if parsing fails or no content exists
        return {
            id: artifact.id || generateUniqueId(), // Use artifact ID as fallback for project ID initially
            name: artifact.title || 'Untitled Project',
            description: '',
            problem: '',
            customers: '',
            customerLocation: '',
            applicationType: '',
            dataModel: '',
            userRole: '',
            features: [],
            pseudocode: '',
            contributors: ['You'], // Assuming current user is the initial contributor
            forks: 0,
            stars: 0
        };
    };

    // Main state for the project
    const [project, setProject] = useState<ProjectState>(parseInitialProject); // Typed state
    const [isSaving, setIsSaving] = useState(false); // Saving state
    const [isForking, setIsForking] = useState(false); // Forking state

    // State for available options
    const [options] = useState({
        applicationTypes: ['Web Application', 'Mobile App', 'Desktop Application', 'IoT Solution', 'Enterprise System', 'SaaS Platform'],
        dataModels: ['SQL Database', 'NoSQL Database', 'GraphQL', 'REST API', 'Event Sourcing', 'Microservices'],
        userRoles: ['Administrator', 'Customer', 'Content Creator', 'Analyst', 'Manager', 'Developer'],
        features: ['Authentication', 'Payment Processing', 'Data Visualization', 'Reporting', 'Real-time Updates', 'Social Sharing', 'User Management', 'API Integration', 'Machine Learning', 'Search Functionality']
    });

    // State for random idea generation
    const [randomIdeas] = useState([
        'AI-powered inventory management system for small businesses',
        'Collaborative document editor with real-time language translation',
        'Virtual event platform with networking matchmaking',
        'Carbon footprint tracker for supply chains',
        'Healthcare appointment scheduler with predictive analytics',
        'Peer-to-peer skill sharing marketplace'
    ]);

    // State for tracking selected features, derived from project state
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>(project.features);
    const [currentView, setCurrentView] = useState('generator'); // 'generator', 'code', 'collaboration'
    const [copySuccess, setCopySuccess] = useState(false);

    // Update project state if artifact changes externally
    useEffect(() => {
        const initialProject = parseInitialProject();
        setProject(initialProject);
        setSelectedFeatures(initialProject.features);
    }, [artifact.id, artifact.content]); // Re-run if artifact ID or content changes

    // Function to trigger saving the project state back to the artifact
    const saveProjectState = async (updatedProject = project) => {
        setIsSaving(true);
        try {
            // Prepare the data to be saved in the ArtifactData format
            const artifactUpdate: Partial<ArtifactData> = {
                id: artifact.id, // Ensure ID is passed for update
                title: updatedProject.name || 'Untitled Project', // Update artifact title
                content: JSON.stringify(updatedProject, null, 2), // Store project state as JSON string in content
                // language and fileType should remain 'project-spec' and 'json' respectively
            };
            await onSave(artifactUpdate); // Call the async onSave prop
            // toast.success("Project saved successfully!"); // Toast handled in Dashboard after successful save
        } catch (error) {
            console.error("Error saving project state:", error);
            toast.error("Failed to save project.");
        } finally {
            setIsSaving(false);
        }
    };

    // Handle generating a random app idea
    const generateRandomAppIdea = () => {
        // ... (logic for generating random idea) ...
        const randomIndex = Math.floor(Math.random() * randomIdeas.length);
        const appTypeIndex = Math.floor(Math.random() * options.applicationTypes.length);
        const dataModelIndex = Math.floor(Math.random() * options.dataModels.length);
        const userRoleIndex = Math.floor(Math.random() * options.userRoles.length);

        const newProjectBase = {
            ...project, // Keep existing ID, contributors etc. unless explicitly reset
            name: randomIdeas[randomIndex],
            applicationType: options.applicationTypes[appTypeIndex],
            dataModel: options.dataModels[dataModelIndex],
            userRole: options.userRoles[userRoleIndex],
            description: '', problem: '', customers: '', customerLocation: '', pseudocode: '',
        };

        // Generate 2-4 random features
        // ... (feature generation logic) ...
        const featureCount = Math.floor(Math.random() * 3) + 2;
        const randomFeaturesSet = new Set<string>();
        while (randomFeaturesSet.size < featureCount && randomFeaturesSet.size < options.features.length) {
            const randomFeature = options.features[Math.floor(Math.random() * options.features.length)];
            randomFeaturesSet.add(randomFeature);
        }
        const randomFeatures = Array.from(randomFeaturesSet);

        const newProject = { ...newProjectBase, features: randomFeatures };

        setSelectedFeatures(randomFeatures);
        setProject(newProject);
        generatePseudocode(newProject, randomFeatures); // Generate initial pseudocode for the new idea
        // Don't auto-save random idea, let user save explicitly
        // saveProjectState(newProject);
        toast.info("Random idea generated. Review and save if you like it.");
    };

    // Function to fork the current project artifact
    const handleFork = async () => {
        setIsForking(true);
        try {
            // Ensure the latest project state is included in the artifact passed to onFork
            const artifactToFork: ArtifactData = {
                ...artifact,
                content: JSON.stringify(project, null, 2) // Use current project state
            };
            await onFork(artifactToFork); // Call the async onFork prop
            // Toast handled in Dashboard
        } catch (error) {
            console.error("Error forking project:", error);
            toast.error("Failed to fork project.");
        } finally {
            setIsForking(false);
        }
    };

    // Function to generate pseudocode based on selections
    const generatePseudocode = (currentProject = project, features = selectedFeatures) => {
        // ... (pseudocode generation logic remains the same) ...
        const { applicationType, dataModel, userRole, name } = currentProject;
        let pseudocode = `// Project: ${name}\n`;
        pseudocode += `// Application Type: ${applicationType || 'Not Selected'}\n`;
        pseudocode += `// Data Model: ${dataModel || 'Not Selected'}\n`;
        pseudocode += `// Primary User Role: ${userRole || 'Not Selected'}\n\n`;

        pseudocode += `INITIALIZE Application as ${applicationType || 'GenericApp'}\n`;
        pseudocode += `CONFIGURE DataLayer using ${dataModel || 'InMemoryDB'}\n\n`;

        pseudocode += `// User Role: ${userRole || 'DefaultUser'} functionality\n`;
        switch (userRole) {
            case 'Administrator': pseudocode += `DEFINE AdminDashboard\n  WITH UserManagement\n  WITH SystemConfiguration\n  WITH Analytics\nEND DEFINE\n\n`; break;
            case 'Customer': pseudocode += `DEFINE CustomerPortal\n  WITH Profile\n  WITH OrderHistory\n  WITH Recommendations\nEND DEFINE\n\n`; break;
            case 'Content Creator': pseudocode += `DEFINE CreatorWorkspace\n  WITH ContentEditor\n  WITH MediaLibrary\n  WITH PublishingWorkflow\nEND DEFINE\n\n`; break;
            case 'Analyst': pseudocode += `DEFINE AnalyticsDashboard\n  WITH DataVisualization\n  WITH ReportGeneration\n  WITH DataExport\nEND DEFINE\n\n`; break;
            case 'Manager': pseudocode += `DEFINE ManagerConsole\n  WITH TeamOverview\n  WITH PerformanceMetrics\n  WITH ResourceAllocation\nEND DEFINE\n\n`; break;
            case 'Developer': pseudocode += `DEFINE DeveloperEnvironment\n  WITH CodeEditor\n  WITH APITesting\n  WITH VersionControl\nEND DEFINE\n\n`; break;
            default: pseudocode += `DEFINE UserInterface\n  WITH StandardFunctionality\nEND DEFINE\n\n`;
        }

        pseudocode += `// Feature Implementation\n`;
        if (features.includes('Authentication')) pseudocode += `FUNCTION implementAuthentication()\n  SETUP user registration\n  SETUP login/logout\n  IMPLEMENT password reset\n  IMPLEMENT multi-factor authentication\n  SECURE all user data\nEND FUNCTION\n\n`;
        if (features.includes('Payment Processing')) pseudocode += `FUNCTION setupPaymentSystem()\n  CONNECT to payment gateway\n  IMPLEMENT shopping cart\n  HANDLE transaction security\n  MANAGE receipts and invoices\n  PROCESS refunds when needed\nEND FUNCTION\n\n`;
        if (features.includes('Data Visualization')) pseudocode += `FUNCTION createDataVisualizations()\n  COLLECT relevant metrics\n  PROCESS data for visualization\n  GENERATE charts and graphs\n  IMPLEMENT interactive dashboards\n  ALLOW custom report generation\nEND FUNCTION\n\n`;
        if (features.includes('Reporting')) pseudocode += `FUNCTION generateReports()\n  DEFINE report templates\n  GATHER data from ${dataModel || 'DataSource'}\n  FORMAT output based on user preferences\n  SCHEDULE recurring reports\n  EXPORT to multiple formats\nEND FUNCTION\n\n`;
        if (features.includes('Real-time Updates')) pseudocode += `FUNCTION enableRealTimeUpdates()\n  IMPLEMENT WebSocket connections\n  SET UP notification system\n  HANDLE concurrent user actions\n  RESOLVE conflicts\n  OPTIMIZE for performance\nEND FUNCTION\n\n`;
        if (features.includes('Social Sharing')) pseudocode += `FUNCTION addSocialFeatures()\n  CONNECT with social platforms\n  CREATE shareable content links\n  IMPLEMENT content embedding\n  TRACK sharing analytics\n  MANAGE privacy settings\nEND FUNCTION\n\n`;
        if (features.includes('User Management')) pseudocode += `FUNCTION manageUsers()\n  CREATE user profiles\n  ASSIGN roles and permissions\n  HANDLE user lifecycle\n  IMPLEMENT user groups\n  AUDIT user activities\nEND FUNCTION\n\n`;
        if (features.includes('API Integration')) pseudocode += `FUNCTION integrateWithExternalAPIs()\n  IDENTIFY required third-party services\n  CONFIGURE API authentication\n  HANDLE data mapping\n  IMPLEMENT rate limiting\n  CREATE fallback mechanisms\nEND FUNCTION\n\n`;
        if (features.includes('Machine Learning')) pseudocode += `FUNCTION implementMachineLearning()\n  PREPARE training data\n  SELECT appropriate algorithms\n  TRAIN predictive models\n  DEPLOY model to production\n  MONITOR and improve accuracy\nEND FUNCTION\n\n`;
        if (features.includes('Search Functionality')) pseudocode += `FUNCTION buildSearchCapability()\n  INDEX content for search\n  IMPLEMENT filters and sorting\n  OPTIMIZE for performance\n  ADD autocomplete suggestions\n  TRACK search analytics\nEND FUNCTION\n\n`;

        pseudocode += `FUNCTION main()\n  INITIALIZE application\n  SETUP ${dataModel || 'DataSource'}\n  CONFIGURE user permissions for ${userRole || 'DefaultUser'}\n`;
        features.forEach(feature => {
            const functionName = feature.replace(/\s+/g, '').replace(/^./, str => str.toLowerCase());
            let implementFunction = '';
            switch (feature) {
                case 'Authentication': implementFunction = 'implementAuthentication()'; break;
                case 'Payment Processing': implementFunction = 'setupPaymentSystem()'; break;
                case 'Data Visualization': implementFunction = 'createDataVisualizations()'; break;
                case 'Reporting': implementFunction = 'generateReports()'; break;
                case 'Real-time Updates': implementFunction = 'enableRealTimeUpdates()'; break;
                case 'Social Sharing': implementFunction = 'addSocialFeatures()'; break;
                case 'User Management': implementFunction = 'manageUsers()'; break;
                case 'API Integration': implementFunction = 'integrateWithExternalAPIs()'; break;
                case 'Machine Learning': implementFunction = 'implementMachineLearning()'; break;
                case 'Search Functionality': implementFunction = 'buildSearchCapability()'; break;
            }
            if (implementFunction) pseudocode += `  CALL ${implementFunction}\n`;
        });
        pseudocode += `  START application interface\nEND FUNCTION\n\n`;
        pseudocode += `// Execute main function to start the application\nCALL main()\n`;


        const updatedProject = { ...currentProject, pseudocode };
        setProject(updatedProject); // Update state with new pseudocode
    };

    // Handle selecting a feature
    const handleFeatureSelect = (feature: string) => {
        let newSelectedFeatures;
        if (selectedFeatures.includes(feature)) {
            newSelectedFeatures = selectedFeatures.filter(f => f !== feature);
        } else {
            newSelectedFeatures = [...selectedFeatures, feature];
        }
        setSelectedFeatures(newSelectedFeatures);
        // Update the main project state immediately
        setProject(prev => ({ ...prev, features: newSelectedFeatures }));
        // Don't auto-generate pseudocode on feature click, let user trigger it
    };

    // Handle input change for text fields and textareas
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProject(prev => ({ ...prev, [name]: value }));
    };

    // Handle dropdown change
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProject(prev => ({ ...prev, [name]: value }));
    };

    // Handle saving the project
    const handleSave = () => {
        // Ensure pseudocode reflects the latest state before saving
        generatePseudocode(project, selectedFeatures);
        // Use the state *after* generatePseudocode updates it
        setProject(currentProjectState => {
            saveProjectState(currentProjectState);
            return currentProjectState; // Return state for setProject
        });
    };

    // Handle copying the share link
    const handleShare = () => {
        // Use artifact.id for the share link
        const shareUrl = `${window.location.origin}/share/${artifact.id}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopySuccess(true);
            toast.success("Share link copied to clipboard!");
            setTimeout(() => setCopySuccess(false), 2000);
        }, (err) => {
            console.error('Failed to copy share link: ', err);
            toast.error("Failed to copy share link.");
        });
    };

    // Handle downloading pseudocode
    const downloadPseudocode = () => {
        // Ensure pseudocode is current before download
        generatePseudocode();
        setProject(currentProjectState => {
            const blob = new Blob([currentProjectState.pseudocode], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${currentProjectState.name.replace(/\s+/g, '_') || 'project'}_pseudocode.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            return currentProjectState;
        });
    };


    return (
        // Add overflow-hidden to the main container if needed, or manage scrolling internally
        <div className="flex flex-col h-full p-4 bg-white rounded-lg shadow overflow-hidden">
            {/* Header with navigation */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                {/* ... existing header content ... */}
                <div className="text-xl font-bold truncate pr-2" title={project.name}>
                    {project.name || 'Project Generator'}
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
                    <div> {/* Removed flex-grow and overflow-y-auto from here */}
                        {/* Random Idea Generator */}
                        <div className="bg-blue-50 rounded-lg p-4 mb-6">
                            <h2 className="text-xl font-semibold text-blue-800 mb-3">Generate Random Business App Idea</h2>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center w-full"
                                onClick={generateRandomAppIdea}
                            >
                                <Lightbulb className="w-5 h-5 mr-2" /> Generate Random App Idea
                            </Button>
                        </div>

                        {/* Project Name */}
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Project Name
                            </label>
                            <Input
                                type="text"
                                name="name"
                                value={project.name}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                placeholder="Enter project name"
                            />
                        </div>

                        {/* Project Description */}
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Description
                            </label>
                            <Textarea
                                name="description"
                                value={project.description}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                placeholder="Describe your project"
                                rows={2}
                            />
                        </div>

                        {/* Application Type */}
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">
                                <Layout className="w-4 h-4 inline mr-1" /> Application Type
                            </label>
                            <select
                                name="applicationType"
                                value={project.applicationType}
                                onChange={handleSelectChange}
                                className="w-full p-2 border rounded bg-white"
                            >
                                <option value="">Select Application Type</option>
                                {options.applicationTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Data Model */}
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">
                                <Database className="w-4 h-4 inline mr-1" /> Data Model
                            </label>
                            <select
                                name="dataModel"
                                value={project.dataModel}
                                onChange={handleSelectChange}
                                className="w-full p-2 border rounded bg-white"
                            >
                                <option value="">Select Data Model</option>
                                {options.dataModels.map(model => (
                                    <option key={model} value={model}>{model}</option>
                                ))}
                            </select>
                        </div>

                        {/* User Role */}
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">
                                <UserIcon className="w-4 h-4 inline mr-1" /> Primary User Role
                            </label>
                            <select
                                name="userRole"
                                value={project.userRole}
                                onChange={handleSelectChange}
                                className="w-full p-2 border rounded bg-white"
                            >
                                <option value="">Select User Role</option>
                                {options.userRoles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>

                        {/* Features */}
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">
                                <Zap className="w-4 h-4 inline mr-1" /> Features (Select multiple)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {options.features.map(feature => (
                                    <div
                                        key={feature}
                                        onClick={() => handleFeatureSelect(feature)}
                                        className={`p-2 border rounded cursor-pointer text-sm ${selectedFeatures.includes(feature) ? 'bg-blue-100 border-blue-500 font-medium' : 'hover:bg-gray-50'}`}
                                    >
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Problem Statement */}
                        <div className="mt-6 mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">
                                What problem are you solving?
                            </label>
                            <Textarea
                                name="problem"
                                value={project.problem}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                placeholder="Describe the problem your project addresses"
                                rows={3}
                            />
                        </div>

                        {/* Customer Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Who are your customers?
                                </label>
                                <Textarea
                                    name="customers"
                                    value={project.customers}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    placeholder="Describe your target users/audience"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Where are they located?
                                </label>
                                <Textarea
                                    name="customerLocation"
                                    value={project.customerLocation}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    placeholder="Geographic location, online communities, etc."
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {currentView === 'code' && (
                    <div className="flex-grow flex flex-col h-full"> {/* Ensure this takes height */}
                        <div className="flex justify-between items-center mb-2 flex-shrink-0">
                            <h2 className="text-lg font-semibold">Generated Pseudocode</h2>
                            <Button variant="outline" size="sm" onClick={downloadPseudocode}>
                                <Download className="w-4 h-4 mr-1" /> Download
                            </Button>
                        </div>
                        {/* Make pre take remaining height */}
                        <pre className="bg-gray-900 text-green-400 p-3 rounded overflow-auto flex-grow font-mono text-xs">
                            {project.pseudocode || "// Configure project options and click 'Generate/Update Pseudocode'"}
                        </pre>
                    </div>
                )}

                {currentView === 'collaboration' && (
                    <div> {/* Removed flex-grow and overflow-y-auto from here */}
                        {/* ... existing collaboration view content ... */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Project Details</h2>
                                <div className="bg-gray-50 p-4 rounded space-y-1 text-sm border">
                                    <p><strong>Project ID:</strong> <code className="text-xs">{project.id}</code></p>
                                    <p><strong>Artifact ID:</strong> <code className="text-xs">{artifact.id}</code></p>
                                    <p><strong>Name:</strong> {project.name || 'N/A'}</p>
                                    <p><strong>Type:</strong> {project.applicationType || 'N/A'}</p>
                                    <p><strong>Contributors:</strong> {project.contributors.join(', ')}</p>
                                    <p><strong>Forks:</strong> {project.forks}</p>
                                </div>

                                <h3 className="text-lg font-semibold mt-6 mb-2">Collaboration Actions</h3>
                                <div className="flex flex-wrap gap-2">
                                    <Button variant="outline" onClick={handleFork} disabled={isForking}>
                                        {isForking ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <GitBranch className="w-4 h-4 mr-1" />} Fork Project
                                    </Button>
                                    <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                                        {isSaving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} Save Current State
                                    </Button>
                                    <Button variant="outline" onClick={handleShare}>
                                        {copySuccess ? <Check className="w-4 h-4 mr-1 text-green-600" /> : <Share2 className="w-4 h-4 mr-1" />} Share Link
                                    </Button>
                                </div>
                            </div>
                            {/* ... other collaboration sections ... */}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer with action buttons */}
            <div className="mt-4 flex justify-between pt-4 border-t flex-shrink-0">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Project Artifact
                </Button>
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => generatePseudocode()} // Directly call generation
                    >
                        <Code className="w-4 h-4 mr-2" /> Generate/Update Pseudocode
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleFork}
                        disabled={isForking}
                    >
                        {isForking ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <GitBranch className="w-4 h-4 mr-1" />} Fork
                    </Button>
                    {/* Share button might be redundant if also in collaboration tab */}
                    {/* <Button variant="outline" onClick={handleShare}>
                        {copySuccess ? <Check className="w-4 h-4 mr-1" /> : <Share2 className="w-4 h-4 mr-1" />} Share
                    </Button> */}
                </div>
            </div>
        </div>
    );
};

export default ProjectGenerator;
