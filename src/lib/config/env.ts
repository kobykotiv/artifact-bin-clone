export const env = {
  jira: {
    api: process.env.NEXT_PUBLIC_JIRA_API || '',
    token: process.env.NEXT_PUBLIC_JIRA_TOKEN || '',
    project: process.env.NEXT_PUBLIC_JIRA_PROJECT || 'BOLT'
  }
} as const;

export function validateEnv() {
  if (!env.jira.api) {
    console.warn('Missing NEXT_PUBLIC_JIRA_API environment variable');
  }
  if (!env.jira.token) {
    console.warn('Missing NEXT_PUBLIC_JIRA_TOKEN environment variable');
  }
}
