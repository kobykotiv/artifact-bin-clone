import { VersionRecord } from './versioning';

interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    added: string[];
    changed: string[];
    fixed: string[];
    removed: string[];
  };
}

export function generateChangelogEntry(
  version: string,
  changes: VersionRecord[],
  commitMessages: string[] = []
): ChangelogEntry {
  const entry: ChangelogEntry = {
    version,
    date: new Date().toISOString().split('T')[0],
    changes: {
      added: [],
      changed: [],
      fixed: [],
      removed: []
    }
  };

  // Analyze commit messages and version records to categorize changes
  const messages = [...commitMessages, ...changes.map(c => c.changes)];
  
  for (const msg of messages) {
    const lowerMsg = msg.toLowerCase();
    if (lowerMsg.startsWith('add') || lowerMsg.includes('new')) {
      entry.changes.added.push(msg);
    } else if (lowerMsg.startsWith('fix') || lowerMsg.includes('bug')) {
      entry.changes.fixed.push(msg);
    } else if (lowerMsg.startsWith('remov') || lowerMsg.includes('delet')) {
      entry.changes.removed.push(msg);
    } else {
      entry.changes.changed.push(msg);
    }
  }

  return entry;
}

export function formatChangelog(entries: ChangelogEntry[]): string {
  return entries.map(entry => {
    const sections = [];
    sections.push(`## [${entry.version}] - ${entry.date}`);
    
    if (entry.changes.added.length > 0) {
      sections.push(`### Added\n${entry.changes.added.map(c => `- ${c}`).join('\n')}`);
    }
    
    if (entry.changes.changed.length > 0) {
      sections.push(`### Changed\n${entry.changes.changed.map(c => `- ${c}`).join('\n')}`);
    }
    
    if (entry.changes.fixed.length > 0) {
      sections.push(`### Fixed\n${entry.changes.fixed.map(c => `- ${c}`).join('\n')}`);
    }
    
    if (entry.changes.removed.length > 0) {
      sections.push(`### Removed\n${entry.changes.removed.map(c => `- ${c}`).join('\n')}`);
    }
    
    return sections.join('\n\n');
  }).join('\n\n');
}
