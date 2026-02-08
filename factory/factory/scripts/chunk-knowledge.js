#!/usr/bin/env node
/**
 * chunk-knowledge.js
 *
 * Reusable RAG knowledge chunker for the Government Automation Factory.
 * Processes markdown files into structured chunks suitable for embedding.
 *
 * Chunking Strategy:
 * - Split on H2 headers (## sections)
 * - Keep H3 subsections with their parent H2
 * - Prefix each chunk with document title (H1) for retrieval context
 * - Extract metadata from YAML frontmatter or file path
 *
 * Zero npm dependencies -- Node.js stdlib only.
 *
 * Usage:
 *   node chunk-knowledge.js --knowledge-dir ../knowledge --output chunks.json --collection mybot
 *
 * All three flags are required.
 */

import fs from 'fs';
import path from 'path';

// ─── Configuration ───────────────────────────────────────────────────────────
const MAX_CHUNK_SIZE = 2000; // Characters
const MIN_CHUNK_SIZE = 100;  // Skip tiny chunks

// ─── CLI Argument Parsing ────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--help' || argv[i] === '-h') {
      printUsage();
      process.exit(0);
    }
    if (argv[i].startsWith('--') && i + 1 < argv.length) {
      const key = argv[i].slice(2);
      args[key] = argv[i + 1];
      i++;
    }
  }
  return args;
}

function printUsage() {
  console.log(`
Usage: node chunk-knowledge.js --knowledge-dir <path> --output <path> --collection <name>

Required flags:
  --knowledge-dir   Path to the directory containing .md knowledge files
  --output          Path for the output JSON file (e.g., chunks.json)
  --collection      Collection name for this bot (e.g., waterbot, bizbot)

Options:
  --help, -h        Show this help message

Example:
  node chunk-knowledge.js \\
    --knowledge-dir ./knowledge \\
    --output ./chunks.json \\
    --collection waterbot
`);
}

function validateArgs(args) {
  const required = ['knowledge-dir', 'output', 'collection'];
  const missing = required.filter(k => !args[k]);
  if (missing.length > 0) {
    console.error(`ERROR: Missing required flags: ${missing.map(f => '--' + f).join(', ')}`);
    console.error('Run with --help for usage.');
    process.exit(1);
  }

  const knowledgeDir = path.resolve(args['knowledge-dir']);
  if (!fs.existsSync(knowledgeDir)) {
    console.error(`ERROR: Knowledge directory does not exist: ${knowledgeDir}`);
    process.exit(1);
  }

  return {
    knowledgeDir,
    outputFile: path.resolve(args['output']),
    collection: args['collection']
  };
}

// ─── YAML Frontmatter Parsing ────────────────────────────────────────────────

/**
 * Parse YAML frontmatter from markdown content.
 * Returns { frontmatter: {...} | null, content: "..." }
 *
 * Simple parser -- handles key: value, key: [list], and multiline lists.
 * No external YAML library needed.
 */
function parseFrontmatter(rawContent) {
  if (!rawContent.startsWith('---')) {
    return { frontmatter: null, content: rawContent };
  }

  const endIndex = rawContent.indexOf('\n---', 3);
  if (endIndex === -1) {
    return { frontmatter: null, content: rawContent };
  }

  const yamlBlock = rawContent.slice(4, endIndex).trim();
  const content = rawContent.slice(endIndex + 4).trim();
  const frontmatter = {};

  let currentKey = null;
  let currentList = null;

  for (const line of yamlBlock.split('\n')) {
    const trimmed = line.trim();

    // List item continuation
    if (trimmed.startsWith('- ') && currentKey && currentList !== null) {
      currentList.push(trimmed.slice(2).trim());
      continue;
    }

    // Flush any pending list
    if (currentKey && currentList !== null) {
      frontmatter[currentKey] = currentList;
      currentList = null;
      currentKey = null;
    }

    // Key: value pair
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();

    if (!key) continue;

    if (value === '' || value === '|') {
      // Start of a list or multiline value
      currentKey = key;
      currentList = [];
    } else if (value.startsWith('[') && value.endsWith(']')) {
      // Inline array: [a, b, c]
      frontmatter[key] = value.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
    } else {
      frontmatter[key] = value;
    }
  }

  // Flush final list
  if (currentKey && currentList !== null) {
    frontmatter[currentKey] = currentList;
  }

  return { frontmatter: Object.keys(frontmatter).length > 0 ? frontmatter : null, content };
}

// ─── File Discovery ──────────────────────────────────────────────────────────

/**
 * Recursively find all .md files in a directory.
 */
function findMarkdownFiles(dir, files = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    console.warn(`WARNING: Could not read directory: ${dir} (${err.message})`);
    return files;
  }

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

// ─── Metadata Extraction ─────────────────────────────────────────────────────

/**
 * Extract category and subcategory from file path.
 * Example: knowledge/03-permits/npdes/npdes-overview.md
 *   -> category: "permits", subcategory: "npdes"
 */
function extractPathMetadata(filePath, knowledgeDir) {
  const relativePath = path.relative(knowledgeDir, filePath);
  const parts = relativePath.split(path.sep);

  // parts[0] = "03-permits" -> "permits"
  let category = parts[0] || '';
  category = category.replace(/^\d+-/, '');

  const subcategory = parts.length > 2 ? parts[1] : '';
  const fileName = parts[parts.length - 1];

  return { category, subcategory, fileName, filePath: relativePath };
}

// ─── Content Processing ──────────────────────────────────────────────────────

/**
 * Extract H1 title from markdown content.
 */
function extractTitle(content) {
  const h1Match = content.match(/^#\s+(.+)$/m);
  return h1Match ? h1Match[1].trim() : 'Untitled';
}

/**
 * Split markdown content into chunks by H2 headers.
 * H3 subsections stay with their parent H2.
 */
function chunkByH2(content, documentTitle) {
  const lines = content.split('\n');
  const chunks = [];
  let currentChunk = [];
  let currentSectionTitle = 'Introduction';

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/);

    if (h2Match) {
      // Save previous chunk if it has content
      if (currentChunk.length > 0) {
        const chunkText = currentChunk.join('\n').trim();
        if (chunkText.length >= MIN_CHUNK_SIZE) {
          chunks.push({ text: chunkText, sectionTitle: currentSectionTitle });
        }
      }

      currentSectionTitle = h2Match[1].trim();
      currentChunk = [line];
    } else if (line.match(/^#\s+/)) {
      // Skip H1 lines -- title is prefixed separately
      continue;
    } else {
      currentChunk.push(line);
    }
  }

  // Flush final chunk
  if (currentChunk.length > 0) {
    const chunkText = currentChunk.join('\n').trim();
    if (chunkText.length >= MIN_CHUNK_SIZE) {
      chunks.push({ text: chunkText, sectionTitle: currentSectionTitle });
    }
  }

  // Prefix each chunk with document title for retrieval context
  return chunks.map(chunk => ({
    text: `# ${documentTitle}\n\n${chunk.text}`,
    sectionTitle: chunk.sectionTitle
  }));
}

/**
 * Split a large chunk into smaller pieces on paragraph boundaries.
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

  // Flush final part
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

// ─── File Processing ─────────────────────────────────────────────────────────

/**
 * Process a single markdown file into chunks.
 */
function processFile(filePath, knowledgeDir, collection) {
  let rawContent;
  try {
    rawContent = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    console.warn(`WARNING: Could not read file: ${filePath} (${err.message})`);
    return [];
  }

  const pathMeta = extractPathMetadata(filePath, knowledgeDir);

  // Parse frontmatter (if present)
  const { frontmatter, content } = parseFrontmatter(rawContent);
  const title = frontmatter?.title || extractTitle(content);

  // Build document_id: collection-filename-slug
  const fileSlug = pathMeta.fileName.replace('.md', '').replace(/\//g, '-');
  const documentId = `${collection}-${fileSlug}`;

  // Determine category/subcategory: frontmatter overrides path-based
  const category = frontmatter?.category || pathMeta.category;
  const subcategory = frontmatter?.subcategory || pathMeta.subcategory;

  // Chunk by H2 sections
  let chunks = chunkByH2(content, title);

  // Split oversized chunks, then filter out any runts from the split
  chunks = chunks.flatMap(splitLargeChunk)
    .filter(chunk => chunk.text.length >= MIN_CHUNK_SIZE);

  // Build final chunk objects
  return chunks.map((chunk, index) => {
    const obj = {
      document_id: documentId,
      chunk_text: chunk.text,
      chunk_index: index,
      file_name: pathMeta.fileName,
      file_path: pathMeta.filePath,
      category,
      subcategory,
      section_title: chunk.sectionTitle,
      char_count: chunk.text.length,
      collection
    };

    if (frontmatter) {
      obj.frontmatter = frontmatter;
    }

    return obj;
  });
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const args = parseArgs(process.argv);
  const { knowledgeDir, outputFile, collection } = validateArgs(args);

  console.log(`Knowledge Chunking Script`);
  console.log(`========================`);
  console.log(`Collection:    ${collection}`);
  console.log(`Knowledge dir: ${knowledgeDir}`);
  console.log(`Output:        ${outputFile}\n`);

  // Find all markdown files
  const files = findMarkdownFiles(knowledgeDir);
  console.log(`Found ${files.length} markdown files\n`);

  if (files.length === 0) {
    console.error(`ERROR: No markdown files found in ${knowledgeDir}`);
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
    const chunks = processFile(file, knowledgeDir, collection);
    allChunks.push(...chunks);

    for (const chunk of chunks) {
      stats.totalChunks++;
      stats.totalChars += chunk.char_count;
      stats.minSize = Math.min(stats.minSize, chunk.char_count);
      stats.maxSize = Math.max(stats.maxSize, chunk.char_count);
      stats.byCategory[chunk.category] = (stats.byCategory[chunk.category] || 0) + 1;
    }
  }

  if (allChunks.length === 0) {
    console.error('ERROR: No chunks produced. Check that files contain H2 sections with content.');
    process.exit(1);
  }

  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write output
  fs.writeFileSync(outputFile, JSON.stringify(allChunks, null, 2));
  console.log(`Wrote ${allChunks.length} chunks to ${outputFile}\n`);

  // Print statistics
  console.log('Statistics:');
  console.log('-----------');
  console.log(`Total files processed: ${files.length}`);
  console.log(`Total chunks created:  ${stats.totalChunks}`);
  console.log(`Average chunk size:    ${Math.round(stats.totalChars / stats.totalChunks)} chars`);
  console.log(`Min chunk size:        ${stats.minSize} chars`);
  console.log(`Max chunk size:        ${stats.maxSize} chars`);
  console.log('\nChunks by category:');

  Object.entries(stats.byCategory)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });

  console.log('\nDone.');
}

main();
