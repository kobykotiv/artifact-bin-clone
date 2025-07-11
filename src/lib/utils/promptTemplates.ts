export const promptTemplates = {
  code: {
    templates: [
      "Build a {{type}} that {{action}} using {{tech}}",
      "Create a {{scope}} solution for {{problem}} with {{tech}}",
      "Implement a {{type}} to handle {{action}}"
    ],
    variables: {
      type: ['microservice', 'utility library', 'CLI tool', 'web application', 'API gateway', 'mobile app'],
      action: ['processes data streams', 'manages user authentication', 'optimizes performance', 'handles real-time updates', 'automates workflows'],
      tech: ['Node.js', 'React', 'Python', 'Go', 'Rust', 'TypeScript'],
      scope: ['enterprise-grade', 'lightweight', 'scalable', 'cross-platform', 'cloud-native'],
      problem: ['data synchronization', 'system integration', 'user management', 'resource optimization']
    }
  },
  architecture: {
    templates: [
      "Design a {{pattern}} architecture for {{domain}} with {{focus}}",
      "Create a {{scale}} system design for {{useCase}}"
    ],
    variables: {
      pattern: ['microservices', 'event-driven', 'layered', 'hexagonal', 'CQRS'],
      domain: ['e-commerce', 'social platform', 'financial services', 'IoT system', 'content delivery'],
      focus: ['high availability', 'real-time processing', 'data consistency', 'fault tolerance'],
      scale: ['highly scalable', 'distributed', 'containerized', 'serverless'],
      useCase: ['payment processing', 'user authentication', 'data analytics', 'content management']
    }
  }
};
