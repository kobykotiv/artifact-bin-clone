import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Shuffle, Copy, Save, ArrowRight, RotateCw, Target, Zap, ArrowUpRight, Code, Server, Database, GitBranchPlus, Layers, FileText, BarChart, Users, Settings, FolderTree, Edit, Trash, Plus, GitBranch, GitCommit, GitFork } from 'lucide-react';
import { toast } from 'sonner';
import { type ArtifactData } from '@/lib/services/db';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';

interface MarketingPlanGeneratorProps {
  artifact: ArtifactData;
  onSave: (updatedArtifact: ArtifactData) => Promise<void> | void;
}

// Define option categories for the madlib generator
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

// Options for funding round generator
const fundingRounds = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D', 'Series E', 'Growth Equity'];
const fundingAmounts = ['$1M', '$2.5M', '$5M', '$10M', '$25M', '$50M', '$100M', '$250M'];
const investorTypes = ['angel investors', 'seed funds', 'venture capital firms', 'strategic investors', 'growth equity firms'];
const fundingReasons = ['expand market share', 'accelerate growth', 'develop new products', 'enter new markets', 'scale operations'];

// NEW: Options for project objectives generator
const goalVerbs = ['increase', 'improve', 'optimize', 'enhance', 'grow', 'reduce', 'maximize', 'build', 'develop', 'establish'];
const goalMetrics = ['user engagement', 'customer retention', 'revenue growth', 'market share', 'customer satisfaction', 'operational efficiency'];
const goalTargets = ['by 25%', 'by 50%', 'by 2X', 'by 3X', 'significantly', 'substantially', 'across all markets', 'year-over-year'];
const timeframes = ['in Q1', 'in Q2', 'in Q3', 'in Q4', 'by end of year', 'within 6 months', 'over the next year', 'in the next quarter'];
const objectiveAreas = ['product development', 'marketing strategy', 'customer acquisition', 'user experience', 'platform stability', 'operational excellence'];
const actionVerbs = ['launch', 'implement', 'deploy', 'develop', 'create', 'establish', 'expand', 'redesign', 'optimize'];
const actionTargets = ['new feature set', 'marketing campaign', 'user onboarding flow', 'premium tier', 'strategic partnerships', 'referral program'];
const kpiMetrics = ['daily active users', 'monthly recurring revenue', 'customer lifetime value', 'retention rate', 'conversion rate', 'net promoter score'];
const growthStrategies = ['viral marketing', 'content marketing', 'strategic partnerships', 'product-led growth', 'community building', 'account-based marketing'];

// NEW: Tech stack options
const projectScales = ['monorepo', 'multi-repo', 'microservices', 'monolith', 'serverless'];
const frontendFrameworks = ['React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'React Native', 'Flutter'];
const backendFrameworks = ['Node.js/Express', 'Django', 'Ruby on Rails', 'Spring Boot', 'Laravel', 'FastAPI', 'NestJS'];
const databases = ['PostgreSQL', 'MongoDB', 'MySQL', 'Firebase', 'DynamoDB', 'Redis', 'Supabase'];
const devOpsTools = ['GitHub Actions', 'CircleCI', 'Jenkins', 'GitLab CI', 'Travis CI', 'Terraform', 'Docker', 'Kubernetes'];
const cloudProviders = ['AWS', 'Google Cloud', 'Azure', 'Vercel', 'Netlify', 'Digital Ocean', 'Heroku'];
const testingFrameworks = ['Jest', 'Cypress', 'Playwright', 'Selenium', 'Mocha', 'Pytest', 'JUnit'];

// NEW: Media tracking system options
const industrySegments = ['Financial Advisory', 'Asset Management', 'Investment Banking', 'Wealth Management', 'Insurance', 'Credit Unions', 'Retail Banking'];
const complianceTypes = ['KYC Documentation', 'AML Reports', 'Risk Assessments', 'Regulatory Filings', 'Audit Trails', 'Disclosure Statements', 'Client Agreements'];
const trackingMethods = ['Automated Alerts', 'Scheduled Reviews', 'Real-time Monitoring', 'Batch Processing', 'Exception-based Reporting', 'Document Expiration Tracking'];
const analyticsFeatures = ['Dashboard Visualization', 'Trend Analysis', 'Risk Scoring', 'Compliance Health Metrics', 'Document Aging Reports', 'Regulatory Deadline Tracking'];
const workflowSteps = ['Document Collection', 'Initial Review', 'Approval Process', 'Client Notification', 'Periodic Review', 'Exception Handling', 'Archiving'];
const userRoles = ['Compliance Officer', 'Financial Advisor', 'Branch Manager', 'System Administrator', 'Auditor', 'Client Service Representative'];
const integrationPoints = ['CRM Systems', 'Document Management', 'Email Services', 'Calendar Systems', 'Regulatory Databases', 'Electronic Signature', 'Client Portal'];
const securityFeatures = ['Role-based Access Control', 'Audit Logging', 'Data Encryption', 'Two-factor Authentication', 'IP Restrictions', 'Session Timeouts'];

interface SlotMachineProps {
  options: string[];
  label: string;
  value: string;
  onChange: (newValue: string) => void;
}

// Individual slot machine component
function SlotMachine({ options, label, value, onChange }: SlotMachineProps) {
  const currentIndex = options.indexOf(value);
  
  const getRandomOption = () => {
    // Get a random option different from current
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

export function MarketingPlanGenerator({ artifact, onSave }: MarketingPlanGeneratorProps) {
  // Initialize with random options from each category
  const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  
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

  // Funding tab state
  const [fundingRound, setFundingRound] = useState(getRandomItem(fundingRounds));
  const [fundingAmount, setFundingAmount] = useState(getRandomItem(fundingAmounts));
  const [investorType, setInvestorType] = useState(getRandomItem(investorTypes));
  const [fundingReason, setFundingReason] = useState(getRandomItem(fundingReasons));

  // NEW: State for project objectives
  const [goalVerb, setGoalVerb] = useState(getRandomItem(goalVerbs));
  const [goalMetric, setGoalMetric] = useState(getRandomItem(goalMetrics));
  const [goalTarget, setGoalTarget] = useState(getRandomItem(goalTargets));
  const [timeframe, setTimeframe] = useState(getRandomItem(timeframes));
  const [objectiveArea, setObjectiveArea] = useState(getRandomItem(objectiveAreas));
  const [actionVerb, setActionVerb] = useState(getRandomItem(actionVerbs));
  const [actionTarget, setActionTarget] = useState(getRandomItem(actionTargets));
  const [kpiMetric, setKpiMetric] = useState(getRandomItem(kpiMetrics));
  const [growthStrategy, setGrowthStrategy] = useState(getRandomItem(growthStrategies));

  // NEW: State variables for tech stack
  const [projectScale, setProjectScale] = useState(getRandomItem(projectScales));
  const [frontendFramework, setFrontendFramework] = useState(getRandomItem(frontendFrameworks));
  const [backendFramework, setBackendFramework] = useState(getRandomItem(backendFrameworks));
  const [database, setDatabase] = useState(getRandomItem(databases));
  const [devOpsTool, setDevOpsTool] = useState(getRandomItem(devOpsTools));
  const [cloudProvider, setCloudProvider] = useState(getRandomItem(cloudProviders));
  const [testingFramework, setTestingFramework] = useState(getRandomItem(testingFrameworks));
  const [customTechStack, setCustomTechStack] = useState('');

  // NEW: State for media tracking system
  const [industrySegment, setIndustrySegment] = useState(getRandomItem(industrySegments));
  const [complianceType, setComplianceType] = useState(getRandomItem(complianceTypes));
  const [trackingMethod, setTrackingMethod] = useState(getRandomItem(trackingMethods));
  const [analyticsFeature, setAnalyticsFeature] = useState(getRandomItem(analyticsFeatures));
  const [workflowStep, setWorkflowStep] = useState(getRandomItem(workflowSteps));
  const [userRole, setUserRole] = useState(getRandomItem(userRoles));
  const [integrationPoint, setIntegrationPoint] = useState(getRandomItem(integrationPoints));
  const [securityFeature, setSecurityFeature] = useState(getRandomItem(securityFeatures));
  const [customMediaTracking, setCustomMediaTracking] = useState('');

  const [activeTab, setActiveTab] = useState('pitch');
  const [customPitch, setCustomPitch] = useState('');
  const [customFunding, setCustomFunding] = useState('');
  const [customObjectives, setCustomObjectives] = useState('');
  
  // Generate pitch from selected options
  const generatePitch = () => {
    return `We're building a ${productDescriptor} ${productType} app for ${targetAudience} that solves ${problemSolved} through our ${businessModel}. Our ${revenueModel} model focuses on ${focusArea} with a clear advantage over ${competitorType} through our ${advantage}. Backed by ${fundingType}, our team of ${teamDescriptor} has already achieved ${achievement} as we ${marketAction} the industry.`;
  };

  // Generate funding announcement from selected options
  const generateFundingAnnouncement = () => {
    return `We're excited to announce our ${fundingRound} round of ${fundingAmount} led by top ${investorType}. This funding will help us ${fundingReason} while continuing to innovate in the ${productType} space. Our ${productDescriptor} platform has shown strong ${achievement}, and we're ready to ${marketAction} how ${targetAudience} approach ${problemSolved}.`;
  };

  // NEW: Generate objectives from selected options
  const generateObjectives = () => {
    const primaryGoal = `Primary Goal: ${goalVerb} ${goalMetric} ${goalTarget} ${timeframe}.`;
    const strategy = `Strategy: Focus on ${objectiveArea} to drive sustainable growth through ${growthStrategy}.`;
    const keyAction = `Key Action: ${actionVerb} a ${actionTarget} to accelerate adoption and improve user experience.`;
    const kpi = `KPI Tracking: Measure success through ${kpiMetric} with weekly reporting and analysis.`;
    
    return `${primaryGoal}\n\n${strategy}\n\n${keyAction}\n\n${kpi}`;
  };

  // NEW: Generate tech stack recommendation
  const generateTechStack = () => {
    const architectureSection = `## Architecture\nWe recommend a ${projectScale} architecture for this project, allowing for ${projectScale === 'monorepo' ? 'shared code and unified workflows' : projectScale === 'multi-repo' ? 'independent versioning and deployment' : projectScale === 'microservices' ? 'independent scaling and improved fault isolation' : projectScale === 'monolith' ? 'simplified deployment and debugging' : 'automatic scaling and reduced operational overhead'}.`;
    
    const frontendSection = `## Frontend\nFor the frontend, we'll use ${frontendFramework} to ${frontendFramework.includes('React') ? 'build reusable UI components with a virtual DOM for optimal performance' : frontendFramework === 'Vue.js' ? 'leverage its reactive data binding and component system' : frontendFramework === 'Angular' ? 'utilize its comprehensive framework with built-in solutions' : frontendFramework === 'Svelte' ? 'compile components to highly optimized vanilla JavaScript' : frontendFramework.includes('Native') || frontendFramework === 'Flutter' ? 'create a cross-platform mobile application with native performance' : 'develop a modern, responsive user interface'}.`;
    
    const backendSection = `## Backend\nThe backend will be powered by ${backendFramework}, which ${backendFramework.includes('Node') ? 'provides JavaScript on the server with excellent async capabilities' : backendFramework === 'Django' ? 'offers a batteries-included Python framework with admin interface' : backendFramework === 'Ruby on Rails' ? 'enables rapid development with convention over configuration' : backendFramework === 'Spring Boot' ? 'provides robust Java-based enterprise features and security' : backendFramework === 'Laravel' ? 'offers elegant syntax and tools for common PHP tasks' : backendFramework.includes('API') ? 'enables fast API development with automatic documentation' : 'provides a solid foundation for building our server application'}.`;
    
    const databaseSection = `## Database\nWe'll use ${database} for data persistence, which ${database === 'PostgreSQL' ? 'provides robust relational data storage with powerful extensions' : database === 'MongoDB' ? 'offers flexible document-oriented storage for rapid iteration' : database === 'MySQL' ? 'provides reliable relational database capabilities' : database === 'Firebase' ? 'offers real-time database features and easy integration with other services' : database === 'DynamoDB' ? 'provides fully managed NoSQL with automatic scaling' : database === 'Redis' ? 'enables high-performance caching and pub/sub messaging' : database === 'Supabase' ? 'offers PostgreSQL with built-in auth and real-time subscriptions' : 'ensures our data is reliably stored and efficiently accessible'}.`;
    
    const deploymentSection = `## Deployment & DevOps\nThe solution will be deployed to ${cloudProvider} using ${devOpsTool} for CI/CD. We'll implement automated testing with ${testingFramework} to ensure code quality and reliability.`;
    
    return `# Technology Stack\n\n${architectureSection}\n\n${frontendSection}\n\n${backendSection}\n\n${databaseSection}\n\n${deploymentSection}`;
  };

  // NEW: Generate media tracking system content
  const generateMediaTracking = () => {
    const overviewSection = `# Media Tracking System for ${industrySegment}\n\nA comprehensive compliance document management and tracking system specifically designed for ${industrySegment} professionals who need to maintain and monitor ${complianceType}.`;

    const workflowSection = `## Automated Workflow\n\nThe system implements a streamlined workflow that begins with ${workflowStep} and utilizes ${trackingMethod} to ensure timely compliance. ${userRole}s receive automatic notifications when action is needed, keeping the entire team in sync.`;

    const dataModelSection = `## Data Model\n\n* Users: Managed through role-based permissions with specific views for ${userRole}s\n* Compliance Documents: Centralized repository for ${complianceType} with version control\n* Settings: Configurable alert thresholds and ${securityFeature}\n* Analytics: ${analyticsFeature} with exportable reports and dashboards`;

    const integrationSection = `## Integrations\n\nSeamless connectivity with ${integrationPoint} ensures that compliance data flows naturally within your existing technology ecosystem, eliminating duplicate data entry and reducing the risk of errors.`;

    const securitySection = `## Security & Compliance\n\nOur system implements ${securityFeature} to protect sensitive financial information while maintaining an immutable audit trail for regulatory inspections.`;

    return `${overviewSection}\n\n${workflowSection}\n\n${dataModelSection}\n\n${integrationSection}\n\n${securitySection}`;
  };

  // Generate all random values
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

  // Generate random funding announcement
  const generateRandomFunding = () => {
    setFundingRound(getRandomItem(fundingRounds));
    setFundingAmount(getRandomItem(fundingAmounts));
    setInvestorType(getRandomItem(investorTypes));
    setFundingReason(getRandomItem(fundingReasons));
    setCustomFunding('');
  };

  // NEW: Generate random objectives
  const generateRandomObjectives = () => {
    setGoalVerb(getRandomItem(goalVerbs));
    setGoalMetric(getRandomItem(goalMetrics));
    setGoalTarget(getRandomItem(goalTargets));
    setTimeframe(getRandomItem(timeframes));
    setObjectiveArea(getRandomItem(objectiveAreas));
    setActionVerb(getRandomItem(actionVerbs));
    setActionTarget(getRandomItem(actionTargets));
    setKpiMetric(getRandomItem(kpiMetrics));
    setGrowthStrategy(getRandomItem(growthStrategies));
    setCustomObjectives('');
  };

  // NEW: Generate random tech stack
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

  // NEW: Generate random media tracking
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied to clipboard'))
      .catch(() => toast.error('Failed to copy'));
  };

  const handleSave = async () => {
    try {
      const content = {
        pitch: customPitch || generatePitch(),
        funding: customFunding || generateFundingAnnouncement(),
        objectives: customObjectives || generateObjectives(),
        techStack: customTechStack || generateTechStack(),
        mediaTracking: customMediaTracking || generateMediaTracking(),
        options: {
          productDescriptor,
          productType,
          targetAudience,
          problemSolved,
          businessModel,
          revenueModel,
          focusArea,
          competitorType,
          advantage,
          fundingType,
          teamDescriptor,
          achievement,
          marketAction,
          fundingRound,
          fundingAmount,
          investorType,
          fundingReason,
          // NEW: Add objectives options
          goalVerb,
          goalMetric,
          goalTarget,
          timeframe,
          objectiveArea,
          actionVerb,
          actionTarget,
          kpiMetric,
          growthStrategy,
          // NEW: Add tech stack options
          projectScale,
          frontendFramework,
          backendFramework,
          database,
          devOpsTool,
          cloudProvider,
          testingFramework,
          // NEW: Add media tracking options
          industrySegment,
          complianceType,
          trackingMethod,
          analyticsFeature,
          workflowStep,
          userRole,
          integrationPoint,
          securityFeature
        }
      };
      
      const updatedArtifact = {
        ...artifact,
        title: 'Marketing Plan',
        content: JSON.stringify(content, null, 2),
      };
      
      await onSave(updatedArtifact);
      toast.success('Marketing plan saved successfully');
    } catch (error) {
      console.error('Failed to save marketing plan:', error);
      toast.error('Failed to save marketing plan');
    }
  };

  // Load existing data if available
  useEffect(() => {
    try {
      if (artifact.content) {
        const content = JSON.parse(artifact.content);
        
        // Load custom text if available
        if (content.pitch) setCustomPitch(content.pitch);
        if (content.funding) setCustomFunding(content.funding);
        if (content.objectives) setCustomObjectives(content.objectives);
        if (content.techStack) setCustomTechStack(content.techStack);
        if (content.mediaTracking) setCustomMediaTracking(content.mediaTracking);
        
        // Load slot machine values if available
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
        if (options.fundingRound) setFundingRound(options.fundingRound);
        if (options.fundingAmount) setFundingAmount(options.fundingAmount);
        if (options.investorType) setInvestorType(options.investorType);
        if (options.fundingReason) setFundingReason(options.fundingReason);
        
        // NEW: Load objective options
        if (options.goalVerb) setGoalVerb(options.goalVerb);
        if (options.goalMetric) setGoalMetric(options.goalMetric);
        if (options.goalTarget) setGoalTarget(options.goalTarget);
        if (options.timeframe) setTimeframe(options.timeframe);
        if (options.objectiveArea) setObjectiveArea(options.objectiveArea);
        if (options.actionVerb) setActionVerb(options.actionVerb);
        if (options.actionTarget) setActionTarget(options.actionTarget);
        if (options.kpiMetric) setKpiMetric(options.kpiMetric);
        if (options.growthStrategy) setGrowthStrategy(options.growthStrategy);

        // NEW: Load tech stack options
        if (options.projectScale) setProjectScale(options.projectScale);
        if (options.frontendFramework) setFrontendFramework(options.frontendFramework);
        if (options.backendFramework) setBackendFramework(options.backendFramework);
        if (options.database) setDatabase(options.database);
        if (options.devOpsTool) setDevOpsTool(options.devOpsTool);
        if (options.cloudProvider) setCloudProvider(options.cloudProvider);
        if (options.testingFramework) setTestingFramework(options.testingFramework);

        // NEW: Load media tracking options
        if (options.industrySegment) setIndustrySegment(options.industrySegment);
        if (options.complianceType) setComplianceType(options.complianceType);
        if (options.trackingMethod) setTrackingMethod(options.trackingMethod);
        if (options.analyticsFeature) setAnalyticsFeature(options.analyticsFeature);
        if (options.workflowStep) setWorkflowStep(options.workflowStep);
        if (options.userRole) setUserRole(options.userRole);
        if (options.integrationPoint) setIntegrationPoint(options.integrationPoint);
        if (options.securityFeature) setSecurityFeature(options.securityFeature);
      }
    } catch (error) {
      console.error('Error loading marketing plan data:', error);
    }
  }, [artifact]);

  const generatedPitch = generatePitch();
  const generatedFunding = generateFundingAnnouncement();
  const generatedObjectives = generateObjectives();
  const generatedTechStack = generateTechStack();
  const generatedMediaTracking = generateMediaTracking();

  // Git Explorer state
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

  // Artifact presets
  const [presets] = useState<ArtifactPreset[]>([
    {
      id: '1',
      title: 'Marketing Plan',
      description: 'A complete marketing strategy template with pitch, funding, and objectives',
      type: 'marketing',
      iconComponent: <BarChart className="h-10 w-10 text-blue-500" />,
      content: JSON.stringify({
        pitch: "We're building a revolutionary productivity app for remote workers that solves information overload through our SaaS platform.",
        funding: "We're excited to announce our Seed round of $2.5M led by top venture capital firms.",
        objectives: "Primary Goal: increase user engagement by 50% in Q2.\n\nStrategy: Focus on user experience to drive sustainable growth through content marketing.\n\nKey Action: implement a referral program to accelerate adoption and improve user experience.\n\nKPI Tracking: Measure success through retention rate with weekly reporting and analysis."
      })
    },
    {
      id: '2',
      title: 'Tech Stack Documentation',
      description: 'Technical architecture and implementation details',
      type: 'technical',
      iconComponent: <Server className="h-10 w-10 text-green-500" />,
      content: JSON.stringify({
        techStack: "# Technology Stack\n\n## Architecture\nWe recommend a microservices architecture for this project, allowing for independent scaling and improved fault isolation.\n\n## Frontend\nFor the frontend, we'll use React to build reusable UI components with a virtual DOM for optimal performance.\n\n## Backend\nThe backend will be powered by Node.js/Express, which provides JavaScript on the server with excellent async capabilities.\n\n## Database\nWe'll use MongoDB for data persistence, which offers flexible document-oriented storage for rapid iteration.\n\n## Deployment & DevOps\nThe solution will be deployed to AWS using GitHub Actions for CI/CD. We'll implement automated testing with Jest to ensure code quality and reliability."
      })
    },
    {
      id: '3',
      title: 'Media Tracking System',
      description: 'Compliance document management system for financial services',
      type: 'system',
      iconComponent: <FileText className="h-10 w-10 text-violet-500" />,
      content: JSON.stringify({
        mediaTracking: "# Media Tracking System for Wealth Management\n\nA comprehensive compliance document management and tracking system specifically designed for Wealth Management professionals who need to maintain and monitor KYC Documentation.\n\n## Automated Workflow\n\nThe system implements a streamlined workflow that begins with Document Collection and utilizes Real-time Monitoring to ensure timely compliance. Financial Advisors receive automatic notifications when action is needed, keeping the entire team in sync.\n\n## Data Model\n\n* Users: Managed through role-based permissions with specific views for Financial Advisors\n* Compliance Documents: Centralized repository for KYC Documentation with version control\n* Settings: Configurable alert thresholds and Two-factor Authentication\n* Analytics: Compliance Health Metrics with exportable reports and dashboards\n\n## Integrations\n\nSeamless connectivity with CRM Systems ensures that compliance data flows naturally within your existing technology ecosystem, eliminating duplicate data entry and reducing the risk of errors.\n\n## Security & Compliance\n\nOur system implements Two-factor Authentication to protect sensitive financial information while maintaining an immutable audit trail for regulatory inspections."
      })
    }
  ]);

  // Load GitExplorer data from localStorage
  useEffect(() => {
    const savedRepos = localStorage.getItem('gitExplorerRepos');
    if (savedRepos) {
      try {
        setRepos(JSON.parse(savedRepos));
      } catch (error) {
        console.error('Failed to parse saved repositories', error);
      }
    } else {
      // Initialize with a sample repo
      const initialRepo: GitRepository = {
        id: crypto.randomUUID(),
        name: 'Sample Project',
        lastModified: new Date().toISOString(),
        rootDirectory: {
          id: crypto.randomUUID(),
          name: 'root',
          files: [{
            id: crypto.randomUUID(),
            name: 'README.md',
            content: '# Sample Project\n\nThis is a sample project to demonstrate the Git Explorer.',
            lastModified: new Date().toISOString()
          }],
          directories: [{
            id: crypto.randomUUID(),
            name: 'docs',
            files: [{
              id: crypto.randomUUID(),
              name: 'getting-started.md',
              content: '# Getting Started\n\nFollow these steps to get started with the project.',
              lastModified: new Date().toISOString()
            }],
            directories: [],
            lastModified: new Date().toISOString()
          }],
          lastModified: new Date().toISOString()
        }
      };
      setRepos([initialRepo]);
      localStorage.setItem('gitExplorerRepos', JSON.stringify([initialRepo]));
    }
  }, []);

  // Save repos to localStorage whenever they change
  useEffect(() => {
    if (repos.length > 0) {
      localStorage.setItem('gitExplorerRepos', JSON.stringify(repos));
    }
  }, [repos]);

  // Create new repository
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
        files: [{
          id: crypto.randomUUID(),
          name: 'README.md',
          content: `# ${newRepoName.trim()}\n\nA new project.`,
          lastModified: new Date().toISOString()
        }],
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

  // Create new file in current directory
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

    // Helper to find the current directory
    const findAndUpdateDirectory = (dir: GitDirectory, path: string[]): GitDirectory => {
      if (path.length === 0) {
        return {
          ...dir,
          files: [...dir.files, newFile],
          lastModified: new Date().toISOString()
        };
      }

      const [currentDir, ...remainingPath] = path;
      const dirIndex = dir.directories.findIndex(d => d.id === currentDir);
      
      if (dirIndex === -1) return dir;

      const updatedDirs = [...dir.directories];
      updatedDirs[dirIndex] = findAndUpdateDirectory(dir.directories[dirIndex], remainingPath);
      
      return {
        ...dir,
        directories: updatedDirs,
        lastModified: new Date().toISOString()
      };
    };

    setRepos(repos.map(repo => {
      if (repo.id !== selectedRepoId) return repo;
      return {
        ...repo,
        rootDirectory: findAndUpdateDirectory(repo.rootDirectory, selectedPath),
        lastModified: new Date().toISOString()
      };
    }));

    setNewFileName('');
    setIsNewFileDialogOpen(false);
    toast.success(`File '${newFileName.trim()}' created`);
  };

  // Create new directory in current directory
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

    // Helper to find the current directory
    const findAndUpdateDirectory = (dir: GitDirectory, path: string[]): GitDirectory => {
      if (path.length === 0) {
        return {
          ...dir,
          directories: [...dir.directories, newDir],
          lastModified: new Date().toISOString()
        };
      }

      const [currentDir, ...remainingPath] = path;
      const dirIndex = dir.directories.findIndex(d => d.id === currentDir);
      
      if (dirIndex === -1) return dir;

      const updatedDirs = [...dir.directories];
      updatedDirs[dirIndex] = findAndUpdateDirectory(dir.directories[dirIndex], remainingPath);
      
      return {
        ...dir,
        directories: updatedDirs,
        lastModified: new Date().toISOString()
      };
    };

    setRepos(repos.map(repo => {
      if (repo.id !== selectedRepoId) return repo;
      return {
        ...repo,
        rootDirectory: findAndUpdateDirectory(repo.rootDirectory, selectedPath),
        lastModified: new Date().toISOString()
      };
    }));

    setNewDirName('');
    setIsNewDirDialogOpen(false);
    toast.success(`Directory '${newDirName.trim()}' created`);
  };

  // Find file by path
  const findFile = (repo: GitRepository, fileId: string): GitFile | null => {
    let result: GitFile | null = null;
    
    const searchDirectory = (dir: GitDirectory) => {
      for (const file of dir.files) {
        if (file.id === fileId) {
          result = file;
          return;
        }
      }
      
      for (const subDir of dir.directories) {
        searchDirectory(subDir);
        if (result) return;
      }
    };
    
    searchDirectory(repo.rootDirectory);
    return result;
  };

  // Handle file selection
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
    
    setRepos(repos.map(repo => {
      if (repo.id !== selectedRepoId) return repo;
      return {
        ...repo,
        rootDirectory: updateFileInDirectory(repo.rootDirectory, selectedFile.id),
        lastModified: new Date().toISOString()
      };
    }));
    
    setSelectedFile(prev => prev ? { ...prev, content: fileContent, lastModified: new Date().toISOString() } : null);
    toast.success(`File '${selectedFile.name}' saved`);
  };

  // Delete file or directory
  const handleDelete = (itemId: string, isDirectory: boolean) => {
    const deleteFromDirectory = (dir: GitDirectory, id: string, isDir: boolean): GitDirectory => {
      if (isDir) {
        return {
          ...dir,
          directories: dir.directories.filter(d => d.id !== id),
          lastModified: new Date().toISOString()
        };
      } else {
        return {
          ...dir,
          files: dir.files.filter(f => f.id !== id),
          lastModified: new Date().toISOString()
        };
      }
    };

    const findAndDeleteFromDirectory = (dir: GitDirectory, path: string[]): GitDirectory => {
      if (path.length === 0) {
        return deleteFromDirectory(dir, itemId, isDirectory);
      }

      const [currentDir, ...remainingPath] = path;
      const dirIndex = dir.directories.findIndex(d => d.id === currentDir);
      
      if (dirIndex === -1) return dir;

      const updatedDirs = [...dir.directories];
      updatedDirs[dirIndex] = findAndDeleteFromDirectory(dir.directories[dirIndex], remainingPath);
      
      return {
        ...dir,
        directories: updatedDirs,
        lastModified: new Date().toISOString()
      };
    };

    if (selectedRepoId) {
      setRepos(repos.map(repo => {
        if (repo.id !== selectedRepoId) return repo;
        return {
          ...repo,
          rootDirectory: findAndDeleteFromDirectory(repo.rootDirectory, selectedPath),
          lastModified: new Date().toISOString()
        };
      }));
      
      if (selectedFile?.id === itemId) {
        setSelectedFile(null);
        setFileContent('');
      }
      
      toast.success(`${isDirectory ? 'Directory' : 'File'} deleted`);
    }
  };

  // Go to directory
  const navigateToDirectory = (dirId: string, dirName: string) => {
    setSelectedPath([...selectedPath, dirId]);
    setSelectedFile(null);
    setFileContent('');
  };

  // Go up one level
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

  // Apply preset to current artifact
  const applyPreset = (preset: ArtifactPreset) => {
    try {
      const presetContent = JSON.parse(preset.content);
      
      // Update state with preset content
      if (presetContent.pitch) setCustomPitch(presetContent.pitch);
      if (presetContent.funding) setCustomFunding(presetContent.funding);
      if (presetContent.objectives) setCustomObjectives(presetContent.objectives);
      if (presetContent.techStack) setCustomTechStack(presetContent.techStack);
      if (presetContent.mediaTracking) setCustomMediaTracking(presetContent.mediaTracking);
      
      toast.success(`Applied '${preset.title}' preset`);
      
      // Navigate to relevant tab
      if (preset.type === 'marketing') setActiveTab('pitch');
      if (preset.type === 'technical') setActiveTab('techstack');
      if (preset.type === 'system') setActiveTab('mediatracking');
    } catch (error) {
      console.error("Failed to apply preset:", error);
      toast.error("Failed to apply preset");
    }
  };

  // File explorer component
  const renderDirectory = (dir: GitDirectory | null) => {
    if (!dir) return null;
    
    return (
      <div className="space-y-1">
        {dir.directories.map(subDir => (
          <ContextMenu key={subDir.id}>
            <ContextMenuTrigger>
              <div 
                className="flex items-center gap-2 p-1.5 hover:bg-muted rounded-md cursor-pointer"
                onClick={() => navigateToDirectory(subDir.id, subDir.name)}
              >
                <FolderTree className="w-4 h-4 text-amber-500" />
                <span>{subDir.name}</span>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => navigateToDirectory(subDir.id, subDir.name)}>
                <FolderTree className="w-4 h-4 mr-2" /> Open Directory
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => handleDelete(subDir.id, true)} className="text-destructive">
                <Trash className="w-4 h-4 mr-2" /> Delete Directory
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
        
        {dir.files.map(file => (
          <ContextMenu key={file.id}>
            <ContextMenuTrigger>
              <div 
                className={cn(
                  "flex items-center gap-2 p-1.5 hover:bg-muted rounded-md cursor-pointer",
                  selectedFile?.id === file.id ? "bg-muted" : ""
                )}
                onClick={() => handleFileSelect(file.id)}
              >
                <FileText className="w-4 h-4 text-blue-500" />
                <span>{file.name}</span>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => handleFileSelect(file.id)}>
                <Edit className="w-4 h-4 mr-2" /> Edit File
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => handleDelete(file.id, false)} className="text-destructive">
                <Trash className="w-4 h-4 mr-2" /> Delete File
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 gap-4 border-b">
        <div>
          <h2 className="text-2xl font-bold">Marketing Plan Generator</h2>
          <p className="text-muted-foreground">Create compelling marketing material and pitches</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" /> Save Plan
        </Button>
      </div>

      <div className="flex-grow p-4 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="pitch">Pitch Generator</TabsTrigger>
            <TabsTrigger value="funding">Funding Announcement</TabsTrigger>
            <TabsTrigger value="objectives">Project Objectives</TabsTrigger>
            <TabsTrigger value="techstack">Tech Stack</TabsTrigger>
            <TabsTrigger value="mediatracking">Media Tracking</TabsTrigger>
            <TabsTrigger value="git">Git Explorer</TabsTrigger>
          </TabsList>
          
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
          
          <TabsContent value="pitch" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generated Pitch</CardTitle>
                <CardDescription>Your auto-generated elevator pitch based on selected parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md relative group">
                  <p>{customPitch || generatedPitch}</p>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard(customPitch || generatedPitch)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={generateRandomPitch}>
                  <Shuffle className="w-4 h-4 mr-2" /> Generate Random
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCustomPitch(generatedPitch)}
                  disabled={!!customPitch}
                >
                  <ArrowRight className="w-4 h-4 mr-2" /> Use as Template
                </Button>
              </CardFooter>
            </Card>

            {customPitch && (
              <Card>
                <CardHeader>
                  <CardTitle>Custom Pitch</CardTitle>
                  <CardDescription>Edit your pitch to perfect it</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    value={customPitch} 
                    onChange={(e) => setCustomPitch(e.target.value)}
                    placeholder="Edit your pitch here..."
                    rows={5}
                  />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline" onClick={() => setCustomPitch('')}>Clear</Button>
                </CardFooter>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Pitch Parameters</CardTitle>
                <CardDescription>Adjust the parameters to customize your pitch</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Funding Announcement</CardTitle>
                <CardDescription>Your auto-generated funding announcement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md relative group">
                  <p>{customFunding || generatedFunding}</p>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard(customFunding || generatedFunding)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={generateRandomFunding}>
                  <Shuffle className="w-4 h-4 mr-2" /> Generate Random
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCustomFunding(generatedFunding)}
                  disabled={!!customFunding}
                >
                  <ArrowRight className="w-4 h-4 mr-2" /> Use as Template
                </Button>
              </CardFooter>
            </Card>

            {customFunding && (
              <Card>
                <CardHeader>
                  <CardTitle>Custom Funding Announcement</CardTitle>
                  <CardDescription>Edit your announcement</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    value={customFunding} 
                    onChange={(e) => setCustomFunding(e.target.value)}
                    placeholder="Edit your funding announcement here..."
                    rows={5}
                  />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline" onClick={() => setCustomFunding('')}>Clear</Button>
                </CardFooter>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Funding Parameters</CardTitle>
                <CardDescription>Adjust the parameters to customize your funding announcement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                  <SlotMachine options={fundingRounds} label="Funding Round" value={fundingRound} onChange={setFundingRound} />
                  <SlotMachine options={fundingAmounts} label="Funding Amount" value={fundingAmount} onChange={setFundingAmount} />
                  <SlotMachine options={investorTypes} label="Investor Types" value={investorType} onChange={setInvestorType} />
                  <SlotMachine options={fundingReasons} label="Funding Reason" value={fundingReason} onChange={setFundingReason} />
                  <SlotMachine options={productTypes} label="Product Type" value={productType} onChange={setProductType} />
                  <SlotMachine options={productDescriptors} label="Product Descriptor" value={productDescriptor} onChange={setProductDescriptor} />
                  <SlotMachine options={achievements} label="Achievement" value={achievement} onChange={setAchievement} />
                  <SlotMachine options={marketActions} label="Market Action" value={marketAction} onChange={setMarketAction} />
                  <SlotMachine options={targetAudiences} label="Target Audience" value={targetAudience} onChange={setTargetAudience} />
                  <SlotMachine options={problemsSolved} label="Problem Solved" value={problemSolved} onChange={setProblemSolved} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NEW: Project Objectives Tab */}
          <TabsContent value="objectives" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Objectives</CardTitle>
                <CardDescription>Generated objectives, goals, and KPIs for your project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md relative group">
                  <pre className="whitespace-pre-wrap font-sans">{customObjectives || generatedObjectives}</pre>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard(customObjectives || generatedObjectives)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={generateRandomObjectives}>
                  <Shuffle className="w-4 h-4 mr-2" /> Generate Random
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCustomObjectives(generatedObjectives)}
                  disabled={!!customObjectives}
                >
                  <ArrowRight className="w-4 h-4 mr-2" /> Use as Template
                </Button>
              </CardFooter>
            </Card>

            {customObjectives && (
              <Card>
                <CardHeader>
                  <CardTitle>Custom Objectives</CardTitle>
                  <CardDescription>Edit your project objectives</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    value={customObjectives} 
                    onChange={(e) => setCustomObjectives(e.target.value)}
                    placeholder="Edit your objectives here..."
                    rows={8}
                  />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline" onClick={() => setCustomObjectives('')}>Clear</Button>
                </CardFooter>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Objectives Parameters</CardTitle>
                <CardDescription>Adjust the parameters to customize your project objectives</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 bg-muted/50">
                    <h3 className="font-medium flex items-center mb-3">
                      <Target className="w-4 h-4 mr-2 text-primary" /> Primary Goal
                    </h3>
                    <div className="space-y-2">
                      <SlotMachine options={goalVerbs} label="Action" value={goalVerb} onChange={setGoalVerb} />
                      <SlotMachine options={goalMetrics} label="Metric" value={goalMetric} onChange={setGoalMetric} />
                      <SlotMachine options={goalTargets} label="Target" value={goalTarget} onChange={setGoalTarget} />
                      <SlotMachine options={timeframes} label="Timeframe" value={timeframe} onChange={setTimeframe} />
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-muted/50">
                    <h3 className="font-medium flex items-center mb-3">
                      <Zap className="w-4 h-4 mr-2 text-primary" /> Strategy & Action
                    </h3>
                    <div className="space-y-2">
                      <SlotMachine options={objectiveAreas} label="Focus Area" value={objectiveArea} onChange={setObjectiveArea} />
                      <SlotMachine options={growthStrategies} label="Growth Strategy" value={growthStrategy} onChange={setGrowthStrategy} />
                      <SlotMachine options={actionVerbs} label="Action Verb" value={actionVerb} onChange={setActionVerb} />
                      <SlotMachine options={actionTargets} label="Deliverable" value={actionTarget} onChange={setActionTarget} />
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-muted/50">
                    <h3 className="font-medium flex items-center mb-3">
                      <ArrowUpRight className="w-4 h-4 mr-2 text-primary" /> Tracking & KPIs
                    </h3>
                    <div className="space-y-2">
                      <SlotMachine options={kpiMetrics} label="Key Metric" value={kpiMetric} onChange={setKpiMetric} />
                      {/* Additional placeholders for future KPI-related options */}
                      <div className="h-[136px] flex items-center justify-center text-muted-foreground text-sm">
                        More KPI options coming soon
                      </div>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NEW: Tech Stack Tab */}
          <TabsContent value="techstack" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Technology Stack</CardTitle>
                <CardDescription>Generated technology recommendations for your project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md relative group">
                  <pre className="whitespace-pre-wrap font-sans text-sm">{customTechStack || generatedTechStack}</pre>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard(customTechStack || generatedTechStack)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={generateRandomTechStack}>
                  <Shuffle className="w-4 h-4 mr-2" /> Generate Random
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCustomTechStack(generatedTechStack)}
                  disabled={!!customTechStack}
                >
                  <ArrowRight className="w-4 h-4 mr-2" /> Use as Template
                </Button>
              </CardFooter>
            </Card>

            {customTechStack && (
              <Card>
                <CardHeader>
                  <CardTitle>Custom Tech Stack</CardTitle>
                  <CardDescription>Edit your technology recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    value={customTechStack} 
                    onChange={(e) => setCustomTechStack(e.target.value)}
                    placeholder="Edit your tech stack here..."
                    rows={10}
                  />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline" onClick={() => setCustomTechStack('')}>Clear</Button>
                </CardFooter>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Technology Parameters</CardTitle>
                <CardDescription>Adjust the parameters to customize your tech stack</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 bg-muted/50">
                    <h3 className="font-medium flex items-center mb-3">
                      <Layers className="w-4 h-4 mr-2 text-primary" /> Architecture
                    </h3>
                    <div className="space-y-2">
                      <SlotMachine options={projectScales} label="Project Scale" value={projectScale} onChange={setProjectScale} />
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-muted/50">
                    <h3 className="font-medium flex items-center mb-3">
                      <Code className="w-4 h-4 mr-2 text-primary" /> Frontend
                    </h3>
                    <div className="space-y-2">
                      <SlotMachine options={frontendFrameworks} label="Framework" value={frontendFramework} onChange={setFrontendFramework} />
                      <SlotMachine options={testingFrameworks} label="Testing" value={testingFramework} onChange={setTestingFramework} />
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-muted/50">
                    <h3 className="font-medium flex items-center mb-3">
                      <Server className="w-4 h-4 mr-2 text-primary" /> Backend
                    </h3>
                    <div className="space-y-2">
                      <SlotMachine options={backendFrameworks} label="Framework" value={backendFramework} onChange={setBackendFramework} />
                      <SlotMachine options={cloudProviders} label="Cloud Provider" value={cloudProvider} onChange={setCloudProvider} />
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-muted/50">
                    <h3 className="font-medium flex items-center mb-3">
                      <Database className="w-4 h-4 mr-2 text-primary" /> Data & DevOps
                    </h3>
                    <div className="space-y-2">
                      <SlotMachine options={databases} label="Database" value={database} onChange={setDatabase} />
                      <SlotMachine options={devOpsTools} label="DevOps Tools" value={devOpsTool} onChange={setDevOpsTool} />
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NEW: Media Tracking Tab */}
          <TabsContent value="mediatracking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Media Tracking System</CardTitle>
                <CardDescription>Generated specifications for a media tracking and compliance system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md relative group">
                  <pre className="whitespace-pre-wrap font-sans text-sm">{customMediaTracking || generatedMediaTracking}</pre>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard(customMediaTracking || generatedMediaTracking)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={generateRandomMediaTracking}>
                  <Shuffle className="w-4 h-4 mr-2" /> Generate Random
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCustomMediaTracking(generatedMediaTracking)}
                  disabled={!!customMediaTracking}
                >
                  <ArrowRight className="w-4 h-4 mr-2" /> Use as Template
                </Button>
              </CardFooter>
            </Card>

            {customMediaTracking && (
              <Card>
                <CardHeader>
                  <CardTitle>Custom Media Tracking System</CardTitle>
                  <CardDescription>Edit your media tracking system specifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    value={customMediaTracking} 
                    onChange={(e) => setCustomMediaTracking(e.target.value)}
                    placeholder="Edit your media tracking system here..."
                    rows={12}
                  />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline" onClick={() => setCustomMediaTracking('')}>Clear</Button>
                </CardFooter>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Media Tracking Parameters</CardTitle>
                <CardDescription>Customize your compliance document tracking system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 bg-muted/50">
                    <h3 className="font-medium flex items-center mb-3">
                      <Users className="w-4 h-4 mr-2 text-primary" /> Industry & Users
                    </h3>
                    <div className="space-y-2">
                      <SlotMachine options={industrySegments} label="Industry Segment" value={industrySegment} onChange={setIndustrySegment} />
                      <SlotMachine options={userRoles} label="Primary User Role" value={userRole} onChange={setUserRole} />
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-muted/50">
                    <h3 className="font-medium flex items-center mb-3">
                      <FileText className="w-4 h-4 mr-2 text-primary" /> Documents & Compliance
                    </h3>
                    <div className="space-y-2">
                      <SlotMachine options={complianceTypes} label="Compliance Document Type" value={complianceType} onChange={setComplianceType} />
                      <SlotMachine options={securityFeatures} label="Security Feature" value={securityFeature} onChange={setSecurityFeature} />
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-muted/50">
                    <h3 className="font-medium flex items-center mb-3">
                      <Settings className="w-4 h-4 mr-2 text-primary" /> Workflow & Tracking
                    </h3>
                    <div className="space-y-2">
                      <SlotMachine options={workflowSteps} label="Workflow Step" value={workflowStep} onChange={setWorkflowStep} />
                      <SlotMachine options={trackingMethods} label="Tracking Method" value={trackingMethod} onChange={setTrackingMethod} />
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-muted/50">
                    <h3 className="font-medium flex items-center mb-3">
                      <BarChart className="w-4 h-4 mr-2 text-primary" /> Analytics & Integration
                    </h3>
                    <div className="space-y-2">
                      <SlotMachine options={analyticsFeatures} label="Analytics Feature" value={analyticsFeature} onChange={setAnalyticsFeature} />
                      <SlotMachine options={integrationPoints} label="Integration Point" value={integrationPoint} onChange={setIntegrationPoint} />
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NEW: Git Explorer Tab */}
          <TabsContent value="git" className="space-y-4">
            <Card className="flex-grow">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Git Explorer</CardTitle>
                    <CardDescription>Save and manage your marketing artifacts</CardDescription>
                  </div>
                  <Dialog open={isNewRepoDialogOpen} onOpenChange={setIsNewRepoDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <GitBranchPlus className="h-4 w-4 mr-2" /> New Repository
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Repository</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <label className="text-sm font-medium">Repository Name</label>
                        <Input 
                          value={newRepoName} 
                          onChange={e => setNewRepoName(e.target.value)} 
                          placeholder="my-marketing-plan" 
                          className="mt-1.5"
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNewRepoDialogOpen(false)}>Cancel</Button>
                        <Button onClick={createRepository}>Create</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-3 h-96 border-t">
                  {/* Repository Browser */}
                  <div className="border-r p-4">
                    <div className="flex flex-col h-full">
                      <h3 className="text-sm font-medium mb-2">Repositories</h3>
                      <ScrollArea className="flex-grow">
                        <div className="space-y-1">
                          {repos.map(repo => (
                            <div 
                              key={repo.id} 
                              className={cn(
                                "flex items-center gap-2 p-1.5 hover:bg-muted rounded-md cursor-pointer",
                                selectedRepoId === repo.id ? "bg-muted" : ""
                              )}
                              onClick={() => {
                                setSelectedRepoId(repo.id);
                                setSelectedPath([]);
                                setSelectedFile(null);
                                setFileContent('');
                              }}
                            >
                              <GitFork className="w-4 h-4 text-primary" />
                              <span>{repo.name}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                  
                  {/* File Browser */}
                  <div className="border-r p-4">
                    <div className="flex flex-col h-full">
                      {selectedRepoId ? (
                        <>
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-1.5">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={navigateUp} 
                                disabled={selectedPath.length === 0 && !selectedRepoId}
                              >
                                <ArrowRight className="h-4 w-4 rotate-180" />
                              </Button>
                              <h3 className="text-sm font-medium">
                                {selectedPath.length === 0 
                                  ? repos.find(r => r.id === selectedRepoId)?.name 
                                  : getCurrentDirectory()?.name}
                              </h3>
                            </div>
                            <div className="flex gap-2">
                              <Dialog open={isNewFileDialogOpen} onOpenChange={setIsNewFileDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <FileText className="h-3.5 w-3.5 mr-1.5" /> New File
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Create New File</DialogTitle>
                                  </DialogHeader>
                                  <div className="py-4">
                                    <label className="text-sm font-medium">File Name</label>
                                    <Input 
                                      value={newFileName} 
                                      onChange={e => setNewFileName(e.target.value)} 
                                      placeholder="file.md" 
                                      className="mt-1.5"
                                    />
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsNewFileDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={createFile}>Create</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              
                              <Dialog open={isNewDirDialogOpen} onOpenChange={setIsNewDirDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <FolderTree className="h-3.5 w-3.5 mr-1.5" /> New Dir
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Create New Directory</DialogTitle>
                                  </DialogHeader>
                                  <div className="py-4">
                                    <label className="text-sm font-medium">Directory Name</label>
                                    <Input 
                                      value={newDirName} 
                                      onChange={e => setNewDirName(e.target.value)} 
                                      placeholder="docs" 
                                      className="mt-1.5"
                                    />
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsNewDirDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={createDirectory}>Create</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                          <Separator className="my-2" />
                          <ScrollArea className="flex-grow">
                            {renderDirectory(getCurrentDirectory())}
                          </ScrollArea>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <p>Select a repository to view files</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* File Editor */}
                  <div className="p-4">
                    <div className="flex flex-col h-full">
                      {selectedFile ? (
                        <>
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium">{selectedFile.name}</h3>
                            <Button variant="outline" size="sm" onClick={saveFileChanges}>
                              <Save className="h-3.5 w-3.5 mr-1.5" /> Save
                            </Button>
                          </div>
                          <Separator className="my-2" />
                          <Textarea 
                            value={fileContent} 
                            onChange={(e) => setFileContent(e.target.value)}
                            className="flex-grow font-mono text-sm min-h-[300px]" 
                          />
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <p>Select a file to edit</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
