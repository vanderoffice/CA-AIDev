---
title: "[Document Title]"
domain: "[agency-or-domain-slug]"
category: "[topic-category]"
subcategory: "[specific-topic]"
source_authority: "[authorizing body, e.g. State Water Resources Control Board]"
source_urls:
  - "[primary source URL]"
last_verified: "YYYY-MM-DD"
---

<!-- ============================================================
  KNOWLEDGE DOCUMENT TEMPLATE
  ============================================================
  This template standardizes how knowledge documents are authored
  for the RAG (Retrieval-Augmented Generation) pipeline.

  KEY RULES:
  1. H2 (##) headers = chunk boundaries.
     chunk-knowledge.js splits on every H2, so each ## section
     becomes its own vector-searchable chunk.

  2. H3 (###) content stays with its parent H2 chunk.
     Subsections under an H2 are NOT split out — they remain
     part of the parent chunk for context preservation.

  3. Ideal section length: 500–1500 characters per H2 section.
     - Minimum: ~100 chars (smaller chunks are filtered out)
     - Maximum: 2000 chars (larger chunks are auto-split at
       paragraph boundaries)

  4. Frontmatter fields are injected into every chunk's metadata.
     The chunker extracts title, domain, category, subcategory,
     source_authority, source_urls, and last_verified into each
     chunk's metadata object for retrieval filtering.

  5. The H1 title is prefixed to every chunk for retrieval context.
     When a user searches "permit requirements," each chunk arrives
     with "California Water Permits: [chunk text]" so the LLM
     knows which document the chunk belongs to.

  6. Use plain markdown — no HTML, no embedded images.
     The chunker processes raw markdown text only.
  ============================================================ -->

# [Document Title]

## Overview

[Brief description — what this document covers, who it's for, why it matters.
This section becomes the first chunk and often matches broad "what is X" queries.]

## [Topic Section 1]

[Each H2 header becomes a chunk boundary during processing.
Write focused, self-contained sections that answer a specific question
or cover a specific subtopic.]

### [Subsection]

[H3 content stays with its parent H2 chunk. Use subsections to organize
longer topics without creating additional chunk splits.]

## [Topic Section 2]

[Keep sections focused — aim for 500–1500 chars per H2 section.
If a section exceeds 2000 chars, the chunker will auto-split it
at paragraph boundaries, which may break context. Better to split
into two H2 sections manually.]

## Key Requirements

[Summarize actionable requirements, regulations, or procedures.
Bullet lists work well here — they're concise and chunk-friendly.]

- Requirement 1
- Requirement 2
- Requirement 3

## Related Resources

- [Link to related document or external resource](URL)
- [Another related resource](URL)

<!-- ============================================================
  AUTHORING CHECKLIST:
  [ ] All 7 frontmatter fields populated
  [ ] H1 title matches frontmatter title
  [ ] Each H2 section is 500-1500 chars (check with wc -m)
  [ ] No H2 section exceeds 2000 chars
  [ ] source_urls point to live, authoritative pages
  [ ] last_verified date is current
  [ ] No HTML tags or embedded images
  ============================================================ -->
