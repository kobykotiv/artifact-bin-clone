export interface SaaSStrategy {
  id: string;
  title: string;
  description: string;
  implementation: string;
  category: 'acquisition' | 'retention' | 'monetization' | 'organization';
  difficulty: 'easy' | 'medium' | 'hard';
}

export const saasStrategies: SaaSStrategy[] = [
  {
    id: '1',
    title: 'Content Marketing',
    description: 'Create valuable content that attracts your target audience through SEO and thought leadership.',
    implementation: 'Blog posts, guides, and tutorials',
    category: 'acquisition',
    difficulty: 'medium'
  },
  {
    id: '2',
    title: 'Product-Led Growth',
    description: 'Use the product itself as the primary driver of customer acquisition and conversion.',
    implementation: 'Free tier with upgrade path',
    category: 'acquisition',
    difficulty: 'hard'
  },
  {
    id: '3',
    title: 'Referral Program',
    description: 'Incentivize existing customers to refer new users to your platform.',
    implementation: 'Dual-sided rewards system',
    category: 'acquisition',
    difficulty: 'medium'
  },
  {
    id: '4',
    title: 'Enhanced Onboarding',
    description: 'Guide new users to their first success moment as quickly as possible.',
    implementation: 'Interactive walkthroughs',
    category: 'retention',
    difficulty: 'medium'
  },
  {
    id: '5',
    title: 'Regular Engagement',
    description: 'Keep users engaged with regular valuable touchpoints.',
    implementation: 'Weekly digest emails',
    category: 'retention',
    difficulty: 'easy'
  },
  {
    id: '6',
    title: 'Success Metrics',
    description: 'Show users the value they\'re getting from your product.',
    implementation: 'Customized dashboard',
    category: 'retention',
    difficulty: 'medium'
  },
  {
    id: '7',
    title: 'Value-Based Pricing',
    description: 'Price based on the value delivered, not just costs.',
    implementation: 'ROI calculator',
    category: 'monetization',
    difficulty: 'hard'
  },
  {
    id: '8',
    title: 'Expansion Revenue',
    description: 'Create opportunities for existing customers to spend more.',
    implementation: 'Tiered features',
    category: 'monetization',
    difficulty: 'medium'
  },
  {
    id: '9',
    title: 'Annual Billing Discounts',
    description: 'Improve cash flow and reduce churn with annual billing.',
    implementation: '20% annual discount',
    category: 'monetization',
    difficulty: 'easy'
  },
  {
    id: '10',
    title: 'Documentation Culture',
    description: 'Create a culture of documenting decisions, processes and knowledge.',
    implementation: 'Central wiki system',
    category: 'organization',
    difficulty: 'medium'
  },
  {
    id: '11',
    title: 'Agile Sprint Structure',
    description: 'Organize work into focused sprints with clear goals and review processes.',
    implementation: '2-week sprint cycles',
    category: 'organization',
    difficulty: 'medium'
  },
  {
    id: '12',
    title: 'Focus Time Blocks',
    description: 'Set aside uninterrupted time for deep work and collaboration.',
    implementation: 'No-meeting Wednesdays',
    category: 'organization',
    difficulty: 'easy'
  }
];
