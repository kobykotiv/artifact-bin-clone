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

interface PseudocodeGeneratorProps {
  onGenerate: (code: string, metadata: any) => void;
  onClose: () => void;
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
  keyFeatures: z.string().min(5, { message: "Please list at least a few key features" }),
});

type StartupFormValues = z.infer<typeof startupFormSchema>;

export const PseudocodeGenerator = ({ onGenerate, onClose }: PseudocodeGeneratorProps) => {
  const [generationType, setGenerationType] = useState<'language' | 'startup'>('language');
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
    return `/**
 * ${data.companyName} - Startup Project Pseudocode
 * Industry: ${data.industry}
 * Target Audience: ${data.targetAudience}
 * 
 * Problem: ${data.problemStatement}
 * Solution: ${data.proposedSolution}
 */

// Key Features:
// ${data.keyFeatures.split('\n').join('\n// ')}

/** 
 * Technical Implementation - ${programmingLanguage}
 */

// System Architecture
function defineArchitecture() {
  // Define frontend framework
  // Set up backend services
  // Plan database schema
  // Configure cloud infrastructure
}

// User Management
function implementUserManagement() {
  // User registration
  // Authentication and authorization
  // User profiles and preferences
}

// Core Business Logic
function implementBusinessLogic() {
  // Implement key features
  // Define workflows and processes
  // Set up validation rules
}

// Data Management
function setupDataManagement() {
  // Define data models
  // Implement CRUD operations
  // Set up backup and recovery
}

// Payment Processing (if applicable)
function setupPaymentProcessing() {
  // Integrate payment gateway
  // Implement subscription management
  // Handle invoicing
}

// Analytics and Reporting
function implementAnalytics() {
  // User behavior tracking
  // Business metrics collection
  // Reporting dashboards
}

// Main application initialization
function main() {
  defineArchitecture();
  implementUserManagement();
  implementBusinessLogic();
  setupDataManagement();
  setupPaymentProcessing();
  implementAnalytics();
  
  console.log("${data.companyName} application initialized");
}

// Start application
main();`;
  };

  const handleGenerate = () => {
    if (generationType === 'language') {
      const code = generateLanguageTemplate(language);
      setGeneratedCode(code);
    } else {
      const startupData = startupForm.getValues();
      const code = generateStartupTemplate(startupData, language);
      setGeneratedCode(code);
    }
  };

  const handleSave = () => {
    const metadata = generationType === 'startup' 
      ? { type: 'startup', ...startupForm.getValues() } 
      : { type: 'language', language };
    
    onGenerate(generatedCode, metadata);
    onClose();
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Pseudocode Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="language" onValueChange={(value) => setGenerationType(value as 'language' | 'startup')}>
          <TabsList className="mb-4">
            <TabsTrigger value="language">Language Template</TabsTrigger>
            <TabsTrigger value="startup">Startup Spec</TabsTrigger>
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
                      <FormLabel>Key Features</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List the main features of your product (one per line)" 
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
