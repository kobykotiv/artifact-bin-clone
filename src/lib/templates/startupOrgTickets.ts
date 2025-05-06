import { TicketTemplate } from './ticketTemplates';

export interface OrgTicketVariables {
  structureType: string;
  companySize: string;
  departmentName?: string;
  roleName?: string;
  issueDescription?: string;
  proposedSolution?: string;
}

export const generateOrgTicket = (variables: OrgTicketVariables): TicketTemplate => {
  const { structureType, companySize, departmentName, roleName, issueDescription, proposedSolution } = variables;

  return {
    summary: departmentName 
      ? `Organization Structure: ${departmentName} department` 
      : roleName 
        ? `Organization Structure: ${roleName} role definition` 
        : `Organization Structure: ${structureType} implementation`,
    description: [
      `## Context`,
      `- Company Size: ${companySize}`,
      `- Organization Structure: ${structureType}`,
      departmentName ? `- Department: ${departmentName}` : '',
      roleName ? `- Role: ${roleName}` : '',
      ``,
      `## Issue`,
      issueDescription || 'The current organization structure needs improvement.',
      ``,
      `## Proposed Solution`,
      proposedSolution || `Implement a ${structureType} structure with clear reporting lines and responsibilities.`,
    ].filter(Boolean).join('\n'),
    type: 'Task',
    priority: 'Medium',
    labels: ['organization', 'structure'],
    fields: {
      structureType,
      companySize,
      departmentName: departmentName || '',
      roleName: roleName || ''
    }
  };
};

export const orgStructureTemplates = {
  addDepartment: (variables: Record<string, string>): TicketTemplate => ({
    summary: `Add ${variables.departmentName} department to org structure`,
    description: [
      `## Department Information`,
      `- Name: ${variables.departmentName}`,
      `- Purpose: ${variables.purpose || 'To be defined'}`,
      `- Reports To: ${variables.reportsTo || 'CEO'}`,
      `- Headcount: ${variables.headcount || 'TBD'}`,
      ``,
      `## Responsibilities`,
      variables.responsibilities || '- To be defined',
      ``,
      `## Key Performance Indicators`,
      variables.kpis || '- To be defined',
    ].join('\n'),
    type: 'Story',
    priority: 'Medium',
    labels: ['organization', 'department']
  }),
  
  defineRole: (variables: Record<string, string>): TicketTemplate => ({
    summary: `Define ${variables.roleName} role`,
    description: [
      `## Role Information`,
      `- Title: ${variables.roleName}`,
      `- Department: ${variables.department || 'To be assigned'}`,
      `- Reports To: ${variables.reportsTo || 'To be determined'}`,
      ``,
      `## Responsibilities`,
      variables.responsibilities || '- To be defined',
      ``,
      `## Required Skills`,
      variables.skills || '- To be defined',
      ``,
      `## Success Metrics`,
      variables.metrics || '- To be defined',
    ].join('\n'),
    type: 'Story',
    priority: 'Medium',
    labels: ['organization', 'role-definition']
  }),
  
  restructure: (variables: Record<string, string>): TicketTemplate => ({
    summary: `Restructure ${variables.area || 'organization'} to ${variables.newStructure}`,
    description: [
      `## Restructuring Information`,
      `- Area: ${variables.area || 'Entire Organization'}`,
      `- Current Structure: ${variables.currentStructure || 'Undefined'}`,
      `- Target Structure: ${variables.newStructure}`,
      `- Reason: ${variables.reason || 'Improve efficiency and communication'}`,
      ``,
      `## Implementation Plan`,
      variables.plan || '1. Document current structure\n2. Define target structure\n3. Create transition plan\n4. Communicate changes\n5. Implement new structure\n6. Review and adjust',
      ``,
      `## Success Criteria`,
      variables.criteria || '- Improved communication\n- Clearer reporting lines\n- Enhanced decision-making\n- Better resource allocation',
    ].join('\n'),
    type: 'Epic',
    priority: 'High',
    labels: ['organization', 'restructure']
  })
};
