import PseudocodeGenerator from './PseudocodeGenerator';
import { Code } from 'lucide-react'; // Assuming you're using Lucide icons

export const templates = {
  // ...existing templates...
  pseudocodeGenerator: {
    name: 'Pseudocode Generator',
    description: 'Generate pseudocode for a programming language or startup specification',
    icon: Code,
    component: PseudocodeGenerator,
    tags: ['code', 'planning', 'startup', 'pseudocode'],
  },
};