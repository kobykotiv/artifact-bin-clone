/**
 * Format a JSON object as a string with proper indentation
 */
export function formatJSON(json: any): string {
  return JSON.stringify(json, null, 2);
}

/**
 * Parses a string as JSON, returns null if invalid
 */
export function parseJSON(jsonString: string): any {
  try {
    return JSON.stringify(JSON.parse(jsonString)) === '{}' && jsonString.trim() !== '{}' 
      ? null 
      : JSON.parse(jsonString);
  } catch (e) {
    return null;
  }
}

/**
 * Checks if a string is valid JSON
 */
export function isValidJSON(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (e) {
    return false;
  }
}
