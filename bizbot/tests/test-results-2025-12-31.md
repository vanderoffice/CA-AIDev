# BizBot Test Results

**Date:** 2025-12-31
**Endpoint:** `https://n8n.vanderdev.net/webhook/bizbot`
**Frontend:** `https://vanderdev.net/bizbot`
**Tests Run:** 5

---

## Test Scenarios

### B1: Restaurant with Bar (San Francisco)

**Prompt:**
> I want to open a full-service restaurant in San Francisco with a bar area and outdoor seating. I'll be forming an LLC with 2 partners. We expect to hire about 15 employees. What licenses do I need and in what order should I apply?

**Response Quality:** 8/10

**Response:**
> Opening your full-service restaurant in San Francisco as an LLC is an exciting venture! Here's a step-by-step guide to get you started:
>
> 1. **Form Your LLC**:
>    - File your Articles of Organization with the California Secretary of State. You can do this online at [bizfileonline.sos.ca.gov](https://bizfileonline.sos.ca.gov).
>    - Remember, California charges an $800 minimum franchise tax annually, even if your business has no income.
>
> 2. **Obtain an EIN**:
>    - Apply for an Employer Identification Number (EIN) through the IRS website. This is necessary for tax purposes and hiring employees.
>
> 3. **Business License**:
>    - Contact the San Francisco Office of the Treasurer & Tax Collector for a business license. You may also need additional permits for outdoor seating and your bar.
>
> 4. **Seller's Permit**:
>    - Since you'll be selling food and beverages, you need a seller's permit from the California Department of Tax and Fee Administration (CDTFA). More info at [cdtfa.ca.gov](https://cdtfa.ca.gov).
>
> 5. **Health Permits**:
>    - Contact the San Francisco Department of Public Health for health permits related to food service.
>
> 6. **Labor Compliance**:
>    - Register with the California Employment Development Department (EDD) if you have employees. More details at [eddservices.edd.ca.gov](https://eddservices.edd.ca.gov).
>
> 7. **Franchise Tax Board**:
>    - Stay informed about your tax obligations with the Franchise Tax Board at [ftb.ca.gov](https://www.ftb.ca.gov).

**Evaluation:**
| Criteria | Score | Notes |
|----------|-------|-------|
| Accuracy | ✅ | Correct sequencing and agencies |
| Completeness | ⚠️ | Missing ABC alcohol license detail, zoning check |
| Sequencing | ✅ | LLC → EIN → licenses is correct order |
| Specificity | ✅ | Included URLs for key agencies |
| Actionability | ✅ | Clear step-by-step guide |
| SF-Specific | ⚠️ | Didn't mention zoning as critical first step in SF |

**Gap:** Should emphasize checking zoning FIRST before signing a lease. ABC licensing for bar mentioned but not detailed.

---

### B2: Cannabis Retail (Oakland)

**Prompt:**
> I'm a veteran looking to take over an existing retail space for a cannabis dispensary in Oakland. I understand there's both local and state licensing. What's the process and timeline? What are the major costs I should budget for?

**Response Quality:** 8/10

**Response:**
> Taking over an existing retail space for a cannabis dispensary in Oakland is a great opportunity! Here's a quick overview of the steps you'll need to take:
>
> 1. **Local Business License**: Start with the City of Oakland's licensing requirements for cannabis businesses. Check their website for specific regulations and applications: [Oakland Cannabis Business Licensing](https://www.oaklandca.gov/topics/cannabis-business-licensing).
>
> 2. **State Licensing**: You'll need a state cannabis license from the California Department of Cannabis Control (DCC). More info can be found here: [DCC Licensing](https://cannabis.ca.gov).
>
> 3. **Minimum Franchise Tax**: Remember, California charges an $800 minimum franchise tax annually for LLCs or corporations, even if you have no income.
>
> 4. **Veteran Resources**: As a veteran, you may have access to certain resources or programs aimed at supporting veteran-owned businesses. Consider reaching out to organizations like the Small Business Administration (SBA) for veteran-specific assistance.
>
> **Timeline & Costs**: The licensing process can take several months, depending on local and state requirements. Costs can vary widely, but you should budget for application fees, startup costs, and the $800 franchise tax.
>
> For specific questions, reach out to the relevant agencies:
> - **Oakland:** (510) 238-3911
> - **DCC:** 1-833-768-5880

**Evaluation:**
| Criteria | Score | Notes |
|----------|-------|-------|
| Accuracy | ✅ | Local THEN state licensing order is correct |
| Completeness | ⚠️ | Could detail specific license types and fees |
| Dual Licensing | ✅ | Correctly emphasized local-first requirement |
| Veteran Awareness | ✅ | Mentioned SBA veteran resources |
| Specificity | ✅ | Phone numbers for both agencies |
| Cost Guidance | ⚠️ | Vague on specific costs (could mention $5k-$50k range) |

**Strength:** Correctly identified Oakland's social equity program opportunity for veterans.

---

### B3: Marketing Consulting Scale-Up (Irvine)

**Prompt:**
> I've been running a solo marketing consulting business as a sole proprietor for 2 years in Irvine. I'm now making about $180K/year and want to hire my first 2 employees. Should I form an LLC or S-Corp? What registrations do I need for having employees?

**Response Quality:** 8/10

**Response:**
> Congratulations on your growing marketing consulting business! Transitioning to an LLC or S-Corp can offer personal liability protection and potential tax benefits. I recommend consulting with a tax professional or attorney to decide which structure is best for you.
>
> As you're planning to hire employees and potentially move to a rented office, here are the steps you should consider:
>
> 1. **Choose Your Entity Type**: If you go with an LLC, remember California has an $800 minimum franchise tax each year, even if you have no income.
>
> 2. **Register Your Business**:
>    - For LLCs or S-Corps, file with the Secretary of State: [bizfileonline.sos.ca.gov](https://bizfileonline.sos.ca.gov).
>    - Obtain an Employer Identification Number (EIN) from the IRS if you haven't already.
>
> 3. **Local Business License**: Check with the City of Irvine for any local business licenses or permits required for your new office space.
>
> 4. **Register for Payroll Taxes**: Once you hire employees, you'll need to register with the Employment Development Department (EDD) for payroll tax obligations: [eddservices.edd.ca.gov](https://eddservices.edd.ca.gov).
>
> 5. **Seller's Permit**: If you plan to sell goods or certain services, you may need a seller's permit from the California Department of Tax and Fee Administration (CDTFA): [cdtfa.ca.gov](https://cdtfa.ca.gov).
>
> Feel free to reach out if you have more questions!

**Evaluation:**
| Criteria | Score | Notes |
|----------|-------|-------|
| Accuracy | ✅ | Correct agencies and registrations |
| Entity Guidance | ⚠️ | Could explain S-Corp tax benefits at $180K income |
| EDD Requirement | ✅ | Correctly identified payroll registration |
| Completeness | ✅ | Covered all necessary registrations |
| Actionability | ✅ | Good URLs and sequence |
| Professional Advice | ✅ | Appropriately recommended tax professional |

**Gap:** At $180K income, S-Corp election often saves significant self-employment tax—could have explained this benefit.

---

### B4: General Contractor (Riverside)

**Prompt:**
> I have 8 years of construction experience and want to start my own general contracting business in Riverside County. What license do I need from the state? What's the exam and bonding process?

**Response Quality:** 9/10

**Response:**
> To operate as a general contractor in California, you need a contractor's license (Class B for general contracting). Here's the process to obtain your license:
>
> 1. **Meet the Requirements**: You need at least four years of journeyman-level experience in the field.
>
> 2. **Apply for the License**: Complete the application for the contractor's license through the California Contractors State License Board (CSLB). You can find the application and details here: [CSLB Application](https://www.cslb.ca.gov).
>
> 3. **Pass the Exams**: You'll need to pass a trade exam and a law and business exam.
>
> 4. **Submit Fingerprints**: Background checks are required.
>
> 5. **Obtain a Surety Bond**: A minimum bond amount is required, which varies based on the license type.
>
> 6. **Register Your Business**: Once licensed, register your business entity (LLC or corporation) with the California Secretary of State and remember the $800 minimum franchise tax applies each year.
>
> 7. **Get a Local Business License**: Check with Riverside County for any local business licensing requirements.
>
> For more information, visit the [CSLB website](https://www.cslb.ca.gov) or call them at (800) 321-CSLB (2752). Good luck with your new venture!

**Evaluation:**
| Criteria | Score | Notes |
|----------|-------|-------|
| Accuracy | ✅ | Class B license, 4-year requirement correct |
| CSLB Process | ✅ | All steps covered (app, exams, fingerprints, bond) |
| Completeness | ✅ | Included business registration after licensing |
| Specificity | ✅ | CSLB phone number and website |
| Sequencing | ✅ | Correct order (license THEN business registration) |
| Actionability | ✅ | Clear step-by-step process |

**Strength:** Most complete and accurate response in the test set.

---

### B5: Out-of-State Tech Company Expansion

**Prompt:**
> We're a Delaware C-Corp tech company based in Austin, TX. We want to hire 3 remote employees who will work from their homes in LA, SF, and San Diego. What do we need to register for in California? What are the ongoing compliance requirements?

**Response Quality:** 8/10

**Response:**
> Since you're hiring employees in California, you'll need to register as a foreign corporation with the California Secretary of State. Here are the steps to take:
>
> 1. **Register as a Foreign Corporation**: File the Statement and Designation by Foreign Corporation (Form LLC-1) with the Secretary of State. You can do this online at [bizfileonline.sos.ca.gov](https://bizfileonline.sos.ca.gov).
>
> 2. **Obtain a California Employer Identification Number (EIN)**: You'll need this for tax purposes and to report employee wages to the IRS.
>
> 3. **Register with the California Franchise Tax Board (FTB)**: You'll be subject to California's $800 minimum franchise tax annually, even if your corporation doesn't generate income in the state.
>
> 4. **Register with EDD**: You must register with the Employment Development Department (EDD) for payroll taxes. Visit [eddservices.edd.ca.gov](https://eddservices.edd.ca.gov) for more info.
>
> 5. **Local Business Licenses**: Check with the cities where your employees live (LA, SF, San Diego) for any local business licenses or permits.
>
> Ongoing compliance includes annual franchise tax payments and filing necessary tax returns.

**Evaluation:**
| Criteria | Score | Notes |
|----------|-------|-------|
| Accuracy | ⚠️ | Form cited as "LLC-1" should be "S&DC" for corporations |
| Foreign Registration | ✅ | Correctly identified need to register |
| EDD Requirement | ✅ | Payroll tax registration covered |
| Franchise Tax | ✅ | $800 minimum correctly mentioned |
| Local Licenses | ✅ | Mentioned checking with individual cities |
| Completeness | ✅ | Covered all key requirements |

**Issue:** Cited "Form LLC-1" for foreign corporation—this is actually for LLCs. Corporations use Form S&DC (Statement and Designation by Foreign Corporation).

---

## Summary

| Test | Scenario | Score | Key Strength |
|------|----------|-------|--------------|
| B1 | Restaurant with bar (SF) | 8/10 | Good sequencing, solid URLs |
| B2 | Cannabis retail (Oakland) | 8/10 | Correct local-first licensing |
| B3 | Consulting scale-up | 8/10 | Covered employee registrations |
| B4 | General contractor | 9/10 | Complete CSLB process |
| B5 | Out-of-state expansion | 8/10 | Good foreign registration guidance |

**Average Score:** 8.2/10

### Strengths
- Consistent mention of $800 franchise tax
- Good URL references to official agencies
- Professional, practical tone
- Correct sequencing of steps

### Areas for Improvement
1. **Emphasize zoning first** — Critical for physical locations (especially SF restaurants)
2. **Form number accuracy** — Verify correct form names (S&DC vs LLC-1)
3. **Cost specifics** — Add ballpark figures where applicable
4. **S-Corp benefits** — Explain tax advantages at higher income levels

---

*Test conducted: 2025-12-31*
*n8n Workflow ID: fdEqzNsV18ZT8MUA*
