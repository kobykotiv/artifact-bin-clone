export interface StartupStructure {
  type: string;
  name: string;
  description: string;
  benefits: string[];
  drawbacks: string[];
  suitableFor: string[];
  keyPositions: string[];
}

export const startupStructures: StartupStructure[] = [
  {
    type: "flat",
    name: "Flat Organization",
    description: "A flat organization has few or no levels of management between executives and staff. Every specialist works as a separate entity, reporting to the founders directly.",
    benefits: [
      "Quick decision-making",
      "Direct communication",
      "Greater employee autonomy",
      "Lower overhead costs",
      "More agility and flexibility"
    ],
    drawbacks: [
      "Can become chaotic as team grows",
      "Potential for conflict without clear hierarchy",
      "Confusion about responsibilities",
      "Difficult to scale beyond certain size"
    ],
    suitableFor: [
      "Early-stage startups",
      "Small teams (under 20 people)",
      "Creative agencies",
      "Innovation-focused companies"
    ],
    keyPositions: [
      "Founder/CEO",
      "Technical Lead/CTO",
      "Product Manager",
      "Designer",
      "Engineers/Developers"
    ]
  },
  {
    type: "hierarchical",
    name: "Hierarchical Structure",
    description: "A hierarchical startup structure has clear levels of management forming a pyramid, with authority flowing from top to bottom. This evolves from flat structures as businesses grow.",
    benefits: [
      "Clear reporting lines",
      "Defined career progression",
      "Specialized management expertise",
      "Better scalability for larger teams",
      "More standardized processes"
    ],
    drawbacks: [
      "Slower decision-making",
      "Potential communication barriers",
      "Higher management overhead costs",
      "Risk of bureaucracy",
      "May stifle innovation"
    ],
    suitableFor: [
      "Growing startups (20+ employees)",
      "Post Series A companies",
      "Regulated industries",
      "Companies with multiple product lines"
    ],
    keyPositions: [
      "CEO",
      "CTO",
      "VP of Product",
      "VP of Engineering",
      "VP of Sales",
      "VP of Marketing",
      "Team Leads/Managers"
    ]
  },
  {
    type: "functional",
    name: "Functional Structure",
    description: "A functional structure groups employees by their specialized function or department (engineering, marketing, sales, etc.), each with its own hierarchy.",
    benefits: [
      "Clear specialization and expertise development",
      "Efficient resource allocation within departments",
      "Standardized processes within functions",
      "Clearer career paths for specialists"
    ],
    drawbacks: [
      "Potential silos between departments",
      "May slow cross-functional collaboration",
      "Risk of conflicting departmental goals",
      "Can be less customer-focused"
    ],
    suitableFor: [
      "Startups with defined product-market fit",
      "Companies with specialized teams",
      "B2B companies with specialized sales cycles",
      "Scale-ups moving past initial growth phase"
    ],
    keyPositions: [
      "CEO",
      "CTO/VP Engineering",
      "VP Product",
      "VP Marketing",
      "VP Sales",
      "Department Heads"
    ]
  },
  {
    type: "matrix",
    name: "Matrix Structure",
    description: "Matrix structures have dual reporting lines - employees report both to a functional manager and a project/product manager, creating a grid-like structure.",
    benefits: [
      "Efficient resource sharing across projects",
      "Maintains functional expertise while enabling cross-functional work",
      "Better information flow between departments",
      "More flexibility for complex projects"
    ],
    drawbacks: [
      "Potential confusion with dual reporting",
      "Risk of conflicting priorities and instructions",
      "More complex management processes",
      "Requires strong communication skills"
    ],
    suitableFor: [
      "Multi-product startups",
      "Project-based companies",
      "Consulting firms",
      "Companies requiring cross-functional expertise"
    ],
    keyPositions: [
      "CEO",
      "Functional Leaders (Engineering, Product, Marketing, etc.)",
      "Product Managers/Project Managers",
      "Team Members (with dual reporting)"
    ]
  },
  {
    type: "team-based",
    name: "Team-Based Structure",
    description: "Team-based structures organize around cross-functional, self-managed teams that have end-to-end responsibility for specific products, features, or customer segments.",
    benefits: [
      "Fast, autonomous decision-making",
      "Customer-centric focus",
      "Breaking down silos between functions",
      "Strong team ownership and accountability",
      "Adaptability to changing needs"
    ],
    drawbacks: [
      "Risk of duplication of efforts across teams",
      "Potential inconsistency between teams",
      "Requires mature, self-directed team members",
      "May lack specialized functional depth"
    ],
    suitableFor: [
      "Product-led companies",
      "Agile development environments",
      "Startups with multiple, distinct product lines",
      "Customer-segment focused businesses"
    ],
    keyPositions: [
      "CEO",
      "Team Leads",
      "Product Owners",
      "Cross-functional team members (engineers, designers, marketers)",
      "Chapter leads (functional expertise across teams)"
    ]
  }
];

export const getStructureDetails = (type: string): StartupStructure | undefined => {
  return startupStructures.find(structure => structure.type === type);
};

export const typicalStartupRoles = [
  {
    title: "Chief Executive Officer (CEO)",
    description: "Provides overall leadership, sets company vision and strategy, manages fundraising, and represents the company externally.",
    stage: "Founding team"
  },
  {
    title: "Chief Technology Officer (CTO)",
    description: "Leads technical strategy, architecture decisions, and oversees the engineering team and product development.",
    stage: "Founding team"
  },
  {
    title: "Chief Product Officer (CPO)",
    description: "Leads product strategy, roadmap, and user experience. Translates business requirements into product features.",
    stage: "Early growth"
  },
  {
    title: "Chief Marketing Officer (CMO)",
    description: "Develops marketing strategy, brand positioning, customer acquisition, and growth initiatives.",
    stage: "Growth"
  },
  {
    title: "Chief Financial Officer (CFO)",
    description: "Manages financial planning, accounting, fundraising support, and financial reporting.",
    stage: "Series A"
  },
  {
    title: "Chief Operating Officer (COO)",
    description: "Oversees day-to-day operations, process optimization, and execution of the business plan.",
    stage: "Growth"
  },
  {
    title: "Head of Sales",
    description: "Develops and executes sales strategy, builds and manages the sales team, and drives revenue growth.",
    stage: "Early traction"
  },
  {
    title: "Head of Customer Success",
    description: "Ensures customer satisfaction, retention, and expansion; manages customer support and onboarding.",
    stage: "Early traction"
  },
  {
    title: "Head of People/HR",
    description: "Manages recruiting, employee development, company culture, and HR policies and procedures.",
    stage: "Series A"
  }
];

export const typicalDepartments = [
  {
    name: "Executive Team",
    description: "Provides company-wide leadership and strategic direction.",
    key_roles: ["CEO", "CTO", "COO", "CFO"]
  },
  {
    name: "Product",
    description: "Defines product strategy, roadmap, and user experience.",
    key_roles: ["Product Manager", "Product Owner", "UX/UI Designer"]
  },
  {
    name: "Engineering",
    description: "Builds and maintains the technical product and infrastructure.",
    key_roles: ["Software Engineer", "Frontend Developer", "Backend Developer", "DevOps Engineer"]
  },
  {
    name: "Marketing",
    description: "Drives customer acquisition, brand awareness, and market positioning.",
    key_roles: ["Growth Marketer", "Content Marketing", "Digital Marketing", "Brand Manager"]
  },
  {
    name: "Sales",
    description: "Generates revenue through direct selling activities.",
    key_roles: ["Sales Representative", "Account Executive", "Sales Development Representative"]
  },
  {
    name: "Customer Success",
    description: "Ensures customer satisfaction, retention, and growth.",
    key_roles: ["Customer Success Manager", "Support Specialist", "Implementation Manager"]
  },
  {
    name: "Finance",
    description: "Manages financial planning, reporting, and operations.",
    key_roles: ["Financial Analyst", "Accountant", "Finance Manager"]
  },
  {
    name: "People/HR",
    description: "Handles recruiting, employee development, and company culture.",
    key_roles: ["Recruiter", "HR Manager", "People Operations"]
  },
  {
    name: "Operations",
    description: "Optimizes internal processes and ensures efficient business execution.",
    key_roles: ["Operations Manager", "Business Analyst", "Project Manager"]
  }
];

// Common challenges and reasons for structure changes during growth
export const organizationalChallenges = [
  {
    stage: "Early startup",
    challenge: "Decision bottlenecks with single founder approval",
    solution: "Implement decision-making frameworks like RACI or delegated authority"
  },
  {
    stage: "10-25 employees",
    challenge: "Communication breakdown as team size grows",
    solution: "Introduce regular team meetings, documentation practices, and communication tools"
  },
  {
    stage: "25-50 employees",
    challenge: "Unclear roles and responsibilities",
    solution: "Define clear job descriptions, reporting lines, and responsibility matrices"
  },
  {
    stage: "50+ employees",
    challenge: "Coordination issues between functions",
    solution: "Implement cross-functional teams or matrix structure for key initiatives"
  },
  {
    stage: "Post Series-A",
    challenge: "Need for specialized management",
    solution: "Transition from generalists to specialized functional leaders"
  },
  {
    stage: "Scaling",
    challenge: "Process inefficiencies during rapid growth",
    solution: "Formalize core processes while maintaining startup agility"
  },
];

export function generateOrgRecommendation(companySize: string, industry: string): string {
  let recommendation = '';

  if (companySize.includes('Small')) {
    recommendation = 'For your early-stage startup, we recommend a flat organizational structure to maximize agility and minimize management overhead. This will allow for quick decision-making and direct communication among all team members. Key positions should include the founding executives and core contributors across product, engineering, and go-to-market functions.';
    
    if (industry.toLowerCase().includes('tech') || industry.toLowerCase().includes('saas')) {
      recommendation += ' Given your focus on technology, prioritize technical leadership and product management roles to establish a solid foundation.';
    }
  } else if (companySize.includes('Medium')) {
    recommendation = 'At this growth stage, a functional organizational structure would help you balance specialization with coordination. Department heads can manage their respective functions while the leadership team ensures alignment. Consider establishing formal departments for Engineering, Product, Marketing, Sales, and Operations with clear reporting lines.';
    
    if (industry.toLowerCase().includes('finance') || industry.toLowerCase().includes('health')) {
      recommendation += ' Given your industry\'s regulatory requirements, ensure you also establish appropriate compliance and risk management functions.';
    }
  } else {
    recommendation = 'For a company of your size, a more sophisticated hierarchical or matrix structure may be appropriate. This will help manage complexity while maintaining alignment across multiple teams and products. Consider implementing middle management layers to facilitate information flow and decision-making at appropriate levels.';
  }

  return recommendation;
}
