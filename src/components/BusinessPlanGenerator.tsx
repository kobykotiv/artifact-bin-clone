import { useState, useEffect, useCallback } from 'react'; // Add useCallback
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
// ... other imports ...
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
// Use relative paths for context-menu and checkbox
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from './ui/context-menu';
import { cn } from '@/lib/utils'; '@/lib/utils'; // Import getRandomItem from utils
import { Label } from '@/components/ui/label';
import { Checkbox } from "@radix-ui/react-checkbox";
// NEW Icons for new tabs
import { DollarSign, PieChart, Building, Target, Zap, ArrowUpRight, Save, Shuffle, ArrowRight, Copy, BarChart, Server, FileText, FolderTree, Trash, Edit, RotateCw, Layers, Database, GitBranchPlus, Users, Settings, GitBranch, GitCommit, GitFork, Layout, ListTodo, Network, Briefcase, Lightbulb, BarChart3, Code } from 'lucide-react'; // Add Objective icons and others
import { toast } from 'sonner';
import { type ArtifactData } from '@/lib/services/db'; // Import ArtifactData type

// Add imports for guides
import { corporationSetupGuide } from '@/lib/businessGuides/corporationSetup';
import { termSheetGuide } from '@/lib/businessGuides/termSheet';

import {
  goalVerbs,
  goalMetrics,
  goalTargets,
  timeframes,
  objectiveAreas,
  growthStrategies,
  actionVerbs,
  actionTargets,
  kpiMetrics
} from '@/lib/constants/objectives';

// Rename props interface
interface BusinessPlanGeneratorProps {
  artifact: ArtifactData;
  onSave: (updatedArtifact: ArtifactData) => Promise<void> | void;
  isTemplate?: boolean; // Keep isTemplate if used
  // Add onFork if needed by other parts, though not directly used in this refactor
  onFork?: (artifactToFork: ArtifactData) => Promise<void> | void;
}

// --- Data Interfaces ---

// NEW: Placeholder interfaces for new sections
interface BudgetPlanData {
  revenueProjection: string;
  costOfGoodsSold: string;
  operatingExpenses: string;
  fundingNeeds: string;
}

interface SharesPlanData {
  totalShares: string;
  founderShares: string;
  employeePool: string;
  investorShares: string;
}

// REVISED: StartupPlanData with checklist
interface StartupPlanData {
  companyName: string;
  legalStructure: string;
  incorporationState: string;
  registeredAgent: string;
  checklist: {
    einObtained: boolean;
    bankAccountOpened: boolean;
    domainRegistered: boolean;
    founderAgreements: boolean;
  };
}

// NEW: Interface for Objectives based on schema
interface ObjectivesPlanData {
  goalVerb: string;
  goalMetric: string;
  goalTarget: string;
  timeframe: string;
  objectiveArea: string;
  growthStrategy: string;
  actionVerb: string;
  actionTarget: string;
  kpiMetric: string;
}

// Define MarketingPlanData based on schema
interface MarketingPlanData {
  audience: string;
  campaignType: string;
  channel: string;
  budget: string;
  kpi: string;
  timeline: string;
}

// Define FundraisingPlanData based on schema
interface FundraisingPlanData {
  stage: string;
  amount: string;
  useOfFunds: string;
  sector: string;
  closeDate: string;
  checklist: {
    pitchDeck: boolean;
    financials: boolean;
    marketAnalysis: boolean;
    teamBios: boolean;
  };
}

// --- Default Data ---

// NEW: Default values for new sections
const defaultBudgetPlanData: BudgetPlanData = {
  revenueProjection: '$100K Year 1',
  costOfGoodsSold: '20%',
  operatingExpenses: '$50K Year 1',
  fundingNeeds: '$250K Seed',
};

const defaultSharesPlanData: SharesPlanData = {
  totalShares: '10,000,000',
  founderShares: '60%',
  employeePool: '15%',
  investorShares: '25%',
};

// REVISED: Default StartupPlanData with checklist
const defaultStartupPlanData: StartupPlanData = {
  companyName: 'NewCo Inc.',
  legalStructure: 'Delaware C-Corp',
  incorporationState: 'Delaware',
  registeredAgent: 'Standard Agent Services',
  checklist: {
    einObtained: false,
    bankAccountOpened: false,
    domainRegistered: false,
    founderAgreements: false,
  },
};

// NEW: Default ObjectivesPlanData
const defaultObjectivesPlanData: ObjectivesPlanData = {
  goalVerb: 'increase',
  goalMetric: 'user engagement',
  goalTarget: 'by 25%',
  timeframe: 'in Q1',
  objectiveArea: 'product development',
  growthStrategy: 'content marketing',
  actionVerb: 'launch',
  actionTarget: 'new feature set',
  kpiMetric: 'daily active users',
};

// Define default values based on schema
const defaultMarketingPlanData: MarketingPlanData = {
  audience: 'Gen Z creators',
  campaignType: 'awareness',
  channel: 'TikTok ads',
  budget: '$5,000',
  kpi: 'signups',
  timeline: 'Q2 2025',
};

const defaultFundraisingPlanData: FundraisingPlanData = {
  stage: 'Seed',
  amount: '$500K',
  useOfFunds: 'hiring engineers',
  sector: 'devtools',
  closeDate: 'Q3 2025',
  checklist: {
    pitchDeck: false,
    financials: false,
    marketAnalysis: false,
    teamBios: false,
  },
};

// --- Slot Machine Data (Keep for Pitch, Tech Stack, Media Tracking) ---
// Define option categories for the madlib generator (Pitch)
const productDescriptors = ['cutting-edge', 'game-changing', 'enterprise-grade', 'revolutionary', 'innovative', 'next-generation'];
const productTypes = ['travel', 'messaging', 'shopping', 'productivity', 'social networking', 'educational'];
const targetAudiences = ['Gen Z', 'entrepreneurs', 'remote workers', 'students', 'small businesses', 'creative professionals'];
const problemsSolved = ['time management', 'information overload', 'content discovery', 'decision fatigue', 'communication barriers', 'knowledge gaps'];
const businessModels = ['subscription model', 'freemium approach', 'SaaS platform', 'marketplace model', 'ad-supported service'];
const revenueModels = ['freemium', 'subscription-based', 'SAAS', 'transaction-based', 'ad-supported', 'white-label'];
const focusAreas = ['lifetime value', 'revenue growth', 'return on investment', 'transactions processed', 'social impact', 'user retention'];
const competitorTypes = ['Big Tech incumbents', 'well-funded startups', 'DIY alternatives', 'open-source solutions', 'indirect competitors'];
const advantages = ['economies of scale', 'proprietary algorithms', 'network effects', 'first-mover advantage', 'domain expertise'];
const fundingTypes = ['bootstrapped', 'self-funded', 'angel-backed', 'venture-funded', 'strategically partnered'];
const teamDescriptors = ['product-focused minds', 'industry veterans', 'technical innovators', 'design-led creators', 'cross-functional experts'];
const achievements = ['rapid user growth', 'strong word-of-mouth', 'industry recognition', 'product-market fit', 'strategic partnerships'];
const marketActions = ['disrupt', 'accelerate', 'transform', 'revolutionize', 'reimagine'];

// Options for funding round generator (Used in Pitch)
const fundingRounds = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D', 'Series E', 'Growth Equity'];
const fundingAmounts = ['$1M', '$2.5M', '$5M', '$10M', '$25M', '$50M', '$100M', '$250M'];
const investorTypes = ['angel investors', 'seed funds', 'venture capital firms', 'strategic investors', 'growth equity firms'];
const fundingReasons = ['expand market share', 'accelerate growth', 'develop new products', 'enter new markets', 'scale operations'];

// Tech stack options
const projectScales = ['monorepo', 'multi-repo', 'microservices', 'monolith', 'serverless'];
const frontendFrameworks = ['React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'React Native', 'Flutter'];
const backendFrameworks = ['Node.js/Express', 'Django', 'Ruby on Rails', 'Spring Boot', 'Laravel', 'FastAPI', 'NestJS'];
const databases = ['PostgreSQL', 'MongoDB', 'MySQL', 'Firebase', 'DynamoDB', 'Redis', 'Supabase'];
const devOpsTools = ['GitHub Actions', 'CircleCI', 'Jenkins', 'GitLab CI', 'Travis CI', 'Terraform', 'Docker', 'Kubernetes'];
const cloudProviders = ['AWS', 'Google Cloud', 'Azure', 'Vercel', 'Netlify', 'Digital Ocean', 'Heroku'];
const testingFrameworks = ['Jest', 'Cypress', 'Playwright', 'Selenium', 'Mocha', 'Pytest', 'JUnit'];

// Media tracking system options
const industrySegments = ['Financial Advisory', 'Asset Management', 'Investment Banking', 'Wealth Management', 'Insurance', 'Credit Unions', 'Retail Banking'];
const complianceTypes = ['KYC Documentation', 'AML Reports', 'Risk Assessments', 'Regulatory Filings', 'Audit Trails', 'Disclosure Statements', 'Client Agreements'];
const trackingMethods = ['Automated Alerts', 'Scheduled Reviews', 'Real-time Monitoring', 'Batch Processing', 'Exception-based Reporting', 'Document Expiration Tracking'];
const analyticsFeatures = ['Dashboard Visualization', 'Trend Analysis', 'Risk Scoring', 'Compliance Health Metrics', 'Document Aging Reports', 'Regulatory Deadline Tracking'];
const workflowSteps = ['Document Collection', 'Initial Review', 'Approval Process', 'Client Notification', 'Periodic Review', 'Exception Handling', 'Archiving'];
const userRoles = ['Compliance Officer', 'Financial Advisor', 'Branch Manager', 'System Administrator', 'Auditor', 'Client Service Representative'];
const integrationPoints = ['CRM Systems', 'Document Management', 'Email Services', 'Calendar Systems', 'Regulatory Databases', 'Electronic Signature', 'Client Portal'];
const securityFeatures = ['Role-based Access Control', 'Audit Logging', 'Data Encryption', 'Two-factor Authentication', 'IP Restrictions', 'Session Timeouts'];

// --- Helper Functions ---
const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

// --- Slot Machine Component ---
interface SlotMachineProps {
  options: string[];
  label: string;
  value: string;
  onChange: (newValue: string) => void;
}

function SlotMachine({ options, label, value, onChange }: SlotMachineProps) {
  const currentIndex = options.indexOf(value);
  const getRandomOption = () => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * options.length);
    } while (randomIndex === currentIndex && options.length > 1);
    onChange(options[randomIndex]);
  };

  return (
    <div className="flex flex-col space-y-1 mb-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">{label}</label>
        <Button size="sm" variant="ghost" onClick={getRandomOption}>
          <RotateCw className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="relative">
        <div className="border rounded-md p-2 h-[38px] flex items-center bg-background">
          <span>{value}</span>
        </div>
      </div>
    </div>
  );
}

// Rename component function
export const BusinessPlanGenerator: React.FC<BusinessPlanGeneratorProps> = ({ artifact, onSave, isTemplate = false }: BusinessPlanGeneratorProps) => { // Added isTemplate back
  // Define a key for localStorage
  const LOCAL_STORAGE_KEY = 'businessPlanGeneratorState';
  // State for Pitch (using SlotMachine)
  // ...existing code...
  const [productDescriptor, setProductDescriptor] = useState(getRandomItem(productDescriptors));
  const [productType, setProductType] = useState(getRandomItem(productTypes));
  const [targetAudience, setTargetAudience] = useState(getRandomItem(targetAudiences));
  const [problemSolved, setProblemSolved] = useState(getRandomItem(problemsSolved));
  const [businessModel, setBusinessModel] = useState(getRandomItem(businessModels));
  const [revenueModel, setRevenueModel] = useState(getRandomItem(revenueModels));
  const [focusArea, setFocusArea] = useState(getRandomItem(focusAreas));
  const [competitorType, setCompetitorType] = useState(getRandomItem(competitorTypes));
  const [advantage, setAdvantage] = useState(getRandomItem(advantages));
  const [fundingType, setFundingType] = useState(getRandomItem(fundingTypes));
  const [teamDescriptor, setTeamDescriptor] = useState(getRandomItem(teamDescriptors));
  const [achievement, setAchievement] = useState(getRandomItem(achievements));
  const [marketAction, setMarketAction] = useState(getRandomItem(marketActions));
  const [customPitch, setCustomPitch] = useState('');

  // State for Tech Stack (using SlotMachine)
  // ...existing code...
  const [projectScale, setProjectScale] = useState(getRandomItem(projectScales));
  const [frontendFramework, setFrontendFramework] = useState(getRandomItem(frontendFrameworks));
  const [backendFramework, setBackendFramework] = useState(getRandomItem(backendFrameworks));
  const [database, setDatabase] = useState(getRandomItem(databases));
  const [devOpsTool, setDevOpsTool] = useState(getRandomItem(devOpsTools));
  const [cloudProvider, setCloudProvider] = useState(getRandomItem(cloudProviders));
  const [testingFramework, setTestingFramework] = useState(getRandomItem(testingFrameworks));
  const [customTechStack, setCustomTechStack] = useState('');

  // State for Media Tracking (using SlotMachine)
  // ...existing code...
  const [industrySegment, setIndustrySegment] = useState(getRandomItem(industrySegments));
  const [complianceType, setComplianceType] = useState(getRandomItem(complianceTypes));
  const [trackingMethod, setTrackingMethod] = useState(getRandomItem(trackingMethods));
  const [analyticsFeature, setAnalyticsFeature] = useState(getRandomItem(analyticsFeatures));
  const [workflowStep, setWorkflowStep] = useState(getRandomItem(workflowSteps));
  const [userRole, setUserRole] = useState(getRandomItem(userRoles));
  const [integrationPoint, setIntegrationPoint] = useState(getRandomItem(integrationPoints));
  const [securityFeature, setSecurityFeature] = useState(getRandomItem(securityFeatures));
  const [customMediaTracking, setCustomMediaTracking] = useState('');

  // State for Marketing Plan (structured data)
  const [marketingPlanData, setMarketingPlanData] = useState<MarketingPlanData>(defaultMarketingPlanData);
  const [customMarketingPlan, setCustomMarketingPlan] = useState('');

  // State for Fundraising Plan (structured data)
  const [fundraisingPlanData, setFundraisingPlanData] = useState<FundraisingPlanData>(defaultFundraisingPlanData);
  const [customFundraisingPlan, setCustomFundraisingPlan] = useState('');

  // NEW: State for new sections (structured data)
  const [budgetPlanData, setBudgetPlanData] = useState<BudgetPlanData>(defaultBudgetPlanData);
  const [customBudgetPlan, setCustomBudgetPlan] = useState('');
  const [sharesPlanData, setSharesPlanData] = useState<SharesPlanData>(defaultSharesPlanData);
  const [customSharesPlan, setCustomSharesPlan] = useState('');
  const [startupPlanData, setStartupPlanData] = useState<StartupPlanData>(defaultStartupPlanData);
  const [customStartupPlan, setCustomStartupPlan] = useState('');
  const [objectivesPlanData, setObjectivesPlanData] = useState<ObjectivesPlanData>(defaultObjectivesPlanData);
  const [customObjectivesPlan, setCustomObjectivesPlan] = useState('');

  // General State
  const [activeTab, setActiveTab] = useState('marketing'); // Default to marketing
  const [repos, setRepos] = useState<GitRepository[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<GitFile | null>(null);
  const [isNewRepoDialogOpen, setIsNewRepoDialogOpen] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false);
  const [isNewDirDialogOpen, setIsNewDirDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newDirName, setNewDirName] = useState('');
  const [fileContent, setFileContent] = useState('');

  // Presets state
  const [presets] = useState<ArtifactPreset[]>([
    {
      id: '1',
      title: 'Marketing Plan',
      description: 'A complete marketing strategy template with pitch, funding, and objectives',
      type: 'marketing', // Use 'marketing' to match tab
      iconComponent: <BarChart className="h-10 w-10 text-blue-500" />,
      content: JSON.stringify({
        marketingPlanData: defaultMarketingPlanData,
        fundraisingPlanData: defaultFundraisingPlanData, // Include defaults for related sections
        objectivesPlanData: defaultObjectivesPlanData,
        // Add default text generation if needed
        marketingPlanText: `Marketing Plan:\n- Target Audience: ${defaultMarketingPlanData.audience}\n- Campaign Type: ${defaultMarketingPlanData.campaignType}\n- Primary Channel: ${defaultMarketingPlanData.channel}\n- Budget: ${defaultMarketingPlanData.budget}\n- Key KPI: ${defaultMarketingPlanData.kpi}\n- Timeline: ${defaultMarketingPlanData.timeline}`,
        fundraisingPlanText: `Fundraising Plan:\n- Stage: ${defaultFundraisingPlanData.stage}\n- Target Amount: ${defaultFundraisingPlanData.amount}\n- Use of Funds: ${defaultFundraisingPlanData.useOfFunds}\n- Target Sector: ${defaultFundraisingPlanData.sector}\n- Target Close Date: ${defaultFundraisingPlanData.closeDate}`,
        objectivesPlanText: `Primary Goal: ${defaultObjectivesPlanData.goalVerb} ${defaultObjectivesPlanData.goalMetric} ${defaultObjectivesPlanData.goalTarget} ${defaultObjectivesPlanData.timeframe}.\n\nStrategy: Focus on ${defaultObjectivesPlanData.objectiveArea} to drive sustainable growth through ${defaultObjectivesPlanData.growthStrategy}.\n\nKey Action: ${defaultObjectivesPlanData.actionVerb} a ${defaultObjectivesPlanData.actionTarget} to accelerate adoption and improve user experience.\n\nKPI Tracking: Measure success through ${defaultObjectivesPlanData.kpiMetric} with weekly reporting and analysis.`,
      })
    },
    {
      id: '2',
      title: 'Tech Stack Documentation',
      description: 'Technical architecture and implementation details',
      type: 'technical', // Use 'techstack' to match tab
      iconComponent: <Server className="h-10 w-10 text-green-500" />,
      content: JSON.stringify({
        // Add default tech stack options if needed
        techStack: "# Technology Stack\n\n## Architecture\nWe recommend a microservices architecture...\n\n## Frontend\nFor the frontend, we'll use React...\n\n## Backend\nThe backend will be powered by Node.js/Express...\n\n## Database\nWe'll use MongoDB...\n\n## Deployment & DevOps\nThe solution will be deployed to AWS using GitHub Actions..."
      })
    },
    {
      id: '3',
      title: 'Media Tracking System',
      description: 'Compliance document management system for financial services',
      type: 'system', // Use 'mediatracking' to match tab
      iconComponent: <FileText className="h-10 w-10 text-violet-500" />,
      content: JSON.stringify({
        // Add default media tracking options if needed
        mediaTracking: "# Media Tracking System for Wealth Management\n\nA comprehensive compliance document management system...\n\n## Automated Workflow\n\nThe system implements a streamlined workflow...\n\n## Data Model\n\n* Users: Managed through role-based permissions...\n* Compliance Documents: Centralized repository for ${complianceType}...\n* Settings: Configurable thresholds and ${securityFeature}...\n* Analytics: ${analyticsFeature}...\n\n## Integrations\n\nSeamless connectivity with ${integrationPoint}...\n\n## Security & Compliance\n\nOur system implements ${securityFeature}..."
      })
    }
  ]);

  // --- LocalStorage Persistence ---
  // Load state from localStorage on initial mount
  useEffect(() => {
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Selectively restore state to avoid overwriting artifact data initially
        if (parsedState.marketingPlanData) setMarketingPlanData(parsedState.marketingPlanData);
        if (parsedState.fundraisingPlanData) setFundraisingPlanData(parsedState.fundraisingPlanData);
        if (parsedState.budgetPlanData) setBudgetPlanData(parsedState.budgetPlanData);
        if (parsedState.sharesPlanData) setSharesPlanData(parsedState.sharesPlanData);
        if (parsedState.startupPlanData) setStartupPlanData(parsedState.startupPlanData);
        if (parsedState.objectivesPlanData) setObjectivesPlanData(parsedState.objectivesPlanData);
        // Restore custom text if needed, but prioritize artifact content later
        // if (parsedState.customMarketingPlan) setCustomMarketingPlan(parsedState.customMarketingPlan);
        // ... etc for other custom texts ...
      } catch (error) {
        console.error("Failed to parse state from localStorage", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted data
      }
    }
  }, []);

  // Save state to localStorage whenever relevant data changes
  useEffect(() => {
    const stateToSave = {
      marketingPlanData,
      fundraisingPlanData,
      budgetPlanData,
      sharesPlanData,
      startupPlanData,
      objectivesPlanData,
      // Include custom text if you want to persist edits across sessions,
      // but be mindful this might conflict with loading from artifact,
      // customMarketingPlan,
      // customFundraisingPlan,
      // customBudgetPlan,
      // customSharesPlan,
      // customStartupPlan,
      // customObjectivesPlan,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [marketingPlanData, fundraisingPlanData, budgetPlanData, sharesPlanData, startupPlanData, objectivesPlanData /*, custom texts if included */]);

  // --- Generation Functions ---

  // Generate pitch from selected options (using SlotMachine state)
  // ...existing code...
  const generatePitch = () => {
    return `We're building a ${productDescriptor} ${productType} app for ${targetAudience} that solves ${problemSolved} through our ${businessModel}. Our ${revenueModel} model focuses on ${focusArea} with a clear advantage over ${competitorType} through our ${advantage}. Backed by ${fundingType}, our team of ${teamDescriptor} has already achieved ${achievement} as we ${marketAction} the industry.`;
  };

  // Generate tech stack recommendation (using SlotMachine state)
  // ...existing code...
  const generateTechStack = () => {
    const architectureSection = `## Architecture\nWe recommend a ${projectScale} architecture...`;
    const frontendSection = `## Frontend\nFor the frontend, we'll use ${frontendFramework}...`;
    const backendSection = `## Backend\nThe backend will be powered by ${backendFramework}...`;
    const databaseSection = `## Database\nWe'll use ${database}...`;
    const deploymentSection = `## Deployment & DevOps\nThe solution will be deployed to ${cloudProvider} using ${devOpsTool}...`;
    return `# Technology Stack\n\n${architectureSection}\n\n${frontendSection}\n\n${backendSection}\n\n${databaseSection}\n\n${deploymentSection}`;
  };

  // Generate media tracking system content (using SlotMachine state)
  // ...existing code...
  const generateMediaTracking = () => {
    const overviewSection = `# Media Tracking System for ${industrySegment}\n\nA comprehensive compliance document management...`;
    const workflowSection = `## Automated Workflow\n\nThe system implements a streamlined workflow that begins with ${workflowStep}...`;
    const dataModelSection = `## Data Model\n\n* Users: Managed through role-based permissions for ${userRole}s...\n* Compliance Documents: Centralized repository for ${complianceType}...\n* Settings: Configurable thresholds and ${securityFeature}...\n* Analytics: ${analyticsFeature}...`;
    const integrationSection = `## Integrations\n\nSeamless connectivity with ${integrationPoint}...`;
    const securitySection = `## Security & Compliance\n\nOur system implements ${securityFeature}...`;
    return `${overviewSection}\n\n${workflowSection}\n\n${dataModelSection}\n\n${integrationSection}\n\n${securitySection}`;
  };

  // REVISED: generateMarketingPlanText based on structured data
  const generateMarketingPlanText = () => {
    const { audience, campaignType, channel, budget, kpi, timeline } = marketingPlanData;
    return `Marketing Plan:\n- Target Audience: ${audience}\n- Campaign Type: ${campaignType}\n- Primary Channel: ${channel}\n- Budget: ${budget}\n- Key KPI: ${kpi}\n- Timeline: ${timeline}`;
  };

  // REVISED: generateFundraisingPlanText based on structured data
  const generateFundraisingPlanText = () => {
    const { stage, amount, useOfFunds, sector, closeDate } = fundraisingPlanData;
    return `Fundraising Plan:\n- Stage: ${stage}\n- Target Amount: ${amount}\n- Use of Funds: ${useOfFunds}\n- Target Sector: ${sector}\n- Target Close Date: ${closeDate}`;
  };

  // NEW: Placeholder generation functions for new sections
  const generateBudgetPlanText = () => {
    const { revenueProjection, costOfGoodsSold, operatingExpenses, fundingNeeds } = budgetPlanData;
    return `Budget Overview:\n- Revenue Projection: ${revenueProjection}\n- COGS: ${costOfGoodsSold}\n- Operating Expenses: ${operatingExpenses}\n- Funding Needs: ${fundingNeeds}`;
  };

  const generateSharesPlanText = () => {
    const { totalShares, founderShares, employeePool, investorShares } = sharesPlanData;
    return `Shares Structure:\n- Total Shares: ${totalShares}\n- Founder Allocation: ${founderShares}\n- Employee Option Pool: ${employeePool}\n- Investor Allocation: ${investorShares}`;
  };

  // REVISED: generateStartupPlanText (remains mostly the same, just uses the data)
  const generateStartupPlanText = () => {
    const { companyName, legalStructure, incorporationState, registeredAgent } = startupPlanData;
    return `Company Setup:\n- Name: ${companyName}\n- Structure: ${legalStructure}\n- State: ${incorporationState}\n- Agent: ${registeredAgent}`;
  };

  // REVISED: generateObjectives based on structured data
  const generateObjectivesPlanText = () => {
    const { goalVerb, goalMetric, goalTarget, timeframe, objectiveArea, growthStrategy, actionVerb, actionTarget, kpiMetric } = objectivesPlanData;
    const primaryGoal = `Primary Goal: ${goalVerb} ${goalMetric} ${goalTarget} ${timeframe}.`;
    const strategy = `Strategy: Focus on ${objectiveArea} to drive sustainable growth through ${growthStrategy}.`;
    const keyAction = `Key Action: ${actionVerb} a ${actionTarget} to accelerate adoption and improve user experience.`;
    const kpi = `KPI Tracking: Measure success through ${kpiMetric} with weekly reporting and analysis.`;
    return `${primaryGoal}\n\n${strategy}\n\n${keyAction}\n\n${kpi}`;
  };

  // --- Random Generation Functions ---

  // Generate random pitch (updates SlotMachine state)
  // ...existing code...
  const generateRandomPitch = () => {
    setProductDescriptor(getRandomItem(productDescriptors));
    setProductType(getRandomItem(productTypes));
    setTargetAudience(getRandomItem(targetAudiences));
    setProblemSolved(getRandomItem(problemsSolved));
    setBusinessModel(getRandomItem(businessModels));
    setRevenueModel(getRandomItem(revenueModels));
    setFocusArea(getRandomItem(focusAreas));
    setCompetitorType(getRandomItem(competitorTypes));
    setAdvantage(getRandomItem(advantages));
    setFundingType(getRandomItem(fundingTypes));
    setTeamDescriptor(getRandomItem(teamDescriptors));
    setAchievement(getRandomItem(achievements));
    setMarketAction(getRandomItem(marketActions));
    setCustomPitch('');
  };

  // Generate random tech stack (updates SlotMachine state)
  // ...existing code...
  const generateRandomTechStack = () => {
    setProjectScale(getRandomItem(projectScales));
    setFrontendFramework(getRandomItem(frontendFrameworks));
    setBackendFramework(getRandomItem(backendFrameworks));
    setDatabase(getRandomItem(databases));
    setDevOpsTool(getRandomItem(devOpsTools));
    setCloudProvider(getRandomItem(cloudProviders));
    setTestingFramework(getRandomItem(testingFrameworks));
    setCustomTechStack('');
  };

  // Generate random media tracking (updates SlotMachine state)
  // ...existing code...
  const generateRandomMediaTracking = () => {
    setIndustrySegment(getRandomItem(industrySegments));
    setComplianceType(getRandomItem(complianceTypes));
    setTrackingMethod(getRandomItem(trackingMethods));
    setAnalyticsFeature(getRandomItem(analyticsFeatures));
    setWorkflowStep(getRandomItem(workflowSteps));
    setUserRole(getRandomItem(userRoles));
    setIntegrationPoint(getRandomItem(integrationPoints));
    setSecurityFeature(getRandomItem(securityFeatures));
    setCustomMediaTracking('');
  };

  // REVISED: generateRandomMarketingPlan to update structured data
  const generateRandomMarketingPlan = () => {
    const audiences = ['Gen Z creators', 'early-stage founders', 'enterprise clients', 'developers', 'designers'];
    const campaignTypes = ['awareness', 'conversion', 'retargeting', 'lead generation', 'brand building'];
    const channels = ['TikTok ads', 'LinkedIn outreach', 'podcast sponsorships', 'SEO', 'content marketing', 'Twitter'];
    const budgets = ['$5,000', '$10,000', '$25,000', '$50,000', '$100,000'];
    const kpis = ['signups', 'MQLs', 'demo requests', 'website traffic', 'conversion rate', 'CAC'];
    const timelines = ['Q1 2025', 'Q2 2025', 'next 60 days', 'next 90 days', 'end of fiscal year'];

    setMarketingPlanData({
      audience: getRandomItem(audiences),
      campaignType: getRandomItem(campaignTypes),
      channel: getRandomItem(channels),
      budget: getRandomItem(budgets),
      kpi: getRandomItem(kpis),
      timeline: getRandomItem(timelines),
    });
    setCustomMarketingPlan('');
  };

  // REVISED: generateRandomFundraisingPlan to update structured data and reset checklist
  const generateRandomFundraisingPlan = () => {
    const stages = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Bridge', 'Series C'];
    const amounts = ['$250K', '$500K', '$1M', '$2M', '$5M', '$10M', '$20M'];
    const uses = ['hiring engineers', 'marketing expansion', 'AI infrastructure', 'product development', 'sales team growth'];
    const sectors = ['devtools', 'climate tech', 'AI SaaS', 'fintech', 'health tech', 'e-commerce'];
    const closeDates = ['Q3 2025', 'Q4 2025', 'August 2025', 'end of year', 'within 3 months'];

    setFundraisingPlanData({
      stage: getRandomItem(stages),
      amount: getRandomItem(amounts),
      useOfFunds: getRandomItem(uses),
      sector: getRandomItem(sectors),
      closeDate: getRandomItem(closeDates),
      checklist: { // Reset checklist
        pitchDeck: false,
        financials: false,
        marketAnalysis: false,
        teamBios: false,
      }
    });
    setCustomFundraisingPlan('');
  };

  // NEW: Placeholder random generation functions
  const generateRandomBudgetPlan = () => {
    setBudgetPlanData({
      revenueProjection: `$${Math.floor(Math.random() * 900 + 100)}K Year 1`,
      costOfGoodsSold: `${Math.floor(Math.random() * 30 + 10)}%`,
      operatingExpenses: `$${Math.floor(Math.random() * 100 + 20)}K Year 1`,
      fundingNeeds: `$${Math.floor(Math.random() * 1000 + 100)}K ${getRandomItem(['Seed', 'Pre-seed', 'Angel'])}`,
    });
    setCustomBudgetPlan('');
  };

  const generateRandomSharesPlan = () => {
    setSharesPlanData({
      totalShares: '10,000,000', // Keep total constant for simplicity
      founderShares: `${Math.floor(Math.random() * 30 + 50)}%`,
      employeePool: `${Math.floor(Math.random() * 10 + 10)}%`,
      investorShares: `${Math.floor(Math.random() * 15 + 15)}%`, // Note: percentages might not add up perfectly
    });
    setCustomSharesPlan('');
  };

  // REVISED: generateRandomStartupPlan to reset checklist
  const generateRandomStartupPlan = () => {
    setStartupPlanData({
      companyName: `${getRandomItem(['Quantum', 'Synergy', 'Apex', 'Nova', 'Zenith'])} ${getRandomItem(['Labs', 'Solutions', 'Group', 'Ventures', 'Systems'])} Inc.`,
      legalStructure: getRandomItem(['Delaware C-Corp', 'LLC', 'S-Corp']),
      incorporationState: getRandomItem(['Delaware', 'Wyoming', 'Nevada', 'California']),
      registeredAgent: getRandomItem(['Standard Agent Services', 'CorpNet', 'IncFile Agent']),
      checklist: { // Reset checklist
        einObtained: false,
        bankAccountOpened: false,
        domainRegistered: false,
        founderAgreements: false,
      }
    });
    setCustomStartupPlan('');
  };

  // REVISED: generateRandomObjectives to update structured data
  const generateRandomObjectivesPlan = () => {
    const goalVerbs = ['increase', 'improve', 'optimize', 'enhance', 'grow', 'reduce'];
    const goalMetrics = ['user engagement', 'retention', 'revenue', 'market share', 'satisfaction'];
    const goalTargets = ['by 25%', 'by 50%', 'by 2X', 'significantly', 'year-over-year'];
    const timeframes = ['in Q1', 'in Q2', 'by EOY', 'within 6 months'];
    const objectiveAreas = ['product', 'marketing', 'sales', 'operations'];
    const growthStrategies = ['viral marketing', 'content marketing', 'partnerships', 'product-led growth'];
    const actionVerbs = ['launch', 'implement', 'deploy', 'develop', 'create', 'expand'];
    const actionTargets = ['new feature', 'campaign', 'onboarding flow', 'premium tier', 'referral program'];
    const kpiMetrics = ['DAU', 'MRR', 'CLV', 'retention rate', 'conversion rate', 'NPS'];

    setObjectivesPlanData({
      goalVerb: getRandomItem(goalVerbs),
      goalMetric: getRandomItem(goalMetrics),
      goalTarget: getRandomItem(goalTargets),
      timeframe: getRandomItem(timeframes),
      objectiveArea: getRandomItem(objectiveAreas),
      growthStrategy: getRandomItem(growthStrategies),
      actionVerb: getRandomItem(actionVerbs),
      actionTarget: getRandomItem(actionTargets),
      kpiMetric: getRandomItem(kpiMetrics),
    });
    setCustomObjectivesPlan('');
  };

  // --- Utility Functions ---
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied to clipboard'))
      .catch(() => toast.error('Failed to copy'));
  };

  // --- Save Handler ---
  const handleSave = async () => {
    // Prevent saving if it's just a template view
    if (isTemplate) {
      toast.info("Cannot save a template. Create a new artifact from this template first.");
      return;
    }

    try {
      const content = {
        // Keep existing sections using SlotMachines
        pitch: customPitch || generatePitch(),
        techStack: customTechStack || generateTechStack(),
        mediaTracking: customMediaTracking || generateMediaTracking(),

        // Add structured data and generated text for plan sections
        marketingPlanText: customMarketingPlan || generateMarketingPlanText(),
        marketingPlanData: marketingPlanData,
        fundraisingPlanText: customFundraisingPlan || generateFundraisingPlanText(),
        fundraisingPlanData: fundraisingPlanData,
        budgetPlanText: customBudgetPlan || generateBudgetPlanText(),
        budgetPlanData: budgetPlanData,
        sharesPlanText: customSharesPlan || generateSharesPlanText(),
        sharesPlanData: sharesPlanData,
        startupPlanText: customStartupPlan || generateStartupPlanText(),
        startupPlanData: startupPlanData,
        objectivesPlanText: customObjectivesPlan || generateObjectivesPlanText(),
        objectivesPlanData: objectivesPlanData,

        // Keep existing options (for SlotMachine sections)
        options: {
          productDescriptor, productType, targetAudience, problemSolved, businessModel, revenueModel,
          focusArea, competitorType, advantage, fundingType, teamDescriptor, achievement, marketAction,
          // fundingRound, fundingAmount, investorType, fundingReason, // These were only used in the old funding tab
          projectScale, frontendFramework, backendFramework, database, devOpsTool, cloudProvider, testingFramework,
          industrySegment, complianceType, trackingMethod, analyticsFeature, workflowStep, userRole, integrationPoint, securityFeature
        }
      };

      const updatedArtifact = {
        ...artifact,
        // Use a more specific title if possible, or keep generic
        title: artifact.title.includes('Template') ? 'Business Plan' : artifact.title,
        language: 'project-spec',
        fileType: 'json',
        content: JSON.stringify(content, null, 2),
        updatedAt: new Date().toISOString(), // Update timestamp
      };

      await onSave(updatedArtifact);
      // Toast handled in Dashboard
    } catch (error) {
      console.error('Failed to save business plan:', error);
      toast.error('Failed to save business plan');
    }
  };

  // --- Data Loading Effect ---
  useEffect(() => {
    // This effect now runs *after* the localStorage load effect
    try {
      if (artifact.content) {
        const content = JSON.parse(artifact.content);

        // Load custom text overrides first
        if (content.pitch) setCustomPitch(content.pitch);
        if (content.techStack) setCustomTechStack(content.techStack);
        if (content.mediaTracking) setCustomMediaTracking(content.mediaTracking);
        if (content.marketingPlanText) setCustomMarketingPlan(content.marketingPlanText);
        if (content.fundraisingPlanText) setCustomFundraisingPlan(content.fundraisingPlanText);
        if (content.budgetPlanText) setCustomBudgetPlan(content.budgetPlanText);
        if (content.sharesPlanText) setCustomSharesPlan(content.sharesPlanText);
        if (content.startupPlanText) setCustomStartupPlan(content.startupPlanText);
        if (content.objectivesPlanText) setCustomObjectivesPlan(content.objectivesPlanText);
        else if (content.objectives) setCustomObjectivesPlan(content.objectives); // Backward compatibility

        // Load structured data (overwrites defaults and potentially localStorage)
        if (content.marketingPlanData) setMarketingPlanData(content.marketingPlanData);
        if (content.fundraisingPlanData) setFundraisingPlanData(content.fundraisingPlanData);
        if (content.budgetPlanData) setBudgetPlanData(content.budgetPlanData);
        if (content.sharesPlanData) setSharesPlanData(content.sharesPlanData);
        if (content.startupPlanData) setStartupPlanData(content.startupPlanData);
        if (content.objectivesPlanData) setObjectivesPlanData(content.objectivesPlanData);

        // Load slot machine values if available (for Pitch, Tech Stack, Media Tracking)
        const options = content.options || {};
        if (options.productDescriptor) setProductDescriptor(options.productDescriptor);
        if (options.productType) setProductType(options.productType);
        if (options.targetAudience) setTargetAudience(options.targetAudience);
        if (options.problemSolved) setProblemSolved(options.problemSolved);
        if (options.businessModel) setBusinessModel(options.businessModel);
        if (options.revenueModel) setRevenueModel(options.revenueModel);
        if (options.focusArea) setFocusArea(options.focusArea);
        if (options.competitorType) setCompetitorType(options.competitorType);
        if (options.advantage) setAdvantage(options.advantage);
        if (options.fundingType) setFundingType(options.fundingType);
        if (options.teamDescriptor) setTeamDescriptor(options.teamDescriptor);
        if (options.achievement) setAchievement(options.achievement);
        if (options.marketAction) setMarketAction(options.marketAction);
        if (options.projectScale) setProjectScale(options.projectScale);
        if (options.frontendFramework) setFrontendFramework(options.frontendFramework);
        if (options.backendFramework) setBackendFramework(options.backendFramework);
        if (options.database) setDatabase(options.database);
        if (options.devOpsTool) setDevOpsTool(options.devOpsTool);
        if (options.cloudProvider) setCloudProvider(options.cloudProvider);
        if (options.testingFramework) setTestingFramework(options.testingFramework);
        if (options.industrySegment) setIndustrySegment(options.industrySegment);
        if (options.complianceType) setComplianceType(options.complianceType);
        if (options.trackingMethod) setTrackingMethod(options.trackingMethod);
        if (options.analyticsFeature) setAnalyticsFeature(options.analyticsFeature);
        if (options.workflowStep) setWorkflowStep(options.workflowStep);
        if (options.userRole) setUserRole(options.userRole);
        if (options.integrationPoint) setIntegrationPoint(options.integrationPoint);
        if (options.securityFeature) setSecurityFeature(options.securityFeature);
      } else {
        // Reset to defaults if artifact content is empty
        setCustomPitch('');
        setCustomTechStack('');
        setCustomMediaTracking('');
        setCustomMarketingPlan('');
        setMarketingPlanData(defaultMarketingPlanData);
        setCustomFundraisingPlan('');
        setFundraisingPlanData(defaultFundraisingPlanData);
        setCustomBudgetPlan('');
        setBudgetPlanData(defaultBudgetPlanData);
        setCustomSharesPlan('');
        setSharesPlanData(defaultSharesPlanData);
        setCustomStartupPlan('');
        setStartupPlanData(defaultStartupPlanData);
        setCustomObjectivesPlan('');
        setObjectivesPlanData(defaultObjectivesPlanData);
        // Reset SlotMachine states if needed
        generateRandomPitch();
        generateRandomTechStack();
        generateRandomMediaTracking();
      }
    } catch (error) {
      console.error('Error loading business plan data from artifact:', error);
      // Optionally reset state on error
      setMarketingPlanData(defaultMarketingPlanData);
      setFundraisingPlanData(defaultFundraisingPlanData);
      setBudgetPlanData(defaultBudgetPlanData);
      setSharesPlanData(defaultSharesPlanData);
      setStartupPlanData(defaultStartupPlanData);
      setObjectivesPlanData(defaultObjectivesPlanData);
    }
  }, [artifact]); // Depend only on artifact

  // --- Generated Text Variables ---
  const generatedPitch = generatePitch();
  const generatedTechStack = generateTechStack();
  const generatedMediaTracking = generateMediaTracking();
  const generatedMarketingPlan = generateMarketingPlanText();
  const generatedFundraisingPlan = generateFundraisingPlanText();
  const generatedBudgetPlan = generateBudgetPlanText();
  const generatedSharesPlan = generateSharesPlanText();
  const generatedStartupPlan = generateStartupPlanText();
  const generatedObjectivesPlan = generateObjectivesPlanText();

  // --- Git Explorer Functions (Keep as is) ---
  // ... createRepository, createFile, createDirectory, findFile, handleFileSelect, saveFileChanges, handleDelete, navigateToDirectory, navigateUp, getCurrentDirectory, renderDirectory ...

  // Load GitExplorer data from localStorage
  // ...existing code...
  useEffect(() => {
    const savedRepos = localStorage.getItem('gitExplorerRepos');
    if (savedRepos) {
      try {
        setRepos(JSON.parse(savedRepos));
      } catch (error) {
        console.error('Failed to parse saved repositories', error);
      }
    } else {
      // Initialize with a sample repo if needed
    }
  }, []);

  // Save repos to localStorage whenever they change
  // ...existing code...
  useEffect(() => {
    if (repos.length > 0) {
      localStorage.setItem('gitExplorerRepos', JSON.stringify(repos));
    }
  }, [repos]);

  // Create new repository
  // ...existing code...
  const createRepository = () => {
    if (!newRepoName.trim()) {
      toast.error('Repository name cannot be empty');
      return;
    }
    const newRepo: GitRepository = {
      id: crypto.randomUUID(),
      name: newRepoName.trim(),
      lastModified: new Date().toISOString(),
      rootDirectory: {
        id: crypto.randomUUID(),
        name: 'root',
        files: [
          {
            id: crypto.randomUUID(),
            name: 'README.md',
            content: `# ${newRepoName.trim()}`,
            lastModified: new Date().toISOString()
          }
        ],
        directories: [],
        lastModified: new Date().toISOString()
      }
    };
    setRepos([...repos, newRepo]);
    setSelectedRepoId(newRepo.id);
    setSelectedPath([]);
    setNewRepoName('');
    setIsNewRepoDialogOpen(false);
    toast.success(`Repository '${newRepoName.trim()}' created`);
  };

  // Create new file
  // ...existing code...
  const createFile = () => {
    if (!selectedRepoId || !newFileName.trim()) {
      toast.error('File name cannot be empty');
      return;
    }
    const newFile: GitFile = {
      id: crypto.randomUUID(),
      name: newFileName.trim(),
      content: '',
      lastModified: new Date().toISOString()
    };
    const findAndUpdateDirectory = (dir: GitDirectory, path: string[]): GitDirectory => {
      if (path.length === 0) {
        return {
          ...dir,
          files: [...dir.files, newFile],
          lastModified: new Date().toISOString()
        };
      }
      return {
        ...dir,
        directories: dir.directories.map((d, i) => d.id === path[0] ? findAndUpdateDirectory(d, path.slice(1)) : d),
        lastModified: new Date().toISOString()
      };
    };
    setRepos(repos.map(repo => repo.id !== selectedRepoId ? repo : {
      ...repo,
      rootDirectory: findAndUpdateDirectory(repo.rootDirectory, selectedPath),
      lastModified: new Date().toISOString()
    }));
    setNewFileName('');
    setIsNewFileDialogOpen(false);
    toast.success(`File '${newFileName.trim()}' created`);
  };

  // Create new directory
  // ...existing code...
  const createDirectory = () => {
    if (!selectedRepoId || !newDirName.trim()) {
      toast.error('Directory name cannot be empty');
      return;
    }
    const newDir: GitDirectory = {
      id: crypto.randomUUID(),
      name: newDirName.trim(),
      files: [],
      directories: [],
      lastModified: new Date().toISOString()
    };
    const findAndUpdateDirectory = (dir: GitDirectory, path: string[]): GitDirectory => {
      if (path.length === 0) {
        return {
          ...dir,
          directories: [...dir.directories, newDir],
          lastModified: new Date().toISOString()
        };
      }
      return {
        ...dir,
        directories: dir.directories.map((d, i) => d.id === path[0] ? findAndUpdateDirectory(d, path.slice(1)) : d),
        lastModified: new Date().toISOString()
      };
    };
    setRepos(repos.map(repo => repo.id !== selectedRepoId ? repo : {
      ...repo,
      rootDirectory: findAndUpdateDirectory(repo.rootDirectory, selectedPath),
      lastModified: new Date().toISOString()
    }));
    setNewDirName('');
    setIsNewDirDialogOpen(false);
    toast.success(`Directory '${newDirName.trim()}' created`);
  };

  // Find file by path
  // ...existing code...
  const findFile = (repo: GitRepository, fileId: string): GitFile | null => {
    let result: GitFile | null = null;
    const searchDirectory = (dir: GitDirectory) => {
      dir.files.forEach(f => {
        if (f.id === fileId) result = f;
      });
      if (result) return;
      dir.directories.forEach(d => {
        searchDirectory(d);
        if (result) return;
      });
    };
    searchDirectory(repo.rootDirectory);
    return result;
  };

  // Handle file selection
  // ...existing code...
  const handleFileSelect = (fileId: string) => {
    const currentRepo = repos.find(repo => repo.id === selectedRepoId);
    if (!currentRepo) return;
    const file = findFile(currentRepo, fileId);
    if (file) {
      setSelectedFile(file);
      setFileContent(file.content);
    }
  };

  // Save file changes
  // ...existing code...
  const saveFileChanges = () => {
    if (!selectedFile || !selectedRepoId) return;
    const updateFileInDirectory = (dir: GitDirectory, fileId: string): GitDirectory => {
      const fileIndex = dir.files.findIndex(f => f.id === fileId);
      if (fileIndex !== -1) {
        const updatedFiles = [...dir.files];
        updatedFiles[fileIndex] = {
          ...dir.files[fileIndex],
          content: fileContent,
          lastModified: new Date().toISOString()
        };
        return {
          ...dir,
          files: updatedFiles,
          lastModified: new Date().toISOString()
        };
      }
      return {
        ...dir,
        directories: dir.directories.map(subDir => updateFileInDirectory(subDir, fileId)),
        lastModified: new Date().toISOString()
      };
    };
    setRepos(repos.map(repo => repo.id !== selectedRepoId ? repo : {
      ...repo,
      rootDirectory: updateFileInDirectory(repo.rootDirectory, selectedFile.id),
      lastModified: new Date().toISOString()
    }));
    setSelectedFile(prev => prev ? {
      ...prev,
      content: fileContent,
      lastModified: new Date().toISOString()
    } : null);
    toast.success(`File '${selectedFile.name}' saved`);
  };

  // Delete file or directory
  // ...existing code...
  const handleDelete = (itemId: string, isDirectory: boolean) => {
    const deleteFromDirectory = (dir: GitDirectory, id: string, isDir: boolean): GitDirectory => {
      if (isDir) {
        return {
          ...dir,
          directories: dir.directories.filter(d => d.id !== id),
          lastModified: new Date().toISOString()
        };
      }
      return {
        ...dir,
        files: dir.files.filter(f => f.id !== id),
        lastModified: new Date().toISOString()
      };
    };
    const findAndDeleteFromDirectory = (dir: GitDirectory, path: string[]): GitDirectory => {
      if (path.length === 0) {
        return deleteFromDirectory(dir, itemId, isDirectory);
      }
      const [currentDirId, ...rest] = path;
      return {
        ...dir,
        directories: dir.directories.map(d => d.id === currentDirId ? findAndDeleteFromDirectory(d, rest) : d),
        lastModified: new Date().toISOString()
      };
    };
    if (selectedRepoId) {
      setRepos(repos.map(repo => repo.id !== selectedRepoId ? repo : {
        ...repo,
        rootDirectory: findAndDeleteFromDirectory(repo.rootDirectory, selectedPath),
        lastModified: new Date().toISOString()
      }));
      if (selectedFile?.id === itemId) {
        setSelectedFile(null);
        setFileContent('');
      }
      toast.success(`${isDirectory ? 'Directory' : 'File'} deleted`);
    }
  };

  // Go to directory
  // ...existing code...
  const navigateToDirectory = (dirId: string) => {
    setSelectedPath([...selectedPath, dirId]);
    setSelectedFile(null);
    setFileContent('');
  };

  // Go up one level
  // ...existing code...
  const navigateUp = () => {
    if (selectedPath.length === 0) {
      setSelectedRepoId(null);
    } else {
      setSelectedPath(selectedPath.slice(0, -1));
    }
    setSelectedFile(null);
    setFileContent('');
  };

  // Get current directory
  // ...existing code...
  const getCurrentDirectory = (): GitDirectory | null => {
    const repo = repos.find(r => r.id === selectedRepoId);
    if (!repo) return null;
    let currentDir = repo.rootDirectory;
    for (const dirId of selectedPath) {
      const nextDir = currentDir.directories.find(d => d.id === dirId);
      if (!nextDir) return null;
      currentDir = nextDir;
    }
    return currentDir;
  };

  // File explorer component
  // ...existing code...
  const renderDirectory = (dir: GitDirectory | null) => {
    if (!dir) return null;
    return (
      <div className="space-y-1">
        {dir.directories.map(subDir => (
          <ContextMenu key={subDir.id}>
            <ContextMenuTrigger>
              <div className="flex items-center gap-2 p-1.5 hover:bg-muted rounded-md cursor-pointer" onClick={() => navigateToDirectory(subDir.id)}>
                <FolderTree className="w-4 h-4 text-amber-500" /> <span>{subDir.name}</span>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => navigateToDirectory(subDir.id)}><FolderTree className="w-4 h-4 mr-2" /> Open Directory</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => handleDelete(subDir.id, true)} className="text-destructive"><Trash className="w-4 h-4 mr-2" /> Delete Directory</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
        {dir.files.map(file => (
          <ContextMenu key={file.id}>
            <ContextMenuTrigger>
              <div className={cn("flex items-center gap-2 p-1.5 hover:bg-muted rounded-md cursor-pointer", selectedFile?.id === file.id ? "bg-muted" : "")} onClick={() => handleFileSelect(file.id)}>
                <FileText className="w-4 h-4 text-blue-500" /> <span>{file.name}</span>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => handleFileSelect(file.id)}><Edit className="w-4 h-4 mr-2" /> Edit File</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => handleDelete(file.id, false)} className="text-destructive"><Trash className="w-4 h-4 mr-2" /> Delete File</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>
    );
  };

  // --- Preset Application ---
  const applyPreset = (preset: ArtifactPreset) => {
    try {
      const presetContent = JSON.parse(preset.content);
      // Update state with preset content for all relevant sections
      if (presetContent.pitch) setCustomPitch(presetContent.pitch);
      if (presetContent.marketingPlanData) setMarketingPlanData(presetContent.marketingPlanData);
      if (presetContent.marketingPlanText) setCustomMarketingPlan(presetContent.marketingPlanText);
      if (presetContent.fundraisingPlanData) setFundraisingPlanData(presetContent.fundraisingPlanData);
      if (presetContent.fundraisingPlanText) setCustomFundraisingPlan(presetContent.fundraisingPlanText);
      if (presetContent.budgetPlanData) setBudgetPlanData(presetContent.budgetPlanData);
      if (presetContent.budgetPlanText) setCustomBudgetPlan(presetContent.budgetPlanText);
      if (presetContent.sharesPlanData) setSharesPlanData(presetContent.sharesPlanData);
      if (presetContent.sharesPlanText) setCustomSharesPlan(presetContent.sharesPlanText);
      if (presetContent.startupPlanData) setStartupPlanData(presetContent.startupPlanData);
      if (presetContent.startupPlanText) setCustomStartupPlan(presetContent.startupPlanText);
      if (presetContent.objectivesPlanData) setObjectivesPlanData(presetContent.objectivesPlanData);
      if (presetContent.objectivesPlanText) setCustomObjectivesPlan(presetContent.objectivesPlanText);
      if (presetContent.techStack) setCustomTechStack(presetContent.techStack);
      if (presetContent.mediaTracking) setCustomMediaTracking(presetContent.mediaTracking);
      toast.success(`Applied '${preset.title}' preset`);
      // Navigate to relevant tab based on preset type
      if (preset.type === 'marketing') setActiveTab('marketing');
      else if (preset.type === 'funding') setActiveTab('funding');
      else if (preset.type === 'budget') setActiveTab('budget');
      else if (preset.type === 'shares') setActiveTab('shares');
      else if (preset.type === 'startup') setActiveTab('startup');
      else if (preset.type === 'objectives') setActiveTab('objectives');
      else if (preset.type === 'technical') setActiveTab('techstack');
      else if (preset.type === 'system') setActiveTab('mediatracking');
      else setActiveTab('pitch'); // Default fallback
    } catch (error) {
      console.error("Failed to apply preset:", error);
      toast.error("Failed to apply preset");
    }
  };

  // --- Input Handlers ---
  const handleMarketingDataChange = (field: keyof MarketingPlanData, value: string) => {
    setMarketingPlanData(prev => ({ ...prev, [field]: value }));
  };

  const handleFundraisingDataChange = (field: keyof Omit<FundraisingPlanData, 'checklist'>, value: string) => {
    setFundraisingPlanData(prev => ({ ...prev, [field]: value }));
  };

  const handleFundraisingChecklistChange = (field: keyof FundraisingPlanData['checklist'], checked: boolean) => {
    setFundraisingPlanData(prev => ({
      ...prev,
      checklist: { ...prev.checklist, [field]: checked }
    }));
  };

  const handleBudgetDataChange = (field: keyof BudgetPlanData, value: string) => {
    setBudgetPlanData(prev => ({ ...prev, [field]: value }));
  };

  const handleSharesDataChange = (field: keyof SharesPlanData, value: string) => {
    setSharesPlanData(prev => ({ ...prev, [field]: value }));
  };

  const handleStartupDataChange = (field: keyof Omit<StartupPlanData, 'checklist'>, value: string) => {
    setStartupPlanData(prev => ({ ...prev, [field]: value }));
  };

  const handleStartupChecklistChange = (field: keyof StartupPlanData['checklist'], checked: boolean) => {
    setStartupPlanData(prev => ({
      ...prev,
      checklist: { ...prev.checklist, [field]: checked }
    }));
  };

  const handleObjectivesDataChange = (field: keyof ObjectivesPlanData, value: string) => {
    setObjectivesPlanData(prev => ({ ...prev, [field]: value }));
  };

  // --- Render ---
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 gap-4 border-b">
        <div>
          {/* Update Title */}
          <h2 className="text-2xl font-bold">{isTemplate ? `${artifact.title}` : 'Business Plan Generator'}</h2>
          <p className="text-muted-foreground">
            {isTemplate ? 'Use this template to create a new business plan artifact.' : 'Create and manage various business planning documents'}
          </p>
        </div>
        {/* Disable save button if it's a template */}
        <Button onClick={handleSave} disabled={isTemplate}>
          <Save className="w-4 h-4 mr-2" /> {isTemplate ? 'Save Disabled (Template)' : 'Save Plan'}
        </Button>
      </div>

      <div className="flex-grow p-4 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 flex-wrap h-auto justify-start">
            {/* Keep existing tabs */}
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="pitch">Pitch</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="funding">Fundraising</TabsTrigger>
            {/* NEW Tabs */}
            <TabsTrigger value="budget"><DollarSign className="w-4 h-4 mr-1" />Budget</TabsTrigger>
            <TabsTrigger value="shares"><PieChart className="w-4 h-4 mr-1" />Shares</TabsTrigger>
            <TabsTrigger value="startup"><Building className="w-4 h-4 mr-1" />Startup</TabsTrigger>
            <TabsTrigger value="objectives"><Target className="w-4 h-4 mr-1" />Objectives</TabsTrigger> {/* Added Icon */}
            <TabsTrigger value="techstack">Tech Stack</TabsTrigger>
            <TabsTrigger value="mediatracking">Media Tracking</TabsTrigger>
            <TabsTrigger value="git">Git Explorer</TabsTrigger>
            <TabsTrigger value="corporation"><Building className="w-4 h-4 mr-1" />Corporation Setup</TabsTrigger>
            <TabsTrigger value="termsheet"><FileText className="w-4 h-4 mr-1" />Term Sheet</TabsTrigger>
          </TabsList>

          {/* Presets Tab */}
          <TabsContent value="presets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Artifact Presets</CardTitle>
                <CardDescription>Get started quickly with these pre-configured templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {presets.map(preset => (
                    <Card key={preset.id} className="transition-all hover:shadow-md">
                      <CardHeader className="pb-2">
                        <div className="flex justify-center">{preset.iconComponent}</div>
                        <CardTitle className="text-center">{preset.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{preset.description}</p>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full" onClick={() => applyPreset(preset)}>
                          Use This Template
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pitch Tab (Uses SlotMachine) */}
          <TabsContent value="pitch" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generated Pitch</CardTitle>
                <CardDescription>Your auto-generated elevator pitch based on selected parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md relative group">
                  <p>{customPitch || generatedPitch}</p>
                  <Button size="sm" variant="ghost" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(customPitch || generatedPitch)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={generateRandomPitch}>
                  <Shuffle className="w-4 h-4 mr-2" /> Generate Random
                </Button>
                <Button variant="outline" onClick={() => setCustomPitch(generatedPitch)} disabled={!!customPitch}>
                  <ArrowRight className="w-4 h-4 mr-2" /> Use as Template
                </Button>
              </CardFooter>
            </Card>
            {customPitch && (
              <Card>
                <CardHeader><CardTitle>Custom Pitch</CardTitle></CardHeader>
                <CardContent><Textarea value={customPitch} onChange={(e) => setCustomPitch(e.target.value)} placeholder="Edit your pitch here..." rows={5} /></CardContent>
                <CardFooter className="flex justify-end"><Button variant="outline" onClick={() => setCustomPitch('')}>Clear</Button></CardFooter>
              </Card>
            )}
            <Card>
              <CardHeader><CardTitle>Pitch Parameters</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <SlotMachine options={productDescriptors} label="Product Descriptor" value={productDescriptor} onChange={setProductDescriptor} />
                <SlotMachine options={productTypes} label="Product Type" value={productType} onChange={setProductType} />
                <SlotMachine options={targetAudiences} label="Target Audience" value={targetAudience} onChange={setTargetAudience} />
                <SlotMachine options={problemsSolved} label="Problem Solved" value={problemSolved} onChange={setProblemSolved} />
                <SlotMachine options={businessModels} label="Business Model" value={businessModel} onChange={setBusinessModel} />
                <SlotMachine options={revenueModels} label="Revenue Model" value={revenueModel} onChange={setRevenueModel} />
                <SlotMachine options={focusAreas} label="Focus Area" value={focusArea} onChange={setFocusArea} />
                <SlotMachine options={competitorTypes} label="Competitor Type" value={competitorType} onChange={setCompetitorType} />
                <SlotMachine options={advantages} label="Advantage" value={advantage} onChange={setAdvantage} />
                <SlotMachine options={fundingTypes} label="Funding Type" value={fundingType} onChange={setFundingType} />
                <SlotMachine options={teamDescriptors} label="Team Descriptor" value={teamDescriptor} onChange={setTeamDescriptor} />
                <SlotMachine options={achievements} label="Achievement" value={achievement} onChange={setAchievement} />
                <SlotMachine options={marketActions} label="Market Action" value={marketAction} onChange={setMarketAction} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* REVISED: Marketing Plan Tab (Uses Inputs) */}
          <TabsContent value="marketing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generated Marketing Plan</CardTitle>
                <CardDescription>Auto-generated marketing plan overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md relative group">
                  <pre className="whitespace-pre-wrap font-sans">{customMarketingPlan || generatedMarketingPlan}</pre>
                  <Button size="sm" variant="ghost" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(customMarketingPlan || generatedMarketingPlan)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={generateRandomMarketingPlan}>
                  <Shuffle className="w-4 h-4 mr-2" /> Generate Random
                </Button>
                <Button variant="outline" onClick={() => setCustomMarketingPlan(generatedMarketingPlan)} disabled={!!customMarketingPlan}>
                  <ArrowRight className="w-4 h-4 mr-2" /> Use as Template
                </Button>
              </CardFooter>
            </Card>
            {customMarketingPlan && (
              <Card>
                <CardHeader><CardTitle>Custom Marketing Plan</CardTitle></CardHeader>
                <CardContent><Textarea value={customMarketingPlan} onChange={(e) => setCustomMarketingPlan(e.target.value)} placeholder="Edit marketing plan..." rows={5} /></CardContent>
                <CardFooter className="flex justify-end"><Button variant="outline" onClick={() => setCustomMarketingPlan('')}>Clear</Button></CardFooter>
              </Card>
            )}
            <Card>
              <CardHeader><CardTitle>Marketing Parameters</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="mkt-audience">Target Audience</Label><Input id="mkt-audience" value={marketingPlanData.audience} onChange={(e) => handleMarketingDataChange('audience', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="mkt-campaign">Campaign Type</Label><Input id="mkt-campaign" value={marketingPlanData.campaignType} onChange={(e) => handleMarketingDataChange('campaignType', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="mkt-channel">Primary Channel</Label><Input id="mkt-channel" value={marketingPlanData.channel} onChange={(e) => handleMarketingDataChange('channel', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="mkt-budget">Budget</Label><Input id="mkt-budget" value={marketingPlanData.budget} onChange={(e) => handleMarketingDataChange('budget', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="mkt-kpi">Key KPI</Label><Input id="mkt-kpi" value={marketingPlanData.kpi} onChange={(e) => handleMarketingDataChange('kpi', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="mkt-timeline">Timeline</Label><Input id="mkt-timeline" value={marketingPlanData.timeline} onChange={(e) => handleMarketingDataChange('timeline', e.target.value)} /></div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REVISED: Fundraising Plan Tab (Uses Inputs & Checkboxes) */}
          <TabsContent value="funding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generated Fundraising Plan</CardTitle>
                <CardDescription>Auto-generated fundraising plan overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md relative group">
                  <pre className="whitespace-pre-wrap font-sans">{customFundraisingPlan || generatedFundraisingPlan}</pre>
                  <Button size="sm" variant="ghost" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(customFundraisingPlan || generatedFundraisingPlan)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={generateRandomFundraisingPlan}>
                  <Shuffle className="w-4 h-4 mr-2" /> Generate Random
                </Button>
                <Button variant="outline" onClick={() => setCustomFundraisingPlan(generatedFundraisingPlan)} disabled={!!customFundraisingPlan}>
                  <ArrowRight className="w-4 h-4 mr-2" /> Use as Template
                </Button>
              </CardFooter>
            </Card>
            {customFundraisingPlan && (
              <Card>
                <CardHeader><CardTitle>Custom Fundraising Plan</CardTitle></CardHeader>
                <CardContent><Textarea value={customFundraisingPlan} onChange={(e) => setCustomFundraisingPlan(e.target.value)} placeholder="Edit fundraising plan..." rows={5} /></CardContent>
                <CardFooter className="flex justify-end"><Button variant="outline" onClick={() => setCustomFundraisingPlan('')}>Clear</Button></CardFooter>
              </Card>
            )}
            <Card>
              <CardHeader><CardTitle>Fundraising Parameters</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Input Fields */}
                <div className="space-y-2"><Label htmlFor="fund-stage">Funding Stage</Label><Input id="fund-stage" value={fundraisingPlanData.stage} onChange={(e) => handleFundraisingDataChange('stage', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="fund-amount">Target Amount</Label><Input id="fund-amount" value={fundraisingPlanData.amount} onChange={(e) => handleFundraisingDataChange('amount', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="fund-use">Use of Funds</Label><Input id="fund-use" value={fundraisingPlanData.useOfFunds} onChange={(e) => handleFundraisingDataChange('useOfFunds', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="fund-sector">Target Sector</Label><Input id="fund-sector" value={fundraisingPlanData.sector} onChange={(e) => handleFundraisingDataChange('sector', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="fund-close">Target Close Date</Label><Input id="fund-close" value={fundraisingPlanData.closeDate} onChange={(e) => handleFundraisingDataChange('closeDate', e.target.value)} /></div>
                {/* Checklist Section */}
                <div className="space-y-3 md:col-span-2">
                   <Label className="font-medium">Asset Checklist</Label>
                   <div className="flex items-center space-x-2">
                     <Checkbox id="check-pitchDeck" checked={fundraisingPlanData.checklist.pitchDeck} onCheckedChange={(checked) => handleFundraisingChecklistChange('pitchDeck', !!checked)} />
                     <Label htmlFor="check-pitchDeck">Pitch Deck Ready</Label>
                   </div>
                   <div className="flex items-center space-x-2">
                     <Checkbox id="check-financials" checked={fundraisingPlanData.checklist.financials} onCheckedChange={(checked) => handleFundraisingChecklistChange('financials', !!checked)} />
                     <Label htmlFor="check-financials">Financial Projections Complete</Label>
                   </div>
                   <div className="flex items-center space-x-2">
                     <Checkbox id="check-marketAnalysis" checked={fundraisingPlanData.checklist.marketAnalysis} onCheckedChange={(checked) => handleFundraisingChecklistChange('marketAnalysis', !!checked)} />
                     <Label htmlFor="check-marketAnalysis">Market Analysis Done</Label>
                   </div>
                   <div className="flex items-center space-x-2">
                     <Checkbox id="check-teamBios" checked={fundraisingPlanData.checklist.teamBios} onCheckedChange={(checked) => handleFundraisingChecklistChange('teamBios', !!checked)} />
                     <Label htmlFor="check-teamBios">Team Bios Updated</Label>
                   </div>
                 </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NEW: Budget Plan Tab (Uses Inputs) */}
          <TabsContent value="budget" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generated Budget Plan</CardTitle>
                <CardDescription>Auto-generated budget overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md relative group">
                  <pre className="whitespace-pre-wrap font-sans">{customBudgetPlan || generatedBudgetPlan}</pre>
                  <Button size="sm" variant="ghost" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(customBudgetPlan || generatedBudgetPlan)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={generateRandomBudgetPlan}>
                  <Shuffle className="w-4 h-4 mr-2" /> Generate Random
                </Button>
                <Button variant="outline" onClick={() => setCustomBudgetPlan(generatedBudgetPlan)} disabled={!!customBudgetPlan}>
                  <ArrowRight className="w-4 h-4 mr-2" /> Use as Template
                </Button>
              </CardFooter>
            </Card>
            {customBudgetPlan && (
              <Card>
                <CardHeader><CardTitle>Custom Budget Plan</CardTitle></CardHeader>
                <CardContent><Textarea value={customBudgetPlan} onChange={(e) => setCustomBudgetPlan(e.target.value)} placeholder="Edit budget plan..." rows={5} /></CardContent>
                <CardFooter className="flex justify-end"><Button variant="outline" onClick={() => setCustomBudgetPlan('')}>Clear</Button></CardFooter>
              </Card>
            )}
            <Card>
              <CardHeader><CardTitle>Budget Parameters</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="budget-revenue">Revenue Projection</Label><Input id="budget-revenue" value={budgetPlanData.revenueProjection} onChange={(e) => handleBudgetDataChange('revenueProjection', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="budget-cogs">Cost of Goods Sold (%)</Label><Input id="budget-cogs" value={budgetPlanData.costOfGoodsSold} onChange={(e) => handleBudgetDataChange('costOfGoodsSold', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="budget-opex">Operating Expenses</Label><Input id="budget-opex" value={budgetPlanData.operatingExpenses} onChange={(e) => handleBudgetDataChange('operatingExpenses', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="budget-needs">Funding Needs</Label><Input id="budget-needs" value={budgetPlanData.fundingNeeds} onChange={(e) => handleBudgetDataChange('fundingNeeds', e.target.value)} /></div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NEW: Shares Management Tab (Uses Inputs) */}
          <TabsContent value="shares" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generated Shares Plan</CardTitle>
                <CardDescription>Auto-generated shares allocation overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md relative group">
                  <pre className="whitespace-pre-wrap font-sans">{customSharesPlan || generatedSharesPlan}</pre>
                  <Button size="sm" variant="ghost" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(customSharesPlan || generatedSharesPlan)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={generateRandomSharesPlan}>
                  <Shuffle className="w-4 h-4 mr-2" /> Generate Random
                </Button>
                <Button variant="outline" onClick={() => setCustomSharesPlan(generatedSharesPlan)} disabled={!!customSharesPlan}>
                  <ArrowRight className="w-4 h-4 mr-2" /> Use as Template
                </Button>
              </CardFooter>
            </Card>
            {customSharesPlan && (
              <Card>
                <CardHeader><CardTitle>Custom Shares Plan</CardTitle></CardHeader>
                <CardContent><Textarea value={customSharesPlan} onChange={(e) => setCustomSharesPlan(e.target.value)} placeholder="Edit shares plan..." rows={5} /></CardContent>
                <CardFooter className="flex justify-end"><Button variant="outline" onClick={() => setCustomSharesPlan('')}>Clear</Button></CardFooter>
              </Card>
            )}
            <Card>
              <CardHeader><CardTitle>Shares Parameters</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="shares-total">Total Shares</Label><Input id="shares-total" value={sharesPlanData.totalShares} onChange={(e) => handleSharesDataChange('totalShares', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="shares-founder">Founder Shares (%)</Label><Input id="shares-founder" value={sharesPlanData.founderShares} onChange={(e) => handleSharesDataChange('founderShares', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="shares-pool">Employee Pool (%)</Label><Input id="shares-pool" value={sharesPlanData.employeePool} onChange={(e) => handleSharesDataChange('employeePool', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="shares-investor">Investor Shares (%)</Label><Input id="shares-investor" value={sharesPlanData.investorShares} onChange={(e) => handleSharesDataChange('investorShares', e.target.value)} /></div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REVISED: Startup/Holding Co Tab (Uses Inputs & Checkboxes) */}
          <TabsContent value="startup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generated Startup Plan</CardTitle>
                <CardDescription>Auto-generated company setup details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md relative group">
                  <pre className="whitespace-pre-wrap font-sans">{customStartupPlan || generatedStartupPlan}</pre>
                  <Button size="sm" variant="ghost" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(customStartupPlan || generatedStartupPlan)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={generateRandomStartupPlan}>
                  <Shuffle className="w-4 h-4 mr-2" /> Generate Random
                </Button>
                <Button variant="outline" onClick={() => setCustomStartupPlan(generatedStartupPlan)} disabled={!!customStartupPlan}>
                  <ArrowRight className="w-4 h-4 mr-2" /> Use as Template
                </Button>
              </CardFooter>
            </Card>
            {customStartupPlan && (
              <Card>
                <CardHeader><CardTitle>Custom Startup Plan</CardTitle></CardHeader>
                <CardContent><Textarea value={customStartupPlan} onChange={(e) => setCustomStartupPlan(e.target.value)} placeholder="Edit startup plan..." rows={5} /></CardContent>
                <CardFooter className="flex justify-end"><Button variant="outline" onClick={() => setCustomStartupPlan('')}>Clear</Button></CardFooter>
              </Card>
            )}
            <Card>
              <CardHeader><CardTitle>Startup Parameters</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Input Fields */}
                <div className="space-y-2"><Label htmlFor="startup-name">Company Name</Label><Input id="startup-name" value={startupPlanData.companyName} onChange={(e) => handleStartupDataChange('companyName', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="startup-structure">Legal Structure</Label><Input id="startup-structure" value={startupPlanData.legalStructure} onChange={(e) => handleStartupDataChange('legalStructure', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="startup-state">Incorporation State</Label><Input id="startup-state" value={startupPlanData.incorporationState} onChange={(e) => handleStartupDataChange('incorporationState', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="startup-agent">Registered Agent</Label><Input id="startup-agent" value={startupPlanData.registeredAgent} onChange={(e) => handleStartupDataChange('registeredAgent', e.target.value)} /></div>
                {/* Checklist Section */}
                <div className="space-y-3 md:col-span-2">
                   <Label className="font-medium">Setup Checklist</Label>
                   <div className="flex items-center space-x-2">
                     <Checkbox id="check-ein" checked={startupPlanData.checklist.einObtained} onCheckedChange={(checked) => handleStartupChecklistChange('einObtained', !!checked)} />
                     <Label htmlFor="check-ein">EIN Obtained</Label>
                   </div>
                   <div className="flex items-center space-x-2">
                     <Checkbox id="check-bank" checked={startupPlanData.checklist.bankAccountOpened} onCheckedChange={(checked) => handleStartupChecklistChange('bankAccountOpened', !!checked)} />
                     <Label htmlFor="check-bank">Business Bank Account Opened</Label>
                   </div>
                   <div className="flex items-center space-x-2">
                     <Checkbox id="check-domain" checked={startupPlanData.checklist.domainRegistered} onCheckedChange={(checked) => handleStartupChecklistChange('domainRegistered', !!checked)} />
                     <Label htmlFor="check-domain">Domain Name Registered</Label>
                   </div>
                   <div className="flex items-center space-x-2">
                     <Checkbox id="check-agreements" checked={startupPlanData.checklist.founderAgreements} onCheckedChange={(checked) => handleStartupChecklistChange('founderAgreements', !!checked)} />
                     <Label htmlFor="check-agreements">Founder Agreements Signed</Label>
                   </div>
                 </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REVISED: Project Objectives Tab (Uses Inputs) */}
          <TabsContent value="objectives" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Objectives</CardTitle>
                <CardDescription>Generated objectives, goals, and KPIs for your project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md relative group">
                  <pre className="whitespace-pre-wrap font-sans">{customObjectivesPlan || generatedObjectivesPlan}</pre>
                  <Button size="sm" variant="ghost" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(customObjectivesPlan || generatedObjectivesPlan)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={generateRandomObjectivesPlan}>
                  <Shuffle className="w-4 h-4 mr-2" /> Generate Random
                </Button>
                <Button variant="outline" onClick={() => setCustomObjectivesPlan(generatedObjectivesPlan)} disabled={!!customObjectivesPlan}>
                  <ArrowRight className="w-4 h-4 mr-2" /> Use as Template
                </Button>
              </CardFooter>
            </Card>
            {customObjectivesPlan && (
              <Card>
                <CardHeader><CardTitle>Custom Objectives</CardTitle></CardHeader>
                <CardContent><Textarea value={customObjectivesPlan} onChange={(e) => setCustomObjectivesPlan(e.target.value)} placeholder="Edit your objectives here..." rows={8} /></CardContent>
                <CardFooter className="flex justify-end"><Button variant="outline" onClick={() => setCustomObjectivesPlan('')}>Clear</Button></CardFooter>
              </Card>
            )}
            <Card>
              <CardHeader><CardTitle>Objectives Parameters</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-muted/50"><h3 className="font-medium flex items-center mb-3"><Target className="w-4 h-4 mr-2 text-primary" /> Primary Goal</h3><div className="space-y-2"><SlotMachine options={goalVerbs} label="Action" value={objectivesPlanData.goalVerb} onChange={setGoalVerb} /><SlotMachine options={goalMetrics} label="Metric" value={objectivesPlanData.goalMetric} onChange={setGoalMetric} /><SlotMachine options={goalTargets} label="Target" value={objectivesPlanData.goalTarget} onChange={setGoalTarget} /><SlotMachine options={timeframes} label="Timeframe" value={objectivesPlanData.timeframe} onChange={setTimeframe} /></div></Card>
                <Card className="p-4 bg-muted/50"><h3 className="font-medium flex items-center mb-3"><Zap className="w-4 h-4 mr-2 text-primary" /> Strategy & Action</h3><div className="space-y-2"><SlotMachine options={objectiveAreas} label="Focus Area" value={objectivesPlanData.objectiveArea} onChange={setObjectiveArea} /><SlotMachine options={growthStrategies} label="Growth Strategy" value={objectivesPlanData.growthStrategy} onChange={setGrowthStrategy} /><SlotMachine options={actionVerbs} label="Action Verb" value={objectivesPlanData.actionVerb} onChange={setActionVerb} /><SlotMachine options={actionTargets} label="Deliverable" value={objectivesPlanData.actionTarget} onChange={setActionTarget} /></div></Card>
                <Card className="p-4 bg-muted/50"><h3 className="font-medium flex items-center mb-3"><ArrowUpRight className="w-4 h-4 mr-2 text-primary" /> Tracking & KPIs</h3><div className="space-y-2"><SlotMachine options={kpiMetrics} label="Key Metric" value={objectivesPlanData.kpiMetric} onChange={setKpiMetric} /></div></Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tech Stack Tab (Uses SlotMachine) */}
          <TabsContent value="techstack" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Technology Stack</CardTitle>
                <CardDescription>Generated technology recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md relative group">
                  <pre className="whitespace-pre-wrap font-sans text-sm">{customTechStack || generatedTechStack}</pre>
                  <Button size="sm" variant="ghost" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(customTechStack || generatedTechStack)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={generateRandomTechStack}>
                  <Shuffle className="w-4 h-4 mr-2" /> Generate Random
                </Button>
                <Button variant="outline" onClick={() => setCustomTechStack(generatedTechStack)} disabled={!!customTechStack}>
                  <ArrowRight className="w-4 h-4 mr-2" /> Use as Template
                </Button>
              </CardFooter>
            </Card>
            {customTechStack && (
              <Card>
                <CardHeader><CardTitle>Custom Tech Stack</CardTitle></CardHeader>
                <CardContent><Textarea value={customTechStack} onChange={(e) => setCustomTechStack(e.target.value)} placeholder="Edit tech stack..." rows={10} /></CardContent>
                <CardFooter className="flex justify-end"><Button variant="outline" onClick={() => setCustomTechStack('')}>Clear</Button></CardFooter>
              </Card>
            )}
            <Card>
              <CardHeader><CardTitle>Technology Parameters</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-muted/50"><h3 className="font-medium flex items-center mb-3"><Layers className="w-4 h-4 mr-2 text-primary" /> Architecture</h3><div className="space-y-2"><SlotMachine options={projectScales} label="Project Scale" value={projectScale} onChange={setProjectScale} /></div></Card>
                <Card className="p-4 bg-muted/50"><h3 className="font-medium flex items-center mb-3"><Code className="w-4 h-4 mr-2 text-primary" /> Frontend</h3><div className="space-y-2"><SlotMachine options={frontendFrameworks} label="Framework" value={frontendFramework} onChange={setFrontendFramework} /><SlotMachine options={testingFrameworks} label="Testing" value={testingFramework} onChange={setTestingFramework} /></div></Card>
                <Card className="p-4 bg-muted/50"><h3 className="font-medium flex items-center mb-3"><Server className="w-4 h-4 mr-2 text-primary" /> Backend</h3><div className="space-y-2"><SlotMachine options={backendFrameworks} label="Framework" value={backendFramework} onChange={setBackendFramework} /><SlotMachine options={cloudProviders} label="Cloud Provider" value={cloudProvider} onChange={setCloudProvider} /></div></Card>
                <Card className="p-4 bg-muted/50"><h3 className="font-medium flex items-center mb-3"><Database className="w-4 h-4 mr-2 text-primary" /> Data & DevOps</h3><div className="space-y-2"><SlotMachine options={databases} label="Database" value={database} onChange={setDatabase} /><SlotMachine options={devOpsTools} label="DevOps Tools" value={devOpsTool} onChange={setDevOpsTool} /></div></Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tracking Tab (Uses SlotMachine) */}
          <TabsContent value="mediatracking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Media Tracking System</CardTitle>
                <CardDescription>Generated specifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md relative group">
                  <pre className="whitespace-pre-wrap font-sans text-sm">{customMediaTracking || generatedMediaTracking}</pre>
                  <Button size="sm" variant="ghost" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(customMediaTracking || generatedMediaTracking)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={generateRandomMediaTracking}>
                  <Shuffle className="w-4 h-4 mr-2" /> Generate Random
                </Button>
                <Button variant="outline" onClick={() => setCustomMediaTracking(generatedMediaTracking)} disabled={!!customMediaTracking}>
                  <ArrowRight className="w-4 h-4 mr-2" /> Use as Template
                </Button>
              </CardFooter>
            </Card>
            {customMediaTracking && (
              <Card>
                <CardHeader><CardTitle>Custom Media Tracking System</CardTitle></CardHeader>
                <CardContent><Textarea value={customMediaTracking} onChange={(e) => setCustomMediaTracking(e.target.value)} placeholder="Edit media tracking system..." rows={12} /></CardContent>
                <CardFooter className="flex justify-end"><Button variant="outline" onClick={() => setCustomMediaTracking('')}>Clear</Button></CardFooter>
              </Card>
            )}
            <Card>
              <CardHeader><CardTitle>Media Tracking Parameters</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-muted/50"><h3 className="font-medium flex items-center mb-3"><FileText className="w-4 h-4 mr-2 text-primary" /> Documents & Compliance</h3><div className="space-y-2"><SlotMachine options={complianceTypes} label="Compliance Document Type" value={complianceType} onChange={setComplianceType} /><SlotMachine options={securityFeatures} label="Security Feature" value={securityFeature} onChange={setSecurityFeature} /></div></Card>
                <Card className="p-4 bg-muted/50"><h3 className="font-medium flex items-center mb-3"><Settings className="w-4 h-4 mr-2 text-primary" /> Workflow & Tracking</h3><div className="space-y-2"><SlotMachine options={workflowSteps} label="Workflow Step" value={workflowStep} onChange={setWorkflowStep} /><SlotMachine options={trackingMethods} label="Tracking Method" value={trackingMethod} onChange={setTrackingMethod} /></div></Card>
                <Card className="p-4 bg-muted/50"><h3 className="font-medium flex items-center mb-3"><BarChart className="w-4 h-4 mr-2 text-primary" /> Analytics & Integration</h3><div className="space-y-2"><SlotMachine options={analyticsFeatures} label="Analytics Feature" value={analyticsFeature} onChange={setAnalyticsFeature} /><SlotMachine options={integrationPoints} label="Integration Point" value={integrationPoint} onChange={setIntegrationPoint} /></div></Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Git Explorer Tab */}
          <TabsContent value="git" className="space-y-4">
            <Card className="flex-grow">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div><CardTitle>Git Explorer</CardTitle><CardDescription>Save and manage your artifacts</CardDescription></div>
                  <Dialog open={isNewRepoDialogOpen} onOpenChange={setIsNewRepoDialogOpen}>
                    <DialogTrigger asChild><Button variant="outline" size="sm"><GitBranchPlus className="h-4 w-4 mr-2" /> New Repository</Button></DialogTrigger>
                    <DialogContent><DialogHeader><DialogTitle>Create New Repository</DialogTitle></DialogHeader><div className="py-4"><Label>Repository Name</Label><Input value={newRepoName} onChange={e => setNewRepoName(e.target.value)} placeholder="my-business-plan" className="mt-1.5"/></div><DialogFooter><Button variant="outline" onClick={() => setIsNewRepoDialogOpen(false)}>Cancel</Button><Button onClick={createRepository}>Create</Button></DialogFooter></DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-3 h-96 border-t">
                  {/* Repository Browser */}
                  <div className="border-r p-4"><div className="flex flex-col h-full"><h3 className="text-sm font-medium mb-2">Repositories</h3><ScrollArea className="flex-grow"><div className="space-y-1">{repos.map(repo => (<div key={repo.id} className={cn("flex items-center gap-2 p-1.5 hover:bg-muted rounded-md cursor-pointer", selectedRepoId === repo.id ? "bg-muted" : "")} onClick={() => { setSelectedRepoId(repo.id); setSelectedPath([]); setSelectedFile(null); setFileContent(''); }}><GitFork className="w-4 h-4 text-primary" /><span>{repo.name}</span></div>))}</div></ScrollArea></div></div>
                  {/* File Browser */}
                  <div className="border-r p-4"><div className="flex flex-col h-full">{selectedRepoId ? (<><div className="flex justify-between items-center mb-2"><div className="flex items-center gap-1.5"><Button variant="ghost" size="sm" onClick={navigateUp} disabled={selectedPath.length === 0 && !selectedRepoId}><ArrowRight className="h-4 w-4 rotate-180" /></Button><h3 className="text-sm font-medium">{selectedPath.length === 0 ? repos.find(r => r.id === selectedRepoId)?.name : getCurrentDirectory()?.name}</h3></div><div className="flex gap-2"><Dialog open={isNewFileDialogOpen} onOpenChange={setIsNewFileDialogOpen}><DialogTrigger asChild><Button variant="outline" size="sm"><FileText className="h-3.5 w-3.5 mr-1.5" /> New File</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Create New File</DialogTitle></DialogHeader><div className="py-4"><Label>File Name</Label><Input value={newFileName} onChange={e => setNewFileName(e.target.value)} placeholder="plan.json" className="mt-1.5"/></div><DialogFooter><Button variant="outline" onClick={() => setIsNewFileDialogOpen(false)}>Cancel</Button><Button onClick={createFile}>Create</Button></DialogFooter></DialogContent></Dialog><Dialog open={isNewDirDialogOpen} onOpenChange={setIsNewDirDialogOpen}><DialogTrigger asChild><Button variant="outline" size="sm"><FolderTree className="h-3.5 w-3.5 mr-1.5" /> New Dir</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Create New Directory</DialogTitle></DialogHeader><div className="py-4"><Label>Directory Name</Label><Input value={newDirName} onChange={e => setNewDirName(e.target.value)} placeholder="docs" className="mt-1.5"/></div><DialogFooter><Button variant="outline" onClick={() => setIsNewDirDialogOpen(false)}>Cancel</Button><Button onClick={createDirectory}>Create</Button></DialogFooter></DialogContent></Dialog></div></div><Separator className="my-2" /><ScrollArea className="flex-grow">{renderDirectory(getCurrentDirectory())}</ScrollArea></>) : (<div className="flex items-center justify-center h-full text-muted-foreground"><p>Select a repository</p></div>)}</div></div>
                  {/* File Editor */}
                  <div className="p-4"><div className="flex flex-col h-full">{selectedFile ? (<><div className="flex justify-between items-center mb-2"><h3 className="text-sm font-medium">{selectedFile.name}</h3><Button variant="outline" size="sm" onClick={saveFileChanges}><Save className="h-3.5 w-3.5 mr-1.5" /> Save</Button></div><Separator className="my-2" /><Textarea value={fileContent} onChange={(e) => setFileContent(e.target.value)} className="flex-grow font-mono text-sm min-h-[300px]" /></>) : (<div className="flex items-center justify-center h-full text-muted-foreground"><p>Select a file to edit</p></div>)}</div></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Corporation Setup Tab */}
          <TabsContent value="corporation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{corporationSetupGuide.title}</CardTitle>
                <CardDescription>Follow these steps to set up your corporation properly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {corporationSetupGuide.steps.map((step, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="text-lg font-medium flex items-center">
                      <Badge variant="outline" className="mr-2">{index + 1}</Badge>
                      {step.title}
                    </h3>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{step.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Term Sheet Tab */}
          <TabsContent value="termsheet" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{termSheetGuide.title}</CardTitle>
                <CardDescription>Understanding and negotiating investor term sheets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {termSheetGuide.sections.map((section, index) => (
                  <div key={index} className="space-y-3">
                    <h3 className="text-lg font-medium">{section.title}</h3>
                    {section.content && (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{section.content}</ReactMarkdown>
                      </div>
                    )}
                    {section.subsections && section.subsections.map((subsection, subIndex) => (
                      <div key={subIndex} className="mt-4 space-y-2">
                        <h4 className="font-medium text-base">{subsection.title}</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {subsection.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="prose-sm">
                              <ReactMarkdown>{item}</ReactMarkdown>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Define Git types (ensure these are defined or imported)
interface GitFile { id: string; name: string; content: string; lastModified: string; }
interface GitDirectory { id: string; name: string; files: GitFile[]; directories: GitDirectory[]; lastModified: string; }
interface GitRepository { id: string; name: string; rootDirectory: GitDirectory; lastModified: string; }
interface ArtifactPreset { id: string; title: string; description: string; type: string; iconComponent: React.ReactNode; content: string; }
