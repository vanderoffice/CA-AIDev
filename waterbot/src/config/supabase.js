/**
 * Supabase Connection Info for WaterBot
 *
 * This file documents the database connection - actual connections
 * are made via n8n Postgres credentials, not from the frontend.
 *
 * Database: VPS supabase-db container
 * Host: db (docker network) or localhost:5432 (from VPS host)
 * Database: n8n
 * Schema: waterbot
 * Table: document_chunks
 *
 * n8n Credential: "Postgres account" (same as KiddoBot)
 * Connection: postgres://postgres:***@db:5432/n8n
 *
 * Table structure:
 * - id: serial primary key
 * - document_id: text (source document identifier)
 * - chunk_text: text (the actual content chunk)
 * - chunk_index: integer (position in source document)
 * - file_name: text (original file name)
 * - file_path: text (path in knowledge base)
 * - category: text (e.g., "permits", "funding")
 * - subcategory: text (e.g., "NPDES", "CWSRF")
 * - embedding: vector(1536) (OpenAI text-embedding-3-small)
 * - created_at: timestamptz
 *
 * Vector search parameters (from PROJECT.md):
 * - Cosine similarity threshold: > 0.70
 * - Top-K: 8 results
 * - Embedding model: text-embedding-3-small (1536 dimensions)
 */

export const WATERBOT_DB_CONFIG = {
  schema: 'waterbot',
  table: 'document_chunks',
  embeddingDimensions: 1536,
  similarityThreshold: 0.70,
  topK: 8,
}
