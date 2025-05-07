import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { startupForDummiesGuide } from '@/lib/businessGuides/startupForDummiesGuide';

interface PseudocodeGeneratorProps {
  onGenerate: (code: string, metadata: any) => void;
  onClose: () => void;
  initialGenerationType?: 'language' | 'startup' | 'shopifyTheme' | 'boardGameDesign' | 'startupOrgPlan' | 'cardGameDesign'; // Added new types
}

const languageOptions = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'C#', value: 'csharp' },
  { label: 'Go', value: 'go' },
  { label: 'Rust', value: 'rust' },
  { label: 'Ruby', value: 'ruby' },
] as const;

const startupFormSchema = z.object({
  companyName: z.string().min(2, { message: "Company name is required" }),
  industry: z.string().min(2, { message: "Industry is required" }),
  targetAudience: z.string().min(2, { message: "Target audience is required" }),
  problemStatement: z.string().min(10, { message: "Problem statement should be more detailed" }),
  proposedSolution: z.string().min(10, { message: "Proposed solution should be more detailed" }),
  keyFeatures: z.string().min(5, { message: "Please list at least a few key features (one per line)" }), // Clarified placeholder
});

// New Schema for Shopify Theme
const shopifyThemeFormSchema = z.object({
  themeName: z.string().min(2, { message: "Theme name is required" }),
  themeStyle: z.string().min(3, { message: "Describe the theme style (e.g., minimalist, bold, playful)" }),
  targetNiche: z.string().min(3, { message: "Target e-commerce niche (e.g., fashion, electronics, handmade)" }),
  keySectionsHomepage: z.string().min(5, { message: "List key homepage sections (one per line)" }),
  productPageFeatures: z.string().min(5, { message: "List key product page features (one per line)" }),
  uniqueFeature: z.string().optional().describe("A unique feature or selling point for this theme"),
});

// New Schema for Board Game Design
const boardGameFormSchema = z.object({
  gameTitle: z.string().min(2, { message: "Game title is required" }),
  playerCount: z.string().min(1, { message: "Player count is required (e.g., 2-4 players)" }),
  gameTheme: z.string().min(3, { message: "Describe the game's theme" }),
  coreMechanics: z.string().min(5, { message: "List core game mechanics (one per line, e.g., dice rolling, worker placement)" }),
  winCondition: z.string().min(5, { message: "How do players win the game?" }),
  keyComponents: z.string().min(5, { message: "List key game components (one per line, e.g., game board, custom dice, player tokens)" }),
});

// Schema for Startup Organization Plan (based on startupForDummiesGuide)
const startupOrgPlanFormSchema = z.object({
  businessName: z.string().min(2, { message: "Business name is required" }),
  // Dynamically create schema fields based on placeholders in the guide
  ...startupForDummiesGuide.steps.reduce((acc, step) => {
    Object.keys(step.placeholders).forEach(placeholderKey => {
      acc[placeholderKey] = z.string().optional();
    });
    return acc;
  }, {} as Record<string, z.ZodOptional<z.ZodString>>)
});

// New Schema for Card Game Design
const cardGameFormSchema = z.object({
  gameTitle: z.string().min(2, { message: "Game title is required" }),
  playerCount: z.string().min(1, { message: "Player count is required (e.g., 2-4 players)" }),
  gameTheme: z.string().min(3, { message: "Describe the game's theme" }),
  coreMechanics: z.string().min(5, { message: "List core game mechanics (one per line, e.g., hand management, deck building)" }),
  cardTypesAndDistribution: z.string().min(5, { message: "List card types and rough counts (e.g., 20 Attack Cards, 15 Spell Cards)"}),
  winCondition: z.string().min(5, { message: "How do players win the game?" }),
  setupInstructions: z.string().min(10, {message: "Briefly describe game setup."}),
});


type StartupFormValues = z.infer<typeof startupFormSchema>;
type ShopifyThemeFormValues = z.infer<typeof shopifyThemeFormSchema>;
type BoardGameFormValues = z.infer<typeof boardGameFormSchema>;
type StartupOrgPlanFormValues = z.infer<typeof startupOrgPlanFormSchema>; // New
type CardGameFormValues = z.infer<typeof cardGameFormSchema>; // New

export const PseudocodeGenerator = ({ onGenerate, onClose, initialGenerationType = 'language' }: PseudocodeGeneratorProps) => {
  const [generationType, setGenerationType] = useState<'language' | 'startup' | 'shopifyTheme' | 'boardGameDesign' | 'startupOrgPlan' | 'cardGameDesign'>(initialGenerationType); // Extended
  const [language, setLanguage] = useState('javascript');
  const [generatedCode, setGeneratedCode] = useState('');

  const startupForm = useForm<StartupFormValues>({
    resolver: zodResolver(startupFormSchema),
    defaultValues: {
      companyName: '',
      industry: '',
      targetAudience: '',
      problemStatement: '',
      proposedSolution: '',
      keyFeatures: '',
    },
  });

  const shopifyThemeForm = useForm<ShopifyThemeFormValues>({ // New
    resolver: zodResolver(shopifyThemeFormSchema),
    defaultValues: {
      themeName: '',
      themeStyle: '',
      targetNiche: '',
      keySectionsHomepage: '',
      productPageFeatures: '',
      uniqueFeature: '',
    },
  });

  const boardGameForm = useForm<BoardGameFormValues>({ // New
    resolver: zodResolver(boardGameFormSchema),
    defaultValues: {
      gameTitle: '',
      playerCount: '',
      gameTheme: '',
      coreMechanics: '',
      winCondition: '',
      keyComponents: '',
    },
  });

  const startupOrgPlanForm = useForm<StartupOrgPlanFormValues>({ // New
    resolver: zodResolver(startupOrgPlanFormSchema),
    defaultValues: {
      businessName: '',
      ...startupForDummiesGuide.steps.reduce((acc, step) => {
        Object.keys(step.placeholders).forEach(placeholderKey => {
          acc[placeholderKey] = '';
        });
        return acc;
      }, {} as Record<string, string>)
    },
  });

  const cardGameForm = useForm<CardGameFormValues>({ // New
    resolver: zodResolver(cardGameFormSchema),
    defaultValues: {
      gameTitle: '',
      playerCount: '',
      gameTheme: '',
      coreMechanics: '',
      cardTypesAndDistribution: '',
      winCondition: '',
      setupInstructions: '',
    },
  });

  const generateLanguageTemplate = (lang: string) => {
    const templates: Record<string, string> = {
      javascript: `/**
 * Project Pseudocode - JavaScript Implementation
 */

// Initialize application
function initializeApp() {
  // Set up environment
  // Configure dependencies
  // Initialize database connections
}

// Setup user authentication
function setupAuth() {
  // Configure authentication strategies
  // Define user model
  // Create login/signup flows
}

// Define core business logic
function implementBusinessLogic() {
  // Define data models
  // Implement CRUD operations
  // Set up validation rules
}

// Create API endpoints
function createAPIEndpoints() {
  // Define routes
  // Implement controllers
  // Set up middleware
}

// Main application entry point
function main() {
  initializeApp();
  setupAuth();
  implementBusinessLogic();
  createAPIEndpoints();
  
  // Start server
  console.log("Application started successfully");
}

main();`,
      typescript: `/**
 * Project Pseudocode - TypeScript Implementation
 */

// Types and interfaces
interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface Config {
  port: number;
  environment: 'development' | 'production';
  databaseUrl: string;
}

// Initialize application
function initializeApp(config: Config): void {
  // Set up environment
  // Configure dependencies
  // Initialize database connections
}

// Setup user authentication
function setupAuth(): void {
  // Configure authentication strategies
  // Create login/signup flows
}

// Define core business logic
function implementBusinessLogic(): void {
  // Define data models
  // Implement CRUD operations
  // Set up validation rules
}

// Create API endpoints
function createAPIEndpoints(): void {
  // Define routes
  // Implement controllers
  // Set up middleware
}

// Main application entry point
function main(): void {
  const config: Config = {
    port: 3000,
    environment: 'development',
    databaseUrl: 'mongodb://localhost:27017'
  };
  
  initializeApp(config);
  setupAuth();
  implementBusinessLogic();
  createAPIEndpoints();
  
  console.log("Application started on port", config.port);
}

main();`,
      python: `"""
Project Pseudocode - Python Implementation
"""

# Import necessary libraries
import os
import sys
from typing import Dict, List, Optional

# Configuration
class Config:
    def __init__(self):
        self.debug = True
        self.port = 8000
        self.database_url = "sqlite:///app.db"

# Initialize application
def initialize_app(config: Config) -> None:
    # Set up environment
    # Configure dependencies
    # Initialize database connections
    pass

# Setup user authentication
def setup_auth() -> None:
    # Configure authentication strategies
    # Define user model
    # Create login/signup flows
    pass

# Define core business logic
def implement_business_logic() -> None:
    # Define data models
    # Implement CRUD operations
    # Set up validation rules
    pass

# Create API endpoints
def create_api_endpoints() -> None:
    # Define routes
    # Implement controllers
    # Set up middleware
    pass

# Main application entry point
def main() -> None:
    config = Config()
    initialize_app(config)
    setup_auth()
    implement_business_logic()
    create_api_endpoints()
    
    print(f"Application started on port {config.port}")

if __name__ == "__main__":
    main()`,
    };

    return templates[lang] || `// Pseudocode for ${lang} project\n\n// TODO: Implement ${lang} specific template`;
  };

  const generateStartupTemplate = (data: StartupFormValues, programmingLanguage: string) => {
    // Retaining the programmingLanguage parameter for consistency, though less direct for a business plan.
    // It could be used to suggest tech stack considerations within the plan.

    const featuresList = data.keyFeatures.split('\n').map(f => f.trim()).filter(f => f);

    return `/**
 * Business Plan Outline for: ${data.companyName}
 * Industry: ${data.industry}
 * Target Audience: ${data.targetAudience}
 * Implementation Language Focus (for tech aspects): ${programmingLanguage}
 */

// SECTION 1: EXECUTIVE SUMMARY
// Purpose: Briefly summarize the entire business plan.
// Key Points:
//   - Business Concept: Solving '${data.problemStatement}' for '${data.targetAudience}'.
//   - Proposed Solution: '${data.proposedSolution}'.
//   - Mission Statement: [Define your company's mission]
//   - Vision Statement: [Define your company's long-term vision]
//   - Financial Highlights: [Summarize key financial projections and funding needs]
//   - Management Team: [Briefly introduce key team members and expertise]

// SECTION 2: COMPANY DESCRIPTION
// Purpose: Provide detailed information about your company.
// Content:
//   - Company Overview: Legal name, structure, history (if any).
//   - Mission and Vision: (Elaborate from Executive Summary)
//   - Goals and Objectives: Short-term and long-term business goals.
//   - Core Values: [Define the principles that guide your company]

// SECTION 3: MARKET ANALYSIS
// Purpose: Demonstrate your understanding of the industry and market.
// Content:
//   - Industry Overview: Size, growth rate, trends, and outlook for '${data.industry}'.
//   - Target Market: Detailed profile of '${data.targetAudience}'.
//     - Demographics, psychographics, needs, and buying behavior.
//   - Market Needs: Elaborate on '${data.problemStatement}'.
//   - Competition Analysis: Identify key competitors, their strengths/weaknesses, and your competitive advantages.

// SECTION 4: ORGANIZATION AND MANAGEMENT
// Purpose: Outline your business's organizational structure and management team.
// Content:
//   - Organizational Structure: [Describe proposed structure: flat, hierarchical, functional, etc.]
//   - Management Team: Bios of key personnel, roles, responsibilities, and expertise.
//   - Board of Directors/Advisors: (If applicable)
//   - Human Resources Plan: Staffing needs, recruitment, training.

// SECTION 5: PRODUCTS OR SERVICES
// Purpose: Detail what you are offering.
// Content:
//   - Product/Service Description: In-depth explanation of '${data.proposedSolution}'.
//   - Key Features and Benefits:
${featuresList.map(feature => `//     - ${feature}: [Describe benefit to the user]`).join('\n')}
//   - Product Development Lifecycle: Current stage, future development plans, R&D.
//   - Intellectual Property: Patents, trademarks, copyrights (if any).

// SECTION 6: MARKETING AND SALES STRATEGY
// Purpose: Explain how you will reach your target market and generate sales.
// Content:
//   - Marketing Strategy:
//     - Positioning: How '${data.companyName}' will be perceived in the market.
//     - Pricing Strategy: [Detail your pricing model and justification]
//     - Promotion Plan: Advertising, PR, content marketing, social media for '${data.targetAudience}'.
//     - Distribution Channels: How products/services will be delivered.
//   - Sales Strategy:
//     - Sales Process: [Outline the steps from lead generation to closing a sale]
//     - Sales Team: (If applicable) Structure and roles.

// SECTION 7: FINANCIAL PLAN & PROJECTIONS
// Purpose: Present your financial forecasts and funding requirements.
// Content:
//   - Startup Costs: [List all initial investment expenses]
//   - Funding Request: (If seeking funding) Amount, use of funds, terms.
//   - Financial Projections:
//     - Income Statement (Profit & Loss): Forecasted for 3-5 years.
//     - Cash Flow Statement: Forecasted for 3-5 years.
//     - Balance Sheet: Forecasted for 3-5 years.
//   - Break-Even Analysis: [Calculate when the business will become profitable]
//   - Key Assumptions: [List the assumptions underlying your financial projections]

// SECTION 8: APPENDIX (Optional)
// Purpose: Include supplementary documents.
// Content:
//   - Resumes of key personnel
//   - Permits, licenses
//   - Market research data
//   - Letters of intent or contracts
//   - Detailed financial statements

// Main application initialization (Conceptual for business plan context)
function executeBusinessPlan() {
  // Phase 1: Setup & Legal (Months 1-3)
  // Phase 2: Product Development & Initial Marketing (Months 3-9)
  // Phase 3: Launch & Scale (Months 9+)
  console.log("Business Plan for ${data.companyName} is ready for execution.");
}

executeBusinessPlan();`;
  };

  // New template function for Shopify Theme
  const generateShopifyThemeTemplate = (data: ShopifyThemeFormValues) => {
    const homepageSections = data.keySectionsHomepage.split('\n').map(s => s.trim()).filter(s => s);
    const productPageFeaturesList = data.productPageFeatures.split('\n').map(f => f.trim()).filter(f => f);

    return `/**
 * Shopify Theme Plan: ${data.themeName}
 * Style: ${data.themeStyle}
 * Target Niche: ${data.targetNiche}
 */

// SECTION 1: THEME OVERVIEW
// Purpose: Define the core concept and target audience for the theme.
//   - Theme Name: ${data.themeName}
//   - Elevator Pitch: A brief description of the theme's main selling point.
//   - Target Store Type: Ideal for stores selling {{e.g., clothing, digital goods, services}} within the '${data.targetNiche}' niche.
//   - Overall Style: ${data.themeStyle} (e.g., clean & modern, rustic & handmade, bold & vibrant).
//   - Unique Selling Proposition: ${data.uniqueFeature || '[Define a unique aspect or feature]'}

// SECTION 2: KEY TEMPLATES & SECTIONS

//   PART 2.1: HOMEPAGE
//   Purpose: Engage visitors and guide them to key areas of the store.
//   Key Sections:
${homepageSections.map(section => `//     - ${section}: [Brief description of content and purpose]`).join('\n')}
//   General Layout Notes: [e.g., Full-width hero, grid-based product display]

//   PART 2.2: PRODUCT PAGE (product.liquid)
//   Purpose: Convert visitors into customers by showcasing product details effectively.
//   Key Features & Elements:
${productPageFeaturesList.map(feature => `//     - ${feature}: [Details on implementation or display]`).join('\n')}
//   Image Handling: [e.g., Main image gallery, zoom functionality, video support]
//   Variant Selection: [Style and interaction for product variants]
//   Related Products/Upsells: [Strategy and placement]

//   PART 2.3: COLLECTION PAGE (collection.liquid)
//   Purpose: Allow users to browse and filter products within a category.
//   Key Features:
//     - Grid/List View Toggle:
//     - Sorting Options: [e.g., Price, Best Selling, Newest]
//     - Filtering Options: [e.g., By tags, price range, variants]
//     - Product Card Design: [Information to display on each product item]
//     - Pagination/Infinite Scroll:

//   PART 2.4: CART PAGE (cart.liquid)
//   Purpose: Allow users to review their selections and proceed to checkout.
//   Key Features:
//     - Order Summary:
//     - Quantity Adjustments:
//     - Shipping Estimator (optional):
//     - Discount Code Input:
//     - Clear Call to Action for Checkout:

//   PART 2.5: BLOG & ARTICLE PAGES (blog.liquid, article.liquid)
//   Purpose: Content marketing and SEO.
//   Key Features:
//     - Blog Index Layout: [e.g., Grid, list with excerpts]
//     - Article Page Layout: [e.g., Sidebar for categories/tags, social sharing]

// SECTION 3: THEME SETTINGS (settings_schema.json)
// Purpose: Define customizable options for merchants in the Shopify Theme Editor.
// Key Setting Groups:
//   - Colors: [e.g., Primary, Secondary, Accent, Text, Backgrounds]
//   - Typography: [e.g., Headings font, Body font, Font sizes]
//   - Header: [e.g., Logo upload, Menu selection, Announcement bar]
//   - Footer: [e.g., Menu selection, Social links, Payment icons]
//   - Homepage Sections: [Settings for each customizable homepage section]
//   - Product Page: [Settings for product image display, variant selectors, etc.]
//   - Collection Page: [Settings for product grid, filters, sorting]

// SECTION 4: TECHNICAL CONSIDERATIONS
//   - Performance: Target Lighthouse scores, image optimization strategy.
//   - Accessibility (A11Y): Adherence to WCAG guidelines.
//   - Responsive Design: Breakpoints and testing strategy for mobile, tablet, desktop.
//   - Liquid & JavaScript: Key Liquid objects to be used, any specific JS libraries or frameworks.
//   - App Compatibility: Considerations for common Shopify apps.

// SECTION 5: DEVELOPMENT PLAN (High-Level)
//   - Phase 1: Basic structure and core templates (product, collection, cart).
//   - Phase 2: Homepage sections and styling.
//   - Phase 3: Theme settings implementation.
//   - Phase 4: Testing, refinement, and documentation.

// Main function (conceptual for theme development)
function developTheme() {
  // Setup local Shopify development environment (e.g., Shopify CLI, Theme Kit)
  // Implement Liquid templates and SCSS/CSS
  // Develop JavaScript for interactions
  // Configure settings_schema.json
  // Test thoroughly across devices and browsers
  console.log("Development of Shopify theme '${data.themeName}' initiated.");
}

developTheme();`;
  };

  // New template function for Board Game Design
  const generateBoardGameTemplate = (data: BoardGameFormValues) => {
    const mechanicsList = data.coreMechanics.split('\n').map(m => m.trim()).filter(m => m);
    const componentsList = data.keyComponents.split('\n').map(c => c.trim()).filter(c => c);

    return `/**
 * Board Game Design Document: ${data.gameTitle}
 * Players: ${data.playerCount}
 * Theme: ${data.gameTheme}
 */

// SECTION 1: GAME OVERVIEW
//   - Game Title: ${data.gameTitle}
//   - Elevator Pitch: [A concise summary of the game's appeal and core experience]
//   - Player Count: ${data.playerCount}
//   - Playing Time: [Estimated playing time, e.g., 30-60 minutes]
//   - Target Audience: [e.g., Families, strategy gamers, party game enthusiasts]
//   - Theme: ${data.gameTheme}

// SECTION 2: GAME COMPONENTS
//   Purpose: List all physical and conceptual parts of the game.
${componentsList.map(component => `//   - ${component}: [Description, quantity, material if applicable]`).join('\n')}

// SECTION 3: SETUP
//   Purpose: Detail the steps to prepare the game for play.
//   [Step-by-step instructions for setting up the game board, player areas, initial resources, etc.]

// SECTION 4: GAMEPLAY & RULES
//   Purpose: Explain how the game is played, turn structure, and player actions.
//   Core Mechanics:
${mechanicsList.map(mechanic => `//     - ${mechanic}: [Detailed explanation of how this mechanic works]`).join('\n')}
//   Turn Structure:
//     [Describe what a player does on their turn, phases of a turn/round]
//   Player Actions:
//     [List and explain all possible actions a player can take]
//   Special Rules:
//     [Any unique rules, exceptions, or interactions]

// SECTION 5: ENDGAME & WINNING
//   - Game End Trigger: [How does the game end? e.g., specific round, condition met]
//   - Winning Condition: ${data.winCondition}
//   - Scoring (if applicable): [How are points calculated?]
//   - Tie-Breakers: [How are ties resolved?]

// SECTION 6: DESIGN GOALS & PLAYER EXPERIENCE
//   - Key Emotions/Feelings to Evoke: [e.g., Excitement, tension, cleverness]
//   - Strategic Depth vs. Luck: [Balance between strategy and chance]
//   - Replayability Factors: [What makes players want to play again?]
//   - Unique Selling Points: [What makes this game stand out from others?]

// SECTION 7: PLAYTESTING NOTES (Conceptual Area)
//   - Initial Playtest Feedback:
//   - Balance Issues Identified:
//   - Rules Clarity Issues:
//   - Fun Factor Assessment:

// Main function (conceptual for game design process)
function designGame() {
  // Prototype components
  // Draft initial rulebook
  // Conduct internal playtests
  // Iterate on mechanics and rules based on feedback
  // Refine component design
  // Conduct blind playtests
  console.log("Board game design for '${data.gameTitle}' is underway.");
}

designGame();`;
  };

  const generateStartupOrgPlanTemplate = (data: StartupOrgPlanFormValues) => {
    let plan = `/**
 * Startup Organization Plan: ${data.businessName}
 * Based on: Startup Organization for Dummies Guide
 */\n\n`;

    startupForDummiesGuide.steps.forEach(step => {
      plan += `// SECTION: ${step.title.toUpperCase()}\n`;
      plan += `// Purpose: ${step.content}\n`;
      Object.entries(step.placeholders).forEach(([key, placeholder]) => {
        const value = data[key as keyof StartupOrgPlanFormValues] || placeholder;
        plan += `//   - ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}\n`;
      });
      plan += "\n";
    });

    plan += `// Main function (conceptual for business organization process)
function organizeStartup_${data.businessName.replace(/\s+/g, '_')}() {
  // Step 1: Finalize Ideation & Concept
  // Step 2: Conduct Thorough Market Research
  // Step 3: Develop Comprehensive Business Plan
  // Step 4: Complete Legal & Administrative Setup
  // Step 5: Secure Funding & Manage Finances
  // Step 6: Build the Team (if applicable)
  // Step 7: Establish Brand & Marketing Strategy
  // Step 8: Develop Product/Service (MVP)
  // Step 9: Plan and Execute Launch
  // Step 10: Implement Post-Launch Operations & Growth Strategies
  console.log("Startup organization process for '${data.businessName}' initiated.");
}

organizeStartup_${data.businessName.replace(/\s+/g, '_')}();`;
    return plan;
  };

  const generateCardGameTemplate = (data: CardGameFormValues) => {
    const mechanicsList = data.coreMechanics.split('\n').map(m => m.trim()).filter(m => m);
    const cardTypesList = data.cardTypesAndDistribution.split('\n').map(c => c.trim()).filter(c => c);

    return `/**
 * Card Game Design Document: ${data.gameTitle}
 * Players: ${data.playerCount}
 * Theme: ${data.gameTheme}
 */

// SECTION 1: GAME OVERVIEW
//   - Game Title: ${data.gameTitle}
//   - Elevator Pitch: [A concise summary of the game's appeal and core experience]
//   - Player Count: ${data.playerCount}
//   - Playing Time: [Estimated playing time, e.g., 15-45 minutes]
//   - Target Audience: [e.g., Casual players, strategy card gamers, families]
//   - Theme: ${data.gameTheme}

// SECTION 2: GAME COMPONENTS
//   Purpose: List all physical cards and other components.
//   Card Types & Distribution:
${cardTypesList.map(cardType => `//     - ${cardType}: [Description of card type, quantity if specific]`).join('\n')}
//   Other Components: [e.g., Rulebook, tokens, playmat if any]

// SECTION 3: SETUP
//   Purpose: Detail the steps to prepare the game for play.
//   ${data.setupInstructions}
//   [Further step-by-step instructions: e.g., Shuffle deck(s), deal starting hands, set up play area]

// SECTION 4: GAMEPLAY & RULES
//   Purpose: Explain how the game is played, turn structure, and player actions.
//   Core Mechanics:
${mechanicsList.map(mechanic => `//     - ${mechanic}: [Detailed explanation of how this mechanic works in the context of cards]`).join('\n')}
//   Turn Structure:
//     [Describe what a player does on their turn: e.g., Draw phase, Action phase, Discard phase]
//   Player Actions:
//     [List and explain all possible actions a player can take, e.g., Play a card, Draw a card, Activate an ability]
//   Card Anatomy & Keywords:
//     [Explain common card elements: e.g., Cost, Attack, Health, Special abilities, Keywords and their meanings]
//   Special Rules:
//     [Any unique rules, exceptions, or interactions specific to this card game]

// SECTION 5: ENDGAME & WINNING
//   - Game End Trigger: [How does the game end? e.g., Player reaches X points, deck runs out, specific condition met]
//   - Winning Condition: ${data.winCondition}
//   - Scoring (if applicable): [How are points calculated?]
//   - Tie-Breakers: [How are ties resolved?]

// SECTION 6: DESIGN GOALS & PLAYER EXPERIENCE
//   - Key Emotions/Feelings to Evoke: [e.g., Cleverness, strategic thinking, excitement]
//   - Strategic Depth vs. Luck: [Balance between strategy, luck of the draw, and skill]
//   - Replayability Factors: [e.g., Variable card powers, different strategies, expansions]
//   - Unique Selling Points: [What makes this card game stand out?]

// SECTION 7: PLAYTESTING NOTES (Conceptual Area)
//   - Initial Playtest Feedback on card balance and mechanics:
//   - Rules Clarity Issues for card interactions:
//   - Fun Factor Assessment of core loop:

// Main function (conceptual for game design process)
function designCardGame() {
  // Prototype initial card set
  // Draft initial rulebook focusing on card interactions
  // Conduct internal playtests for balance and flow
  // Iterate on card abilities, costs, and rules
  // Refine card layout and iconography
  // Conduct blind playtests
  console.log("Card game design for '${data.gameTitle}' is underway.");
}

designCardGame();`;
  };


  const handleGenerate = () => {
    if (generationType === 'language') {
      const code = generateLanguageTemplate(language);
      setGeneratedCode(code);
    } else if (generationType === 'startup') {
      const startupData = startupForm.getValues();
      const code = generateStartupTemplate(startupData, language);
      setGeneratedCode(code);
    } else if (generationType === 'shopifyTheme') { // New
      const themeData = shopifyThemeForm.getValues();
      const code = generateShopifyThemeTemplate(themeData);
      setGeneratedCode(code);
    } else if (generationType === 'boardGameDesign') { // New
      const boardGameData = boardGameForm.getValues();
      const code = generateBoardGameTemplate(boardGameData);
      setGeneratedCode(code);
    } else if (generationType === 'startupOrgPlan') { // New
      const startupOrgPlanData = startupOrgPlanForm.getValues();
      const code = generateStartupOrgPlanTemplate(startupOrgPlanData);
      setGeneratedCode(code);
    } else if (generationType === 'cardGameDesign') { // New
      const cardGameData = cardGameForm.getValues();
      const code = generateCardGameTemplate(cardGameData);
      setGeneratedCode(code);
    }
  };

  const handleSave = () => {
    let metadata: any;
    if (generationType === 'startup') {
      metadata = { type: 'startup', ...startupForm.getValues() };
    } else if (generationType === 'shopifyTheme') { // New
      metadata = { type: 'shopifyTheme', ...shopifyThemeForm.getValues() };
    } else if (generationType === 'boardGameDesign') { // New
      metadata = { type: 'boardGameDesign', ...boardGameForm.getValues() };
    } else if (generationType === 'startupOrgPlan') { // New
      metadata = { type: 'startupOrgPlan', ...startupOrgPlanForm.getValues() };
    } else if (generationType === 'cardGameDesign') { // New
      metadata = { type: 'cardGameDesign', ...cardGameForm.getValues() };
    } else {
      metadata = { type: 'language', language };
    }
    
    onGenerate(generatedCode, metadata);
    onClose();
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Pseudocode & Spec Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={generationType} onValueChange={(value) => setGenerationType(value as any)}> {/* Adjusted grid for more tabs */}
          <TabsList className="mb-4 grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6"> {/* Adjusted grid for more tabs */}
            <TabsTrigger value="language">Language</TabsTrigger>
            <TabsTrigger value="startup">Startup Spec</TabsTrigger>
            <TabsTrigger value="shopifyTheme">Shopify Theme</TabsTrigger>
            <TabsTrigger value="boardGameDesign">Board Game</TabsTrigger>
            <TabsTrigger value="startupOrgPlan">Startup Org Plan</TabsTrigger> {/* New Tab */}
            <TabsTrigger value="cardGameDesign">Card Game</TabsTrigger> {/* New Tab */}
          </TabsList>
          
          <TabsContent value="language" className="space-y-4">
            <div>
              <Label htmlFor="language-select">Programming Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language-select">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="startup">
            <Form {...startupForm}>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={startupForm.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter company name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={startupForm.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g. FinTech, Healthcare, Education" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={startupForm.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Audience</FormLabel>
                      <FormControl>
                        <Input placeholder="Who will use your product?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={startupForm.control}
                  name="problemStatement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problem Statement</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What problem does your startup solve?" 
                          className="min-h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={startupForm.control}
                  name="proposedSolution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proposed Solution</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="How does your product solve this problem?" 
                          className="min-h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={startupForm.control}
                  name="keyFeatures"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Features (One per line)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List the main features of your product or service (one per line)" 
                          className="min-h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Label htmlFor="startup-language">Implementation Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="startup-language">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* New Tab Content for Shopify Theme */}
          <TabsContent value="shopifyTheme">
            <Form {...shopifyThemeForm}>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={shopifyThemeForm.control} name="themeName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme Name</FormLabel>
                      <FormControl><Input placeholder="e.g., Modern Minimalist" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={shopifyThemeForm.control} name="targetNiche" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Niche</FormLabel>
                      <FormControl><Input placeholder="e.g., Boutique Clothing, Artisan Coffee" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={shopifyThemeForm.control} name="themeStyle" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme Style</FormLabel>
                    <FormControl><Input placeholder="e.g., Clean, Dark, Elegant, Playful" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={shopifyThemeForm.control} name="keySectionsHomepage" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Homepage Sections (One per line)</FormLabel>
                    <FormControl><Textarea placeholder="Hero Banner\nFeatured Products\nTestimonials..." className="min-h-20" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={shopifyThemeForm.control} name="productPageFeatures" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Product Page Features (One per line)</FormLabel>
                    <FormControl><Textarea placeholder="Image Gallery with Zoom\nVariant Selectors\nCustomer Reviews..." className="min-h-20" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={shopifyThemeForm.control} name="uniqueFeature" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unique Theme Feature (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., Built-in lookbook, Advanced filtering" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </form>
            </Form>
          </TabsContent>

          {/* New Tab Content for Board Game Design */}
          <TabsContent value="boardGameDesign">
            <Form {...boardGameForm}>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={boardGameForm.control} name="gameTitle" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Game Title</FormLabel>
                      <FormControl><Input placeholder="e.g., Galactic Empires" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={boardGameForm.control} name="playerCount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Player Count</FormLabel>
                      <FormControl><Input placeholder="e.g., 2-4 players, 1-5 players" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={boardGameForm.control} name="gameTheme" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game Theme</FormLabel>
                    <FormControl><Input placeholder="e.g., Sci-Fi, Fantasy, Historical, Abstract" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={boardGameForm.control} name="coreMechanics" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Core Mechanics (One per line)</FormLabel>
                    <FormControl><Textarea placeholder="Dice Rolling\nWorker Placement\nSet Collection..." className="min-h-20" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={boardGameForm.control} name="winCondition" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Win Condition</FormLabel>
                    <FormControl><Textarea placeholder="e.g., Be the first to reach 10 victory points." className="min-h-20" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={boardGameForm.control} name="keyComponents" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Game Components (One per line)</FormLabel>
                    <FormControl><Textarea placeholder="Game Board\nPlayer Pawns\nResource Tokens\nEvent Cards..." className="min-h-20" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </form>
            </Form>
          </TabsContent>

          {/* New Tab Content for Startup Organization Plan */}
          <TabsContent value="startupOrgPlan">
            <Form {...startupOrgPlanForm}>
              <form className="space-y-4">
                <FormField control={startupOrgPlanForm.control} name="businessName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Innovatech Solutions" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {startupForDummiesGuide.steps.map(step => (
                  <Card key={step.id} className="p-4">
                    <Label className="text-lg font-semibold">{step.title}</Label>
                    <p className="text-sm text-muted-foreground mb-2">{step.content}</p>
                    {Object.entries(step.placeholders).map(([key, placeholder]) => (
                      <FormField
                        key={key}
                        control={startupOrgPlanForm.control}
                        name={key as keyof StartupOrgPlanFormValues}
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormLabel>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</FormLabel>
                            <FormControl>
                              <Textarea placeholder={startupForDummiesGuide.templateVariables[placeholder.substring(2, placeholder.length-2) as keyof typeof startupForDummiesGuide.templateVariables] || placeholder} {...field} className="min-h-[60px]" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </Card>
                ))}
              </form>
            </Form>
          </TabsContent>

          {/* New Tab Content for Card Game Design */}
          <TabsContent value="cardGameDesign">
            <Form {...cardGameForm}>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={cardGameForm.control} name="gameTitle" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Game Title</FormLabel>
                      <FormControl><Input placeholder="e.g., Mystic Duels" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={cardGameForm.control} name="playerCount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Player Count</FormLabel>
                      <FormControl><Input placeholder="e.g., 2 players, 2-4 players" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={cardGameForm.control} name="gameTheme" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game Theme</FormLabel>
                    <FormControl><Input placeholder="e.g., Fantasy, Sci-Fi, Abstract" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={cardGameForm.control} name="coreMechanics" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Core Mechanics (One per line)</FormLabel>
                    <FormControl><Textarea placeholder="Hand Management\nDeck Building\nTrick-Taking..." className="min-h-20" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={cardGameForm.control} name="cardTypesAndDistribution" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Types & Distribution (One per line)</FormLabel>
                    <FormControl><Textarea placeholder="Creature Cards (approx. 30)\nSpell Cards (approx. 20)\nResource Cards (approx. 10)..." className="min-h-20" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={cardGameForm.control} name="winCondition" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Win Condition</FormLabel>
                    <FormControl><Textarea placeholder="e.g., Reduce opponent's life to 0, or collect 3 artifact cards." className="min-h-20" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={cardGameForm.control} name="setupInstructions" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Setup Instructions</FormLabel>
                    <FormControl><Textarea placeholder="e.g., Each player shuffles their deck and draws 5 cards. Determine first player randomly." className="min-h-20" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </form>
            </Form>
          </TabsContent>

        </Tabs>
        
        <div className="mt-6">
          <Button onClick={handleGenerate} className="w-full">
            Generate Pseudocode
          </Button>
        </div>
        
        {generatedCode && (
          <div className="mt-4">
            <Label htmlFor="generated-code">Generated Pseudocode</Label>
            <Textarea
              id="generated-code"
              value={generatedCode}
              onChange={(e) => setGeneratedCode(e.target.value)}
              className="h-96 font-mono text-sm mt-2"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!generatedCode}>
          Save
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PseudocodeGenerator;
