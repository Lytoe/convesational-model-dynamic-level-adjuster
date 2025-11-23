export async function addWordToFavorites(userId: string, word: string, cefr: string) {
  const response = await fetch('/api/favorites/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, word, cefr }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to add favorite');
  }

  return await response.json();
}
