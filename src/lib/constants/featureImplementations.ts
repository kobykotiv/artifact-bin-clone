import { ticketTemplates, type JiraTicketTemplate } from '@/lib/templates/jiraTickets';

export const featureImplementations = {
  auth: {
    name: 'Authentication',
    patterns: ['JWT-based', 'OAuth 2.0', 'Session-based', 'Magic Link', 'Social Auth'],
    components: ['Login Form', 'Registration Form', 'Password Reset', 'Profile Management', 'Auth Guards'],
    apis: ['POST /auth/login', 'POST /auth/register', 'POST /auth/forgot-password', 'GET /auth/me'],
    dataModel: ['User', 'Session', 'Token', 'Permission'],
    libraries: ['NextAuth.js', 'Passport.js', 'Auth0', 'Firebase Auth', 'Supabase Auth'],
    jiraTemplates: ticketTemplates.auth
  },
  payment: {
    name: 'Payment Processing',
    patterns: ['Subscription', 'One-time Payment', 'Marketplace', 'Recurring Billing', 'Usage-based'],
    components: ['Payment Form', 'Subscription Plans', 'Invoice History', 'Payment Method Management'],
    apis: ['POST /payments/create', 'GET /subscriptions', 'POST /webhooks/stripe'],
    dataModel: ['Payment', 'Subscription', 'Invoice', 'PaymentMethod'],
    libraries: ['Stripe', 'PayPal', 'Square', 'Paddle', 'LemonSqueezy'],
    jiraTemplates: [
      {
        epic: 'Payment System Integration',
        stories: [
          {
            title: 'Payment Provider Setup',
            points: 3,
            tasks: [
              'Configure payment provider SDK',
              'Set up webhook endpoints',
              'Configure test environment',
              'Add API key management'
            ]
          },
          {
            title: 'Payment Processing Flow',
            points: 5,
            tasks: [
              'Create checkout process',
              'Implement payment form',
              'Add payment validation',
              'Handle successful payments',
              'Implement error handling'
            ]
          },
          {
            title: 'Subscription Management',
            points: 8,
            tasks: [
              'Create subscription plans',
              'Implement recurring billing',
              'Add plan switching functionality',
              'Create billing portal',
              'Add usage tracking'
            ]
          }
        ]
      }
    ]
  },
  search: {
    name: 'Search Functionality',
    patterns: ['Full-text Search', 'Faceted Search', 'Real-time Search', 'Filters & Sort'],
    components: ['Search Bar', 'Filter Panel', 'Results List', 'Sort Controls'],
    apis: ['GET /search', 'GET /suggestions', 'POST /search/filter'],
    dataModel: ['SearchIndex', 'FilterOption', 'SearchResult'],
    libraries: ['Algolia', 'Elasticsearch', 'MeiliSearch', 'Typesense'],
    jiraTemplates: ticketTemplates.search
  },
  payment_stripe: {
    name: 'Stripe Integration',
    patterns: ['Elements', 'Checkout', 'Payment Links', 'Connect', 'Billing Portal'],
    components: [
      'StripeProvider', 
      'Elements Form', 
      'PaymentIntent Hook', 
      'Subscription Management', 
      'Connect Onboarding'
    ],
    apis: [
      'POST /stripe/create-payment-intent',
      'POST /stripe/create-customer',
      'POST /stripe/setup-subscription',
      'POST /webhooks/stripe',
      'GET /stripe/portal-session'
    ],
    dataModel: [
      'Customer { stripeCustomerId: string }',
      'Subscription { stripePriceId: string }',
      'Payment { stripePaymentIntentId: string }',
      'Account { stripeAccountId: string }'
    ],
    libraries: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
    jiraTemplates: [
      {
        epic: 'Stripe Payment Integration',
        stories: [
          {
            title: 'Implement Stripe Customer Creation',
            points: 3,
            tasks: [
              'Set up Stripe SDK',
              'Create customer on user registration',
              'Store Stripe customer ID'
            ]
          },
          {
            title: 'Implement Payment Flow',
            points: 5,
            tasks: [
              'Create payment intent API',
              'Implement Elements form',
              'Handle successful payments',
              'Error handling'
            ]
          }
        ]
      }
    ]
  },

  stack_nextjs: {
    name: 'Next.js Full Stack',
    patterns: ['App Router', 'Server Components', 'Server Actions', 'Edge Runtime'],
    components: [
      'Layout { nav, auth, footer }',
      'Loading States',
      'Error Boundaries',
      'Dynamic Imports'
    ],
    apis: [
      'Route Handlers',
      'API Routes',
      'Server Actions',
      'Edge Functions'
    ],
    dataModel: [
      'Prisma Schema',
      'tRPC Routers',
      'Zod Schemas',
      'Database Models'
    ],
    libraries: [
      'next-auth',
      'prisma',
      'trpc',
      'tailwindcss'
    ],
    jiraTemplates: [
      {
        epic: 'Next.js Project Setup',
        stories: [
          {
            title: 'Project Bootstrap',
            points: 2,
            tasks: [
              'Initialize Next.js project',
              'Configure TypeScript',
              'Set up Tailwind CSS',
              'Configure ESLint'
            ]
          },
          {
            title: 'Authentication Setup',
            points: 3,
            tasks: [
              'Install NextAuth.js',
              'Configure auth providers',
              'Create protected routes',
              'Add auth middleware'
            ]
          }
        ]
      }
    ]
  }
};

export type FeatureType = keyof typeof featureImplementations;

export interface FeatureImplementation {
  type: FeatureType;
  pattern: string;
  components: string[];
  apis: string[];
  dataModel: string[];
  library: string;
  jiraTemplates?: JiraEpic[];
}

export interface JiraTask {
  title: string;
  points?: number;
  tasks: string[];
}

export interface JiraEpic {
  epic: string;
  stories: JiraTask[];
}

export function generateImplementation(type: FeatureType): FeatureImplementation {
  const feature = featureImplementations[type];
  if (!feature) throw new Error(`Unknown feature type: ${type}`);

return {
    type,
    pattern: feature.patterns[Math.floor(Math.random() * feature.patterns.length)],
    components: feature.components.slice(0, Math.floor(Math.random() * feature.components.length + 1)),
    apis: feature.apis.slice(0, Math.floor(Math.random() * feature.apis.length + 1)),
    dataModel: feature.dataModel.slice(0, Math.floor(Math.random() * feature.dataModel.length + 1)),
    library: feature.libraries[Math.floor(Math.random() * feature.libraries.length)],
    jiraTemplates: feature.jiraTemplates ? feature.jiraTemplates.map(epic => ({
        epic: epic.epic,
        stories: epic.stories.map(story => ({
            title: story.title,
            points: story.points,
            tasks: [...story.tasks]
        }))
    })) : undefined
};
}

export function generateJiraTickets(type: FeatureType): JiraEpic[] | undefined {
  const feature = featureImplementations[type];
  if (!feature?.jiraTemplates) return undefined;
  
  return feature.jiraTemplates.map(epic => ({
    ...epic,
    stories: epic.stories.map(story => ({
      ...story,
      tasks: [...story.tasks] // Clone tasks array
    }))
  }));
}
