import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  Brain, // For AI/ML or general prompts
  Box, // For 3D
  Brush, // For themes
  Gamepad2, // For games
  BookOpen // For Startup Org Plan
} from 'lucide-react';
import { LayoutSettings } from './Dashboard'; // Assuming LayoutSettings is here

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
  // Add new props for showing specific generators
  onShowPseudocodeGenerator: (type: 'startupOrgPlan' | 'cardGameDesign' | 'shopifyTheme' | 'boardGameDesign' | 'language') => void;
  onShowPromptGenerator: (type: 'threeJsApp' | 'wordpressTheme' | 'websiteDesign' | 'mobileAppConcept' | 'aiMlAppConcept' | 'businessPlan' | 'marketingPlan' | 'techStack' | 'startupFoundation' | 'saaSModelCanvas') => void;
}

export function QuickActions({
  createArtifact,
  setLayout,
  layout,
  setShowStartupOrgGenerator,
  onShowPseudocodeGenerator,
  onShowPromptGenerator
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
      <DropdownMenuContent align="start" className="w-64"> {/* Increased width for more items */}
        <DropdownMenuLabel>Create New Artifact</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => createArtifact('code')}>
          <Code className="mr-2 h-4 w-4" />
          Code Snippet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => createArtifact('project')}>
          <Plus className="mr-2 h-4 w-4" />
          Project Specification
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Business Planning</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => createArtifact('marketing')}>
          <BarChart className="mr-2 h-4 w-4" />
          Marketing Plan
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => createArtifact('fundraising')}>
          <DollarSign className="mr-2 h-4 w-4" /> {/* Changed icon for variety */}
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
        <DropdownMenuItem onClick={() => createArtifact('startup')}>
          <Building className="mr-2 h-4 w-4" />
          Startup Legal Plan
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => createArtifact('objectives')}>
          <Target className="mr-2 h-4 w-4" />
          Objectives Plan (OKRs)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setShowStartupOrgGenerator(true)}>
          <Building className="mr-2 h-4 w-4" />
          Startup Org Structure
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Pseudocode & Specs</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onShowPseudocodeGenerator('language')}>
          <Code className="mr-2 h-4 w-4" />
          Generic Pseudocode
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShowPseudocodeGenerator('startupOrgPlan')}>
          <BookOpen className="mr-2 h-4 w-4" />
          Startup Org Plan (Pseudo)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShowPseudocodeGenerator('shopifyTheme')}>
          <Brush className="mr-2 h-4 w-4" />
          Shopify Theme Plan (Pseudo)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShowPseudocodeGenerator('boardGameDesign')}>
          <Gamepad2 className="mr-2 h-4 w-4" />
          Board Game Design (Pseudo)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShowPseudocodeGenerator('cardGameDesign')}>
          <Gamepad2 className="mr-2 h-4 w-4" /> {/* Could use a different icon like Layers */}
          Card Game Design (Pseudo)
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Prompt Generators</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onShowPromptGenerator('websiteDesign')}>
          <Globe className="mr-2 h-4 w-4" />
          Website Design Brief
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShowPromptGenerator('mobileAppConcept')}>
          <Smartphone className="mr-2 h-4 w-4" />
          Mobile App Concept
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShowPromptGenerator('aiMlAppConcept')}>
          <Brain className="mr-2 h-4 w-4" />
          AI/ML App Concept
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShowPromptGenerator('threeJsApp')}>
          <Box className="mr-2 h-4 w-4" />
          Faux 3D App (Three.js)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShowPromptGenerator('wordpressTheme')}>
          <Brush className="mr-2 h-4 w-4" />
          WordPress Theme Brief
        </DropdownMenuItem>
        {/* Add other prompt generator links here if needed */}
        <DropdownMenuItem onClick={() => onShowPromptGenerator('startupFoundation')}>
            <Building className="mr-2 h-4 w-4" />
            Startup Foundation Prompt
        </DropdownMenuItem>
         <DropdownMenuItem onClick={() => onShowPromptGenerator('saaSModelCanvas')}>
            <LayoutGrid className="mr-2 h-4 w-4" />
            SaaS Model Canvas Prompt
        </DropdownMenuItem>


        <DropdownMenuSeparator />
        <DropdownMenuLabel>Project Management</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => createArtifact('sprint')}>
          <ListTodo className="mr-2 h-4 w-4" />
          Sprint Plan
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>View Options</DropdownMenuLabel>
        <DropdownMenuItem 
          onClick={() => setLayout({ activeTab: "pseudocode", tabVisibility: { ...layout.tabVisibility, pseudocode: true } })}
        >
          <Code className="mr-2 h-4 w-4" />
          Show Pseudocode Tab
        </DropdownMenuItem>
        {/* Add other layout/view options if necessary */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
