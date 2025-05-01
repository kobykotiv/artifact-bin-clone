import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Shuffle, Copy, Save, ArrowRight, RotateCw, Target, Zap, ArrowUpRight, Code, Server, Database, GitBranchPlus, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { type ArtifactData } from '@/lib/services/db';

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
          testingFramework
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
      }
    } catch (error) {
      console.error('Error loading marketing plan data:', error);
    }
  }, [artifact]);

  const generatedPitch = generatePitch();
  const generatedFunding = generateFundingAnnouncement();
  const generatedObjectives = generateObjectives();
  const generatedTechStack = generateTechStack();

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
            <TabsTrigger value="pitch">Pitch Generator</TabsTrigger>
            <TabsTrigger value="funding">Funding Announcement</TabsTrigger>
            <TabsTrigger value="objectives">Project Objectives</TabsTrigger>
            <TabsTrigger value="techstack">Tech Stack</TabsTrigger>
          </TabsList>
          
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
        </Tabs>
      </div>
    </div>
  );
}
