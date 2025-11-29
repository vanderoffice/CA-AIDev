# KiddoBot - Childcare Services Assistant

<p align="center">
  <img src="https://img.shields.io/badge/Status-In_Development-orange" alt="In Development"/>
  <img src="https://img.shields.io/badge/Architecture-Multi--Agent-blue" alt="Multi-Agent"/>
</p>

**Agentic architecture to help California families find and navigate childcare options.**

---

## Overview

Finding quality, affordable childcare in California is challenging for families. KiddoBot aims to simplify this process by:

- Helping families understand childcare options (centers, family care, preschools)
- Matching families with licensed providers based on location, needs, and budget
- Guiding parents through subsidy and assistance programs
- Providing information on licensing, quality ratings, and safety records

---

## Planned Features

### For Families

| Feature | Description |
|---------|-------------|
| Provider Search | Find licensed childcare by location, type, hours |
| Subsidy Navigator | Guide through CalWORKs, Alternative Payment, etc. |
| Quality Ratings | Explain California Quality Rating System |
| Waitlist Management | Help track applications across providers |
| Cost Calculator | Estimate costs with/without subsidies |

### For Providers

| Feature | Description |
|---------|-------------|
| Licensing Guide | Requirements for different facility types |
| Compliance Tracking | Inspection and certification deadlines |
| Subsidy Enrollment | How to accept subsidized children |

---

## Planned Architecture

Following the established multi-agent pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│                      PARENT INQUIRY                              │
│              (Location, Needs, Budget, Schedule)                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPERVISOR AGENT                              │
│         (Understand needs, route to specialists)                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
  │  Provider   │   │  Subsidy    │   │  Licensing  │
  │   Search    │   │  Navigator  │   │    Info     │
  │   Agent     │   │   Agent     │   │   Agent     │
  └─────────────┘   └─────────────┘   └─────────────┘
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│               PERSONALIZED RECOMMENDATIONS                       │
│         (Provider list, subsidy eligibility, next steps)        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Planned Agents

### Provider Search Agent
- Query Community Care Licensing database
- Filter by type, location, capacity, hours
- Include quality ratings and inspection history

### Subsidy Navigator Agent
- Determine program eligibility
- Guide through application process
- Connect with Resource & Referral agencies

### Licensing Info Agent
- Explain provider types and requirements
- Provide safety and inspection information
- Help interpret licensing records

---

## Data Sources

| Source | Data |
|--------|------|
| Community Care Licensing | Licensed provider database |
| California Resource & Referral Network | Provider availability |
| CalWORKs | Subsidy program information |
| CA Dept. of Social Services | Regulations and requirements |

---

## Technology Stack (Planned)

| Component | Technology |
|-----------|------------|
| Workflow | n8n |
| AI Models | GPT-4, Claude 3.5 |
| Database | PostgreSQL |
| Provider Data | API integration or scraping |
| Geolocation | PostGIS for proximity search |

---

## Development Roadmap

### Phase 1: Research
- [ ] Map childcare landscape in California
- [ ] Document subsidy programs and eligibility
- [ ] Identify data sources and access methods

### Phase 2: Design
- [ ] Define agent responsibilities
- [ ] Design user intake form
- [ ] Plan database schema

### Phase 3: Build
- [ ] Implement provider search agent
- [ ] Implement subsidy navigator agent
- [ ] Build supervisor workflow

### Phase 4: Test & Deploy
- [ ] User testing with families
- [ ] Validate provider data accuracy
- [ ] Deploy to production

---

## Related Projects

| Project | Relationship |
|---------|--------------|
| [BizBot](../bizbot/) | Reference architecture |
| [CommentBot](../commentbot/) | Multi-agent patterns |
| [CA-Strategy](https://github.com/vanderoffice/CA-Strategy) | Strategic context |

---

## Contributing

This project is in early development. Contributions welcome for:

- Research on California childcare systems
- Data source identification
- Agent prompt development
- User experience design

---

*Helping California families find the childcare they need*
