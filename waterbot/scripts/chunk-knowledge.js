#!/usr/bin/env node
/**
 * chunk-knowledge.js
 * 
 * Processes WaterBot knowledge markdown files into chunks suitable for embedding.
 * 
 * Chunking Strategy:
 * - Split on H2 headers (## sections)
 * - Keep H3 subsections with their parent H2
 * - Prefix each chunk with document title (H1) for context
 * - Extract metadata from file path (category, subcategory)
 * 
 * Output: scripts/chunks.json
 * 
 * Usage: node scripts/chunk-knowledge.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KNOWLEDGE_DIR = path.join(__dirname, '..', 'knowledge');
const OUTPUT_FILE = path.join(__dirname, 'chunks.json');

// Configuration
const MAX_CHUNK_SIZE = 2000; // Characters - allows room for context
const MIN_CHUNK_SIZE = 100;  // Don't create tiny chunks

/**
 * Recursively find all .md files in a directory
 */
function findMarkdownFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findMarkdownFiles(fullPath, files);
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Extract category and subcategory from file path
 * Example: knowledge/03-permits/npdes/npdes-overview.md
 *   -> category: "permits", subcategory: "npdes"
 */
function extractMetadata(filePath) {
  const relativePath = path.relative(KNOWLEDGE_DIR, filePath);
  const parts = relativePath.split(path.sep);
  
  // parts[0] = "03-permits" -> "permits"
  // parts[1] = "npdes" (subcategory folder)
  // parts[2] = "npdes-overview.md"
  
  let category = parts[0] || '';
  // Remove leading number prefix like "03-"
  category = category.replace(/^\d+-/, '');
  
  const subcategory = parts.length > 2 ? parts[1] : '';
  const fileName = parts[parts.length - 1];
  
  return {
    category,
    subcategory,
    fileName,
    filePath: relativePath,
    documentId: relativePath.replace('.md', '').replace(/\//g, '-')
  };
}

/**
 * Extract H1 title from markdown content
 */
function extractTitle(content) {
  const h1Match = content.match(/^#\s+(.+)$/m);
  return h1Match ? h1Match[1].trim() : 'Untitled';
}

/**
 * Split markdown content into chunks by H2 headers
 * Returns array of { text, sectionTitle }
 */
function chunkByH2(content, documentTitle) {
  const lines = content.split('\n');
  const chunks = [];
  let currentChunk = [];
  let currentSectionTitle = 'Introduction';
  let inIntro = true;
  
  for (const line of lines) {
    // Check for H2 header
    const h2Match = line.match(/^##\s+(.+)$/);
    
    if (h2Match) {
      // Save previous chunk if it has content
      if (currentChunk.length > 0) {
        const chunkText = currentChunk.join('\n').trim();
        if (chunkText.length >= MIN_CHUNK_SIZE) {
          chunks.push({
            text: chunkText,
            sectionTitle: currentSectionTitle
          });
        }
      }
      
      // Start new chunk with the H2 header
      currentSectionTitle = h2Match[1].trim();
      currentChunk = [line];
      inIntro = false;
    } else if (line.match(/^#\s+/)) {
      // Skip H1 - we'll add document title separately
      continue;
    } else {
      currentChunk.push(line);
    }
  }
  
  // Don't forget the last chunk
  if (currentChunk.length > 0) {
    const chunkText = currentChunk.join('\n').trim();
    if (chunkText.length >= MIN_CHUNK_SIZE) {
      chunks.push({
        text: chunkText,
        sectionTitle: currentSectionTitle
      });
    }
  }
  
  // Add document title context to each chunk
  return chunks.map(chunk => ({
    text: `# ${documentTitle}\n\n${chunk.text}`,
    sectionTitle: chunk.sectionTitle
  }));
}

/**
 * Split a large chunk into smaller pieces if it exceeds MAX_CHUNK_SIZE
 * Tries to split on paragraph boundaries
 */
function splitLargeChunk(chunk) {
  if (chunk.text.length <= MAX_CHUNK_SIZE) {
    return [chunk];
  }
  
  const result = [];
  const paragraphs = chunk.text.split('\n\n');
  let currentText = '';
  let partIndex = 0;
  
  for (const para of paragraphs) {
    if (currentText.length + para.length + 2 > MAX_CHUNK_SIZE && currentText.length > 0) {
      // Save current chunk and start new one
      result.push({
        text: currentText.trim(),
        sectionTitle: `${chunk.sectionTitle} (part ${partIndex + 1})`
      });
      currentText = para;
      partIndex++;
    } else {
      currentText = currentText ? `${currentText}\n\n${para}` : para;
    }
  }
  
  // Don't forget the last part
  if (currentText.trim().length > 0) {
    if (partIndex > 0) {
      result.push({
        text: currentText.trim(),
        sectionTitle: `${chunk.sectionTitle} (part ${partIndex + 1})`
      });
    } else {
      result.push({
        text: currentText.trim(),
        sectionTitle: chunk.sectionTitle
      });
    }
  }
  
  return result;
}

/**
 * Process a single markdown file into chunks
 */
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const metadata = extractMetadata(filePath);
  const title = extractTitle(content);
  
  // Chunk by H2 sections
  let chunks = chunkByH2(content, title);
  
  // Split any oversized chunks
  chunks = chunks.flatMap(splitLargeChunk);
  
  // Create final chunk objects
  return chunks.map((chunk, index) => ({
    document_id: metadata.documentId,
    chunk_text: chunk.text,
    chunk_index: index,
    file_name: metadata.fileName,
    file_path: metadata.filePath,
    category: metadata.category,
    subcategory: metadata.subcategory,
    section_title: chunk.sectionTitle,
    char_count: chunk.text.length
  }));
}

/**
 * Main execution
 */
function main() {
  console.log('WaterBot Knowledge Chunking Script');
  console.log('==================================\n');
  
  // Find all markdown files
  const files = findMarkdownFiles(KNOWLEDGE_DIR);
  console.log(`Found ${files.length} markdown files\n`);
  
  if (files.length === 0) {
    console.error('No markdown files found in', KNOWLEDGE_DIR);
    process.exit(1);
  }
  
  // Process all files
  const allChunks = [];
  const stats = {
    byCategory: {},
    totalChunks: 0,
    totalChars: 0,
    minSize: Infinity,
    maxSize: 0
  };
  
  for (const file of files) {
    const chunks = processFile(file);
    allChunks.push(...chunks);
    
    // Update stats
    for (const chunk of chunks) {
      stats.totalChunks++;
      stats.totalChars += chunk.char_count;
      stats.minSize = Math.min(stats.minSize, chunk.char_count);
      stats.maxSize = Math.max(stats.maxSize, chunk.char_count);
      
      stats.byCategory[chunk.category] = (stats.byCategory[chunk.category] || 0) + 1;
    }
  }
  
  // Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allChunks, null, 2));
  console.log(`Wrote ${allChunks.length} chunks to ${OUTPUT_FILE}\n`);
  
  // Print statistics
  console.log('Statistics:');
  console.log('-----------');
  console.log(`Total files processed: ${files.length}`);
  console.log(`Total chunks created: ${stats.totalChunks}`);
  console.log(`Average chunk size: ${Math.round(stats.totalChars / stats.totalChunks)} chars`);
  console.log(`Min chunk size: ${stats.minSize} chars`);
  console.log(`Max chunk size: ${stats.maxSize} chars`);
  console.log('\nChunks by category:');
  
  Object.entries(stats.byCategory)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });
  
  console.log('\nDone! Ready for embedding generation (PLAN-11-02)');
}

main();
