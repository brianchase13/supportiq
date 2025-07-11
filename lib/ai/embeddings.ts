import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export interface SimilarityResult {
  ticketId: string;
  similarity: number;
  category?: string;
  content: string;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!openai) {
    // Return a mock embedding vector for demo mode
    return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
  }

  try {
    // Clean and truncate text for embedding
    const cleanText = text.replace(/\s+/g, ' ').trim().substring(0, 8000);
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small', // Cost-efficient embedding model
      input: cleanText,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation failed:', error);
    throw new Error('Failed to generate embedding');
  }
}

export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  if (!openai) {
    // Return mock embedding vectors for demo mode
    return texts.map(() => Array.from({ length: 1536 }, () => Math.random() * 2 - 1));
  }

  try {
    // Process in batches of 100 for rate limiting
    const batchSize = 100;
    const batches = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
      batches.push(texts.slice(i, i + batchSize));
    }

    const allEmbeddings: number[][] = [];

    for (const batch of batches) {
      const cleanTexts = batch.map(text => 
        text.replace(/\s+/g, ' ').trim().substring(0, 8000)
      );

      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: cleanTexts,
      });

      allEmbeddings.push(...response.data.map(item => item.embedding));

      // Rate limiting - small delay between batches
      if (batches.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return allEmbeddings;
  } catch (error) {
    console.error('Batch embedding generation failed:', error);
    throw new Error('Failed to generate batch embeddings');
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function findSimilarTickets(
  targetEmbedding: number[],
  candidateEmbeddings: { id: string; embedding: number[]; category?: string; content: string }[],
  threshold: number = 0.8,
  maxResults: number = 5
): SimilarityResult[] {
  const similarities = candidateEmbeddings
    .map(candidate => ({
      ticketId: candidate.id,
      similarity: cosineSimilarity(targetEmbedding, candidate.embedding),
      category: candidate.category,
      content: candidate.content,
    }))
    .filter(result => result.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, maxResults);

  return similarities;
}