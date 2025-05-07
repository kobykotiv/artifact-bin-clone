import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import {
  Plus,
  FileText,
  ChevronDown,
  Building,
  DollarSign,
  PieChart,
  Target,
  Code,
  BarChart,
  ListTodo,
  Brain, 
  Box, 
  Brush, 
  Gamepad2, 
  BookOpen,
  Settings2,
  LayoutGrid,
  Globe,
  Smartphone,
  Rocket,
  TrendingUp,
  Briefcase,
  FolderOpen,
  Save
} from 'lucide-react';
import { LayoutSettings } from './Dashboard'; 

interface QuickActionsProps {
  createArtifact: (
    type: string,
    content?: string,
    title?: string,
    language?: string,
    metadata?: any
  ) => void;
  setLayout: (layout: LayoutSettings) => void;
  layout: LayoutSettings;
  setShowStartupOrgGenerator: (show: boolean) => void;
  onShowPseudocodeGenerator: (type: 'startupOrgPlan' | 'cardGameDesign' | 'shopifyTheme' | 'boardGameDesign' | 'language' | 'startup') => void;
  onShowPromptGenerator: (type: PromptType) => void; // Use PromptType from PromptGenerator
  onShowStatistics: () => void;
  onShowCustomTemplateManager: () => void; // New prop
  activeTab: string; // To show relevant guides
  setActiveTab: (tabId: string) => void; // To switch to guides
  onSaveAll?: () => void; // Optional: if a global save action is desired
}

export function QuickActions({
  createArtifact,
  setLayout,
  layout,
  setShowStartupOrgGenerator,
  onShowPseudocodeGenerator,
  onShowPromptGenerator,
  onShowStatistics,
  onShowCustomTemplateManager,
  activeTab,
  setActiveTab,
  onSaveAll
}: QuickActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="file-menu-trigger">
          <FileText className="mr-2 h-4 w-4" />
          File
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72"> {/* Increased width */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>New Artifact</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => createArtifact('code')}>
            <Code className="mr-2 h-4 w-4" />
            Code Snippet
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => createArtifact('project')}>
            <Plus className="mr-2 h-4 w-4" />
            Project Specification
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>Business Planning</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => createArtifact('marketing')}>
            <BarChart className="mr-2 h-4 w-4" />
            Marketing Plan
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => createArtifact('fundraising')}>
            <DollarSign className="mr-2 h-4 w-4" />
            Fundraising Plan
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => createArtifact('budget')}>
            <DollarSign className="mr-2 h-4 w-4" />
            Budget Plan
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => createArtifact('shares')}>
            <PieChart className="mr-2 h-4 w-4" />
            Shares Plan
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onShowPseudocodeGenerator('startup')}>
            <Building className="mr-2 h-4 w-4" />
            Startup Plan (Outline)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => createArtifact('objectives')}>
            <Target className="mr-2 h-4 w-4" />
            Objectives Plan (OKRs)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowStartupOrgGenerator(true)}>
            <LayoutGrid className="mr-2 h-4 w-4" /> {/* Changed Icon */}
            Startup Org Structure
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>Generators</DropdownMenuLabel>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Code className="mr-2 h-4 w-4" />
              <span>Pseudocode & Specs</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => onShowPseudocodeGenerator('language')}>
                  Generic Pseudocode
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShowPseudocodeGenerator('startupOrgPlan')}>
                  Startup Org Plan (Dummies Guide)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShowPseudocodeGenerator('shopifyTheme')}>
                  Shopify Theme Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShowPseudocodeGenerator('boardGameDesign')}>
                  Board Game Design
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShowPseudocodeGenerator('cardGameDesign')}>
                  Card Game Design
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Brain className="mr-2 h-4 w-4" />
              <span>Prompt Generators</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => onShowPromptGenerator('startupFoundation')}>
                  <Building className="mr-2 h-4 w-4" /> Startup Foundation
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShowPromptGenerator('saaSModelCanvas')}>
                  <LayoutGrid className="mr-2 h-4 w-4" /> SaaS Model Canvas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShowPromptGenerator('businessPlan')}>
                  <Briefcase className="mr-2 h-4 w-4" /> Business Plan Sections
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShowPromptGenerator('marketingPlan')}>
                  <BarChart className="mr-2 h-4 w-4" /> Marketing Strategy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShowPromptGenerator('techStack')}>
                  <Code className="mr-2 h-4 w-4" /> Tech Stack Design
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onShowPromptGenerator('websiteDesign')}>
                  <Globe className="mr-2 h-4 w-4" /> Website Design Brief
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShowPromptGenerator('mobileAppConcept')}>
                  <Smartphone className="mr-2 h-4 w-4" /> Mobile App Concept
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShowPromptGenerator('aiMlAppConcept')}>
                  <Brain className="mr-2 h-4 w-4" /> AI/ML App Concept
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShowPromptGenerator('threeJsApp')}>
                  <Box className="mr-2 h-4 w-4" /> Faux 3D App (Three.js)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShowPromptGenerator('wordpressTheme')}>
                  <Brush className="mr-2 h-4 w-4" /> WordPress Theme Brief
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuLabel>Guides & Tools</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setActiveTab('startupOrgGuide')}>
            <BookOpen className="mr-2 h-4 w-4" /> Startup Organization Guide
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveTab('saaSBootstrapperGuide')}>
            <Rocket className="mr-2 h-4 w-4" /> SaaS Bootstrapper's Guide
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveTab('saaSFinancialFreedomGuide')}>
            <DollarSign className="mr-2 h-4 w-4" /> SaaS Financial Freedom Guide
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveTab('startupScalingGuide')}>
            <TrendingUp className="mr-2 h-4 w-4" /> Startup Scaling Guide
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveTab('corporation')}>
            <Briefcase className="mr-2 h-4 w-4" /> Corporation Setup Guide
          </DropdownMenuItem>
           <DropdownMenuItem onClick={() => setActiveTab('termsheet')}>
            <FileText className="mr-2 h-4 w-4" /> Term Sheet Guide
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>Project Management</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => createArtifact('sprint')}>
            <ListTodo className="mr-2 h-4 w-4" />
            Sprint Plan
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>View Options</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onShowStatistics()}>
            <BarChart className="mr-2 h-4 w-4" /> Usage Statistics
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLayout({ ...layout, showExplorer: !layout.showExplorer })}>
            <FolderOpen className="mr-2 h-4 w-4" />
            {layout.showExplorer ? "Hide Explorer" : "Show Explorer"}
          </DropdownMenuItem>
          {/* Add other layout/view options if necessary */}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onShowCustomTemplateManager}>
          <Settings2 className="mr-2 h-4 w-4" />
          Manage Custom Templates
        </DropdownMenuItem>
        {onSaveAll && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSaveAll}>
              <Save className="mr-2 h-4 w-4" />
              Save All Changes
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
