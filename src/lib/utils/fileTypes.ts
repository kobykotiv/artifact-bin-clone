import { languages } from '@/lib/languages';

const extensionToLanguageMap: Record<string, string> = {
  js: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  tsx: 'tsx',
  json: 'json',
  css: 'css',
  scss: 'scss',
  html: 'html',
  md: 'markdown',
  py: 'python',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  cs: 'csharp',
  rb: 'ruby',
  php: 'php',
  go: 'go',
  rs: 'rust',
  swift: 'swift',
  kt: 'kotlin',
  sql: 'sql',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  xml: 'xml',
  yaml: 'yaml',
  yml: 'yaml',
  txt: 'plain',
  // Add more mappings as needed
};

export const getLanguageFromFileType = (fileType: string): string => {
  return extensionToLanguageMap[fileType?.toLowerCase() || ''] || 'plain';
};

export const getFileTypeFromLanguage = (language: string): string => {
    // Prioritize common extensions for direct language matches
    const commonExtensions: Record<string, string> = {
        javascript: 'js',
        typescript: 'ts',
        python: 'py',
        java: 'java',
        html: 'html',
        css: 'css',
        markdown: 'md',
        json: 'json',
        jsx: 'jsx',
        tsx: 'tsx',
        shell: 'sh',
        ruby: 'rb',
        go: 'go',
        rust: 'rs',
        csharp: 'cs',
        // Add others if needed
    };
    if (commonExtensions[language]) {
        return commonExtensions[language];
    }

    // Fallback search
    for (const ext in extensionToLanguageMap) {
        if (extensionToLanguageMap[ext] === language) {
            return ext;
        }
    }
    return 'txt'; // Default to .txt if no mapping found
};

// Generate the accept string for file input
export const supportedUploadExtensions = Object.keys(extensionToLanguageMap)
  .map(ext => `.${ext}`)
  .join(',');

// Re-export the languages array
export const supportedLanguages = languages;
