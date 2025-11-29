# n8n Workflow Configuration Guide

## Analysis Agent Workflow

**Filename**: `01-pdf-analysis-agent.json`

### Nodes Configuration

#### 1. Webhook Trigger
- **Type**: Webhook
- **Method**: POST
- **Path**: `/pdf-upload`
- **Response**: Return on last node
- **Expected payload**: `{ "file": "<base64_pdf>", "filename": "doc.pdf", "user_id": "reviewer@ca.gov" }`

#### 2. Extract PDF Binary
- **Type**: Code (JavaScript)
- **Purpose**: Decode base64 PDF, calculate hash
```javascript
const pdfData = Buffer.from($input.item.json.file, 'base64');
const crypto = require('crypto');
const hash = crypto.createHash('sha256').update(pdfData).digest('hex');

return {
  json: {
    filename: $input.item.json.filename,
    hash: hash,
    size: pdfData.length,
    binary: pdfData
  }
};
```

#### 3. Read PDF Metadata
- **Type**: Read PDF
- **Binary Property**: `binary`
- **Extract**: Metadata, Page Count, Text Content

#### 4. Check Machine Readability
- **Type**: IF
- **Condition**: `{{ $json.extractedText.length > 100 }}`
- **True branch**: Skip OCR
- **False branch**: Proceed to OCR

#### 5. Tesseract OCR (if needed)
- **Type**: Tesseract OCR (community node)
- **Binary Property**: `binary`
- **Language**: `eng`
- **Output Format**: `text`
- **Confidence Threshold**: 80

#### 6. Accessibility Analysis (AI)
- **Type**: HTTP Request
- **Method**: POST
- **URL**: OpenAI or Claude API
- **Prompt Template**:
```
Analyze this PDF document for WCAG 2.2 Level AA compliance.
Document text: {{ $json.extractedText }}
Page count: {{ $json.pageCount }}

Check for:
1. Missing alt-text (count images without descriptions)
2. Improper heading hierarchy
3. Missing document language tag
4. Form fields without labels
5. Reading order issues

Return JSON: { "issues": [{"type": "...", "severity": "...", "location": "...", "suggestion": "..."}], "compliance_score": 0-100 }
```

#### 7. Store Analysis in PostgreSQL
- **Type**: PostgreSQL
- **Operation**: Insert
- **Table**: `pdf_analysis`
- **Fields**:
  - `pdf_filename`: `{{ $json.filename }}`
  - `pdf_hash`: `{{ $json.hash }}`
  - `file_size_bytes`: `{{ $json.size }}`
  - `page_count`: `{{ $json.pageCount }}`
  - `is_machine_readable`: `{{ $json.isMachineReadable }}`
  - `status`: `'pending_review'`
  - `issue_report`: `{{ JSON.stringify($json.issues) }}`
  - `created_by`: `{{ $json.user_id }}`

#### 8. Trigger Review Agent
- **Type**: Webhook
- **Method**: POST
- **URL**: `http://n8n:5678/webhook/start-review`
- **Payload**: `{ "analysis_id": "{{ $json.analysis_id }}" }`

---

## Review Agent Workflow

**Filename**: `02-human-review-agent.json`

### Nodes Configuration

#### 1. Webhook Trigger (Start Review)
- **Type**: Webhook
- **Path**: `/start-review`
- **Method**: POST
- **Expected**: `{ "analysis_id": 123 }`

#### 2. Fetch Analysis from PostgreSQL
- **Type**: PostgreSQL
- **Operation**: Select
- **Query**: `SELECT * FROM pdf_analysis WHERE id = {{ $json.analysis_id }}`

#### 3. Generate Tally Form Payload
- **Type**: Code (JavaScript)
```javascript
const issues = JSON.parse($input.item.json.issue_report);

// Build form fields dynamically
const formFields = issues.issues.map((issue, idx) => ({
  id: `issue_${idx}`,
  type: issue.type,
  severity: issue.severity,
  location: issue.location,
  suggestion: issue.suggestion,
  default_alttext: issue.ai_suggested_alttext || ''
}));

return {
  json: {
    analysis_id: $input.item.json.id,
    pdf_filename: $input.item.json.pdf_filename,
    form_fields: formFields,
    form_title: `Review: ${$input.item.json.pdf_filename}`
  }
};
```

#### 4. Create Tally Form (HTTP)
- **Type**: HTTP Request
- **Method**: POST
- **URL**: Tally API endpoint
- **Body**: Dynamic form configuration
- **Store**: Form URL in response

#### 5. Update Analysis with Form URL
- **Type**: PostgreSQL
- **Operation**: Update
- **Query**: `UPDATE pdf_analysis SET tally_form_url = '{{ $json.form_url }}', status = 'in_review' WHERE id = {{ $json.analysis_id }}`

#### 6. Send Notification
- **Type**: Email (or Slack)
- **To**: Reviewer email
- **Subject**: `PDF Accessibility Review Required: {{ $json.pdf_filename }}`
- **Body**:
```
Please review the accessibility analysis for {{ $json.pdf_filename }}.

Total issues found: {{ $json.issue_count }}
Review form: {{ $json.form_url }}

This review is required before automated remediation can proceed.
```

#### 7. Wait for Form Submission (Webhook)
- **Type**: Webhook
- **Path**: `/tally-webhook`
- **Method**: POST
- **Wait for**: Form submission from Tally

#### 8. Parse Human Feedback
- **Type**: Code (JavaScript)
```javascript
const feedback = $input.item.json;
const decisions = [];

// Parse each issue decision
feedback.responses.forEach(response => {
  decisions.push({
    issue_id: response.issue_id,
    decision: response.decision, // approve/reject/modify
    modified_value: response.modified_alttext || null,
    reviewer_notes: response.notes || null
  });
});

return { json: { 
  analysis_id: feedback.analysis_id,
  decisions: decisions,
  reviewer_id: feedback.reviewer_email,
  approved_count: decisions.filter(d => d.decision === 'approve').length
}};
```

#### 9. Store Feedback in PostgreSQL
- **Type**: PostgreSQL (loop through decisions)
- **Operation**: Insert
- **Table**: `human_feedback`

#### 10. Update Analysis Status
- **Type**: IF
- **Condition**: `{{ $json.approved_count > 0 }}`
- **True**: Update status to 'approved', trigger Remediation Agent
- **False**: Update status to 'rejected', notify submitter

---

## Remediation Agent Workflow

**Filename**: `03-remediation-agent.json`

### Nodes Configuration

#### 1. Webhook Trigger
- **Type**: Webhook
- **Path**: `/start-remediation`
- **Method**: POST

#### 2. Fetch Approved Fixes
- **Type**: PostgreSQL
- **Query**:
```sql
SELECT pa.*, hf.issue_id, hf.decision, hf.modified_value
FROM pdf_analysis pa
JOIN human_feedback hf ON pa.id = hf.analysis_id
WHERE pa.id = {{ $json.analysis_id }}
  AND hf.decision IN ('approve', 'modify')
```

#### 3. Load Original PDF
- **Type**: HTTP Request (fetch from storage)
- **URL**: `{{ $json.original_pdf_url }}`

#### 4. Apply Remediations (Docling API)
- **Type**: HTTP Request
- **Method**: POST
- **URL**: Docling remediation endpoint
- **Body**:
```json
{
  "pdf_binary": "{{ $json.pdfBase64 }}",
  "fixes": [
    {
      "type": "add_alt_text",
      "page": 1,
      "image_id": "img_3",
      "alt_text": "{{ $json.approved_alttext }}"
    },
    {
      "type": "set_language",
      "language": "en-US"
    }
  ]
}
```

#### 5. Re-validate Accessibility
- **Type**: HTTP Request (AI model)
- **Purpose**: Run same checks as Analysis Agent
- **Compare**: Before/after issue counts

#### 6. Store Remediation Audit
- **Type**: PostgreSQL (loop)
- **Table**: `remediation_audit`
- **Fields**: analysis_id, fix_type, fix_details, confidence_score

#### 7. Upload Remediated PDF
- **Type**: HTTP Request (storage service)
- **Method**: POST
- **Store**: New PDF URL

#### 8. Update Analysis Record
- **Type**: PostgreSQL
- **Operation**: Update
- **Query**: `UPDATE pdf_analysis SET status = 'completed', remediated_pdf_url = '{{ $json.new_pdf_url }}' WHERE id = {{ $json.analysis_id }}`

#### 9. Generate Compliance Report
- **Type**: Code (JavaScript)
- **Output**: Markdown report with before/after comparison

#### 10. Send Completion Notification
- **Type**: Email
- **Subject**: `PDF Remediation Complete: {{ $json.pdf_filename }}`
- **Body**: Include download links, compliance summary

---

## Environment Variables

Store in n8n credentials or environment:

```env
POSTGRES_HOST=localhost
POSTGRES_DB=accessibility_db
POSTGRES_USER=n8n_user
POSTGRES_PASSWORD=<secure_password>

OPENAI_API_KEY=<your_key>
ANTHROPIC_API_KEY=<your_key>
GOOGLE_API_KEY=<your_key>
PERPLEXITY_API_KEY=<your_key>

TALLY_API_KEY=<your_key>
TALLY_WEBHOOK_SECRET=<verify_signature>

PDF_STORAGE_URL=https://storage.example.com
PDF_STORAGE_API_KEY=<your_key>

SMTP_HOST=smtp.ca.gov
SMTP_PORT=587
SMTP_USER=notifications@ca.gov
SMTP_PASSWORD=<secure_password>
```

## Testing Workflow

1. Export each workflow as JSON from n8n GUI
2. Test webhook endpoints with curl:
```bash
# Upload PDF
curl -X POST http://localhost:5678/webhook/pdf-upload \
  -H "Content-Type: application/json" \
  -d '{"file": "<base64_pdf>", "filename": "test.pdf", "user_id": "test@ca.gov"}'

# Simulate Tally webhook
curl -X POST http://localhost:5678/webhook/tally-webhook \
  -H "Content-Type: application/json" \
  -d '{"analysis_id": 1, "responses": [...]}'
```

3. Monitor PostgreSQL for status updates:
```sql
SELECT id, pdf_filename, status FROM pdf_analysis ORDER BY upload_timestamp DESC LIMIT 5;
```