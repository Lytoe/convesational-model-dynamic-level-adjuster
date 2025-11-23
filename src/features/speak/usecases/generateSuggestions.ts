export function generateSuggestions(context: string, level: 'A1' | 'A2' | 'B1' | 'B2'): string[] {
  // Mock suggestions: real implementation will use LLM
  if (level === 'A1') return ['Je vais bien.', 'Ça va.', 'Très bien.'];
  if (level === 'A2') return ['Je vais bien, merci.', 'Ça va bien.', 'Très bien, et toi ?'];
  return ['Je vais bien, merci beaucoup.', 'Ça va parfaitement.', 'Plutôt bien, et toi ?'];
}
