export const startupForDummiesGuide = {
  title: "Startup Organization for Dummies: A 10-Step Guide to Success",
  introduction: "Your no-nonsense, step-by-step roadmap to transforming your brilliant idea into a thriving business. Let's get started!",
  templateVariables: {
    businessName: "My Awesome Startup",
    businessIdea: "a revolutionary new product/service",
    targetMarket: "a specific group of customers",
    uniqueSellingProposition: "what makes the business unique",
    fundingGoal: "$50,000",
    firstMilestone: "launching the MVP",
    marketingChannel: "social media marketing",
    legalStructure: "Sole Proprietorship",
    teamMemberName: "Co-founder/First Employee",
    brandVoice: "friendly and approachable",
  },
  steps: [
    {
      id: "step1",
      title: "1. Ideation & Passion Alignment",
      content: "- **Define Your Idea**: Clearly articulate {{businessIdea}}. What problem does it solve? Who is it for?\n  - *Action*: Write a one-sentence elevator pitch for {{businessName}}.\n  - *Focus*: Ensure your idea aligns with your passions and skills. What are you genuinely excited to build?",
      placeholders: {
        businessIdeaDetail: "{{businessIdeaDetail}}", // Detailed description of the idea
        passionAlignmentNotes: "{{passionAlignmentNotes}}", // How it connects to personal interests
      }
    },
    {
      id: "step2",
      title: "2. Market Research: Know Your Playground",
      content: "- **Identify Target Audience**: Who are your ideal customers ({{targetMarket}})? Understand their demographics, needs, and pain points.\n- **Analyze Competition**: Who else is out there? What are their strengths and weaknesses? How can {{businessName}} do it better or differently?\n  - *Action*: List 3 potential competitors and one key differentiator for {{businessName}}.\n  - *Focus*: Validate that there's a real need for {{businessIdea}} in the current market.",
      placeholders: {
        targetAudienceProfile: "{{targetAudienceProfile}}", // Detailed customer persona
        competitorAnalysisSummary: "{{competitorAnalysisSummary}}", // Notes on key competitors
        marketNeedValidation: "{{marketNeedValidation}}", // Evidence of market demand
      }
    },
    {
      id: "step3",
      title: "3. Business Plan: Your Roadmap to Success",
      content: "- **Outline Key Sections**: Executive Summary, Company Description, Market Analysis, Organization & Management, Products/Services, Marketing & Sales Strategy, Financial Projections (including {{fundingGoal}} if applicable).\n  - *Action*: Draft a one-page lean canvas for {{businessName}}.\n  - *Focus*: Create a clear, concise, and actionable plan. This is vital for internal direction and attracting investors.",
      placeholders: {
        executiveSummaryDraft: "{{executiveSummaryDraft}}",
        marketingStrategyOutline: "{{marketingStrategyOutline}}",
        financialProjectionsSummary: "{{financialProjectionsSummary}}",
      }
    },
    {
      id: "step4",
      title: "4. Legal & Administrative Setup: Get Official",
      content: "- **Choose Legal Structure**: Decide on the best structure (e.g., {{legalStructure}}, LLC, Corporation). Consult a legal professional.\n- **Register Your Business**: File for your DBA or incorporation papers for {{businessName}}.\n- **Obtain Licenses & Permits**: Research and acquire necessary local, state, and federal licenses.\n  - *Action*: Research the steps to register a business in your state/country.\n  - *Focus*: Ensure full compliance to avoid legal headaches later.",
      placeholders: {
        legalStructureConsiderations: "{{legalStructureConsiderations}}",
        registrationStepsNotes: "{{registrationStepsNotes}}",
        licensesPermitsList: "{{licensesPermitsList}}",
      }
    },
    {
      id: "step5",
      title: "5. Financial Foundation: Manage the Money",
      content: "- **Open a Business Bank Account**: Keep personal and business finances separate.\n- **Set Up Accounting System**: Track income and expenses from day one.\n- **Develop Financial Projections**: Estimate startup costs, revenue, and profitability. Plan for {{fundingGoal}}.\n  - *Action*: Create a basic startup budget for {{businessName}}.\n  - *Focus*: Maintain a clear view of your financial health and runway.",
      placeholders: {
        bankAccountChoice: "{{bankAccountChoice}}",
        accountingSoftware: "{{accountingSoftware}}",
        startupBudgetDetail: "{{startupBudgetDetail}}",
      }
    },
    {
      id: "step6",
      title: "6. Build Your Product/Service (MVP)",
      content: "- **Develop a Minimum Viable Product (MVP)**: Create the simplest version of {{businessIdea}} that delivers core value to early adopters.\n- **Iterate Based on Feedback**: Collect user feedback and continuously improve.\n  - *Action*: Define the top 3 core features for the MVP of {{businessIdea}}.\n  - *Focus*: Get to market quickly, learn, and adapt. Perfection is the enemy of done.",
      placeholders: {
        mvpFeatureList: "{{mvpFeatureList}}",
        feedbackCollectionPlan: "{{feedbackCollectionPlan}}",
        developmentTimelineEstimate: "{{developmentTimelineEstimate}}",
      }
    },
    {
      id: "step7",
      title: "7. Branding & Marketing: Get the Word Out",
      content: "- **Develop Brand Identity**: Define {{businessName}}'s name, logo, colors, and {{brandVoice}}.\n- **Choose Marketing Channels**: Identify effective ways to reach {{targetMarket}} (e.g., {{marketingChannel}}).\n- **Create Online Presence**: Build a website and social media profiles.\n  - *Action*: Draft a sample social media post announcing {{businessName}}.\n  - *Focus*: Build a strong brand that resonates with your audience.",
      placeholders: {
        brandIdentityGuidelines: "{{brandIdentityGuidelines}}",
        websiteUrl: "{{websiteUrl}}",
        contentMarketingIdeas: "{{contentMarketingIdeas}}",
      }
    },
    {
      id: "step8",
      title: "8. Team Building (If Applicable): Assemble Your Crew",
      content: "- **Identify Key Roles**: Determine the skills and roles needed for {{businessName}}.\n- **Recruit Wisely**: Hire or partner with individuals like {{teamMemberName}} who share your vision and complement your skills.\n- **Foster a Positive Culture**: Create a productive and motivating work environment.\n  - *Action*: List one key skill you need to find in a partner or early hire.\n  - *Focus*: Your team is your greatest asset. Choose and nurture them carefully.",
      placeholders: {
        keyRoleDescription1: "{{keyRoleDescription1}}",
        recruitmentStrategy: "{{recruitmentStrategy}}",
        companyCultureNotes: "{{companyCultureNotes}}",
      }
    },
    {
      id: "step9",
      title: "9. Launch & Learn: Open for Business!",
      content: "- **Plan Your Launch**: Soft launch or a bigger event? Prepare your {{marketingChannel}} campaigns.\n- **Deliver Excellent Customer Service**: Make your first customers happy advocates.\n- **Track Key Metrics**: Monitor sales, customer feedback, and website traffic.\n  - *Action*: Set one measurable goal for the first month post-launch (e.g., {{firstMilestone}}).\n  - *Focus*: Launching is just the beginning. Be prepared to adapt and learn.",
      placeholders: {
        launchPlanOutline: "{{launchPlanOutline}}",
        customerServicePolicy: "{{customerServicePolicy}}",
        keyMetricToTrack1: "{{keyMetricToTrack1}}",
      }
    },
    {
      id: "step10",
      title: "10. Scale Smart: Grow Sustainably",
      content: "- **Analyze Performance**: Regularly review what's working and what's not.\n- **Seek Further Funding (If Needed)**: Use your traction to approach investors for {{fundingGoal}} or more.\n- **Expand Offerings/Reach**: Strategically grow your product line or enter new markets.\n  - *Action*: Identify one area for potential growth or improvement after 6 months.\n  - *Focus*: Sustainable growth is key. Don't try to do too much too soon.",
      placeholders: {
        performanceReviewSchedule: "{{performanceReviewSchedule}}",
        scalingStrategyIdeas: "{{scalingStrategyIdeas}}",
        longTermVisionStatement: "{{longTermVisionStatement}}",
      }
    }
  ],
  footer: "Remember, starting a business is a marathon, not a sprint. Stay resilient, keep learning, and celebrate your milestones. Good luck with {{businessName}}!"
};
