# ADABot - Accessibility Compliance Guide

<p align="center">
  <img src="https://img.shields.io/badge/Status-Documentation-yellow" alt="Documentation"/>
  <img src="https://img.shields.io/badge/Standard-WCAG_2.2_AA-blue" alt="WCAG 2.2"/>
  <img src="https://img.shields.io/badge/Focus-PDF_Accessibility-informational" alt="PDF Focus"/>
</p>

**Guide and assessment system for ADA (Americans with Disabilities Act) compliance, focusing on WCAG 2.2 Level AA requirements for government documents.**

---

## Overview

California state agencies must ensure all public-facing documents meet accessibility standards. ADABot provides:

- **WCAG 2.2 compliance checklists** specific to PDF documents
- **Common issue identification** with remediation steps
- **Testing tool recommendations** (automated and manual)
- **California-specific requirements** per state web standards

---

## California Requirements

Per [CA Web Standards](https://webstandards.ca.gov):

| Requirement | Details |
|-------------|---------|
| Conformance Level | WCAG 2.2 Level AA |
| Certification | Biennial for state agencies |
| Federal Compliance | Section 508 mandatory |
| Publication Rule | Documents must be accessible before publication |
| Alternatives | Available upon request |

---

## Documents in This Folder

| File | Purpose |
|------|---------|
| [wcag-checklist.md](./wcag-checklist.md) | Complete WCAG 2.2 AA checklist for PDFs |
| [postgres-schema.md](./postgres-schema.md) | Database schema for tracking compliance |
| [n8n-workflow-guide.md](./n8n-workflow-guide.md) | Workflow implementation guide |

---

## WCAG 2.2 Quick Reference

### Level A (Must-Have)

| Criterion | Requirement | PDF Check |
|-----------|-------------|-----------|
| 1.1.1 | Non-text content has alt-text | `<Figure>` tags have `/Alt` |
| 1.3.1 | Proper heading hierarchy | Structure tree in Acrobat |
| 1.3.2 | Reading order matches visual | Order Panel verification |
| 2.1.1 | Keyboard accessible | Tab key navigation |
| 2.4.2 | Document has title | `/Title` in metadata |
| 3.1.1 | Language specified | `/Lang` attribute |
| 4.1.2 | Form fields labeled | `/T` and `/TU` attributes |

### Level AA (Required)

| Criterion | Requirement | PDF Check |
|-----------|-------------|-----------|
| 1.4.3 | 4.5:1 contrast ratio | Color Contrast Analyzer |
| 1.4.5 | Avoid images of text | Check `<Figure>` for text |
| 3.3.3 | Error suggestions | Form field tooltips |
| 3.3.4 | Error prevention | Review step before submit |

---

## Common PDF Issues

### Scanned PDFs
- **Problem**: Not machine-readable
- **Fix**: Run OCR (Tesseract), create searchable layer

### Missing Alt-Text
- **Problem**: Images without descriptions
- **Fix**: Add `/Alt` entry to each `<Figure>` tag
  ```
  <Figure Alt="Bar chart showing 2024 revenue growth of 15%">
  ```

### Improper Headings
- **Problem**: Skipped heading levels
- **Fix**: Tag content with proper H1 > H2 > H3 hierarchy

### Unlabeled Form Fields
- **Problem**: Screen readers can't identify fields
- **Fix**: Add `/TU` (tooltip/description) to each field

### Missing Document Language
- **Problem**: Screen readers use wrong pronunciation
- **Fix**: Set `/Lang (en-US)` in document catalog

---

## Testing Tools

### Automated
| Tool | Type | Cost |
|------|------|------|
| PAC 2021 | PDF checker | Free |
| Adobe Acrobat Pro | Accessibility checker | Paid |
| PAVE | PDF validation | Free |

### Manual
| Tool | Platform | Cost |
|------|----------|------|
| NVDA | Windows screen reader | Free |
| JAWS | Windows screen reader | Paid |
| VoiceOver | macOS built-in | Free |

---

## Accessibility Report Template

```markdown
# PDF Accessibility Report

**Document**: [filename.pdf]
**Date**: [YYYY-MM-DD]
**Reviewer**: [name]

## Summary
- Pages: [X]
- Issues Found: [X]
- WCAG 2.2 AA Compliance: [Pass/Fail]

## Issues by Category

### Critical (Blocks Access)
1. [Issue] - Page [X] - WCAG [criterion]

### Important (Degrades Experience)
1. [Issue] - Page [X] - WCAG [criterion]

## Remediation Actions
- [ ] Add alt-text to [X] images
- [ ] Fix heading structure
- [ ] Set document language
- [ ] Add form field labels

## Compliance Checklist
- [x] 1.1.1 Alt-text present
- [ ] 1.3.1 Proper structure
- [x] 2.4.2 Document titled
```

---

## AI-Generated Alt-Text Guidelines

### Good Alt-Text
- Concise (150 characters max)
- Describes content, not appearance
- Includes data from charts/graphs
- Contextual to surrounding text

**Example**: *"Line graph showing California unemployment rate declining from 8% in 2020 to 4.2% in 2024"*

### Bad Alt-Text
- "Image of a graph"
- "Photo"
- "Click here"
- Repeats visible caption verbatim

---

## Future Development

ADABot is planned to include:

- [ ] Automated PDF accessibility scanning
- [ ] AI-generated alt-text suggestions
- [ ] Batch document processing
- [ ] Compliance tracking dashboard
- [ ] Integration with document management systems

---

## Resources

| Resource | URL |
|----------|-----|
| WCAG 2.2 Full Spec | https://www.w3.org/TR/WCAG22/ |
| PDF/UA Standard | https://www.pdfa.org/pdfua/ |
| WebAIM PDF Guide | https://webaim.org/techniques/acrobat/ |
| CA Web Standards | https://webstandards.ca.gov/accessibility/ |
| Section 508 | https://www.section508.gov/ |

---

## Related Projects

- [BizBot](../bizbot/) - PDF generation with accessibility
- [CommentBot](../commentbot/) - Document analysis patterns
- [CA-Strategy](https://github.com/vanderoffice/CA-Strategy) - Governance frameworks

---

*Ensuring California government documents are accessible to everyone*
