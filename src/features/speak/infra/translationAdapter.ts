export async function translateText(text: string, targetLang = 'en'): Promise<string> {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang })
    });
    const data = await response.json();
    if (response.ok && data.translated) {
      return data.translated.trim();
    }
    console.error('[translationAdapter] Error:', data.error || 'Unknown error');
    return 'Traduction indisponible.';
  } catch (err) {
    console.error('[translationAdapter] Error:', err);
    return 'Traduction indisponible.';
  }
}
