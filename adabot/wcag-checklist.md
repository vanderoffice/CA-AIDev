# WCAG 2.2 Level AA Checklist for PDF Documents

Quick reference for California web accessibility compliance (PDF-specific).

## Critical Success Criteria (Must-Have)

### Level A

**1.1.1 Non-text Content**
- All images, charts, diagrams have alt-text
- Decorative images marked as "artifact"
- Complex images include extended descriptions
- **PDF Test**: Check all `<Figure>` tags have `/Alt` entry

**1.3.1 Info and Relationships**
- Proper heading hierarchy (H1 > H2 > H3, no skips)
- Lists use `<L>`, `<LI>` tags
- Tables use `<TH>`, `<TR>`, `<TD>` structure
- **PDF Test**: Verify structure tree in Adobe Acrobat

**1.3.2 Meaningful Sequence**
- Reading order matches visual order
- Tab order follows logical flow
- **PDF Test**: Use "Order Panel" to verify tab sequence

**2.1.1 Keyboard**
- All form fields keyboard accessible
- No mouse-only controls
- **PDF Test**: Navigate entire document with Tab key

**2.4.2 Page Titled**
- Document has descriptive title
- Title appears in `/Title` metadata
- **PDF Test**: Check Document Properties > Description

**3.1.1 Language of Page**
- Primary document language specified
- **PDF Test**: Verify `/Lang` attribute in document catalog

**3.3.2 Labels or Instructions**
- All form fields have visible labels
- Instructions precede form sections
- **PDF Test**: Check `/TU` (tooltip/description) for fields

**4.1.2 Name, Role, Value**
- Form fields have `/T` (name) attribute
- Field type (`/FT`) correctly set
- **PDF Test**: Tab through form, verify field names read by screen reader

### Level AA

**1.4.3 Contrast (Minimum)**
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+): 3:1 contrast ratio
- **PDF Test**: Use Color Contrast Analyzer on embedded images

**1.4.5 Images of Text**
- Avoid text embedded in images
- Use actual text with styling instead
- Exception: logos
- **PDF Test**: Search for `<Figure>` tags, check if contain text

**3.3.3 Error Suggestion**
- Form validation provides correction hints
- Example: "Email must include @"
- **PDF Test**: Check form field tooltips for guidance

**3.3.4 Error Prevention**
- Allow review before submission (if form submits)
- Confirmation page for important actions
- **PDF Test**: Forms should have "Review" step

## Common PDF-Specific Issues

### Issue: Scanned PDF (not machine-readable)
**Fix**: Run OCR (Tesseract), create searchable PDF layer

### Issue: Missing alt-text
**Fix**: Add `/Alt` entry to each `<Figure>` tag
```
<Figure Alt="Bar chart showing 2024 revenue growth of 15%">
```

### Issue: Improper heading structure
**Fix**: Tag content with proper heading levels
```
<H1>Document Title</H1>
<H2>Section Title</H2>
<H3>Subsection Title</H3>
```

### Issue: No document language
**Fix**: Set `/Lang` in document catalog
```
/Lang (en-US)
```

### Issue: Untagged content
**Fix**: Run Adobe Acrobat "Add Tags to Document" or manual tagging

### Issue: Form fields unlabeled
**Fix**: Add `/TU` (user-friendly name) to field
```
/T (email_field) /TU (Email Address) /FT /Tx
```

### Issue: Images marked as content instead of artifact
**Fix**: Decorative images should be artifacts, not figures
```
<Artifact Type="Layout"> <!-- decorative border -->
<Figure Alt="..."> <!-- meaningful chart -->
```

### Issue: Table headers not defined
**Fix**: Mark header rows/columns with `/Scope`
```
<TH Scope="Column">Year</TH>
<TH Scope="Column">Revenue</TH>
```

### Issue: Broken reading order
**Fix**: Reorder content in structure tree to match visual flow

### Issue: Color-only information
**Fix**: Add text labels or patterns in addition to color
Example: Charts use both color AND shapes/patterns

## Testing Tools

**Automated:**
- PAC 2021 (free PDF accessibility checker)
- Adobe Acrobat Pro Accessibility Checker
- PAVE (PDF Accessibility Validation Engine)

**Manual:**
- NVDA screen reader (free, Windows)
- JAWS screen reader (Windows)
- VoiceOver (macOS built-in)
- Tab key navigation test

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
1. [Issue description] - Page [X] - WCAG [criterion]

### Important (Degrades Experience)
1. [Issue description] - Page [X] - WCAG [criterion]

### Minor (Best Practice)
1. [Issue description] - Page [X] - WCAG [criterion]

## Remediation Actions Required
- [ ] Add alt-text to [X] images
- [ ] Fix heading structure on pages [X, Y]
- [ ] Set document language
- [ ] Add form field labels
- [ ] Run OCR on pages [X-Y]

## Compliance Checklist
- [x] 1.1.1 Alt-text present
- [ ] 1.3.1 Proper structure
- [ ] 1.3.2 Reading order correct
- [x] 2.4.2 Document titled
- [ ] 3.1.1 Language specified
- [x] 4.1.2 Form fields labeled
```

## California-Specific Requirements

Per CA Web Standards (webstandards.ca.gov):
- Biennial certification required for state agencies
- Compliance with Section 508 mandatory
- WCAG 2.2 AA conformance level required
- Public documents must be accessible before publication
- Alternative formats available upon request

## AI-Generated Alt-Text Guidelines

**Good alt-text:**
- Concise (150 characters max)
- Describes content, not appearance
- Includes data from charts/graphs
- Contextual to surrounding text

Example: "Line graph showing California unemployment rate declining from 8% in 2020 to 4.2% in 2024"

**Bad alt-text:**
- "Image of a graph"
- "Photo"
- "Click here"
- Repeats visible caption verbatim

## Resources

- WCAG 2.2 Full Spec: https://www.w3.org/TR/WCAG22/
- PDF/UA Standard: https://www.pdfa.org/pdfua/
- WebAIM PDF Guide: https://webaim.org/techniques/acrobat/
- CA Web Standards: https://webstandards.ca.gov/accessibility/
- Section 508: https://www.section508.gov/