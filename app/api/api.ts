export async function fetchRAGAnswer(query: string): Promise<{ answer: string }> {
  const response = await fetch('http://127.0.0.1:5005/rag', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch RAG answer');
  }

  return response.json();
}
