# Visual Decision Trees

**Purpose:** Quick visual guides to help families navigate California childcare options based on their situation.

---

## How to Use These Decision Trees

1. Start at the top of the relevant tree
2. Follow the path based on your answers
3. Arrive at recommended programs/actions
4. Click through to detailed guides for next steps

---

## Decision Tree 1: Which Subsidy Program?

This tree helps determine which childcare subsidy programs you may qualify for.

```mermaid
flowchart TD
    A[Start: Do You Need Childcare Subsidies?] --> B{Receiving CalWORKs<br/>Cash Aid?}

    B -->|Yes| C[CalWORKs Stage 1<br/>Apply through your<br/>county welfare office]
    B -->|No| D{Income under<br/>85% SMI?}

    D -->|No| E[Not eligible for<br/>state subsidies<br/>Check employer benefits<br/>& tax credits]
    D -->|Yes| F{Child's Age?}

    F -->|0-3| G{Income under<br/>100% FPL?}
    F -->|3-5| H{Income under<br/>100% FPL?}
    F -->|6-12| I[APP Vouchers<br/>Apply to local APP]

    G -->|Yes| J[Early Head Start + APP<br/>Apply to both]
    G -->|No| K[APP Vouchers<br/>Apply to local APP]

    H -->|Yes| L[Head Start + CSPP + APP<br/>Apply to all three]
    H -->|No| M{Income under<br/>100% SMI?}

    M -->|Yes| N[CSPP + APP<br/>Apply to both]
    M -->|No| O[APP Vouchers<br/>Apply to local APP]

    click C "../01_Subsidies/CalWORKs/CalWORKs_Overview.md"
    click E "../03_Costs_and_Affordability/Employer_Benefits.md"
    click I "../01_Subsidies/Alternative_Payment_Programs/APP_Overview.md"
    click J "../01_Subsidies/Head_Start/Early_Head_Start_Overview.md"
    click K "../01_Subsidies/Alternative_Payment_Programs/APP_Overview.md"
    click L "../01_Subsidies/Head_Start/Head_Start_Overview.md"
    click N "../01_Subsidies/CSPP/CSPP_Overview.md"
    click O "../01_Subsidies/Alternative_Payment_Programs/APP_Overview.md"
```

---

## Decision Tree 2: Priority Population Status

This tree helps identify if you qualify for priority placement.

```mermaid
flowchart TD
    A[Start: Check Priority Status] --> B{Child in<br/>foster care?}

    B -->|Yes| C[Priority 1<br/>Immediate eligibility<br/>Contact county welfare]
    B -->|No| D{Child has<br/>active CPS case?}

    D -->|Yes| E[Priority 1<br/>Immediate eligibility<br/>Contact CPS worker]
    D -->|No| F{Family<br/>homeless?}

    F -->|Yes| G[Priority 1<br/>Immediate eligibility<br/>Call 211 for help]
    F -->|No| H{Receiving<br/>CalWORKs?}

    H -->|Yes| I[Priority 2<br/>High priority<br/>Apply through county]
    H -->|No| J{Child has<br/>disability?}

    J -->|Yes| K[Priority 2<br/>Contact Regional Center<br/>+ apply for subsidies]
    J -->|No| L{Military<br/>family?}

    L -->|Yes| M[Check MCCYN +<br/>standard priority<br/>Military-specific benefits]
    L -->|No| N[Standard Priority<br/>Income-based placement<br/>Apply to CEL]

    click C "../09_User_Journeys/Journey_Crisis_Situation.md"
    click E "../09_User_Journeys/Journey_Crisis_Situation.md"
    click G "../09_User_Journeys/Journey_Crisis_Situation.md"
    click I "../01_Subsidies/CalWORKs/CalWORKs_Overview.md"
    click K "../09_User_Journeys/Journey_Special_Needs_Child.md"
    click M "../05_Special_Situations/Military_Families.md"
```

---

## Decision Tree 3: Provider Type Selection

This tree helps choose the right type of childcare provider.

```mermaid
flowchart TD
    A[Start: What Provider Type?] --> B{Child's Age?}

    B -->|0-2 Infant/Toddler| C{Schedule Needs?}
    B -->|3-5 Preschool| D{Educational Focus<br/>Important?}
    B -->|6-12 School-Age| E{During School<br/>or After?}

    C -->|Standard Hours| F{Group or<br/>Home Setting?}
    C -->|Non-Traditional| G[Family Childcare or FFN<br/>Most flexible hours]

    F -->|Group| H[Licensed Center<br/>with infant program]
    F -->|Home| I[Licensed Family<br/>Childcare Home]

    D -->|Yes| J{Budget?}
    D -->|No| K[Licensed Center<br/>or Family Childcare]

    J -->|Subsidized/Free| L[Head Start or CSPP<br/>Apply for slots]
    J -->|Can Pay| M[Licensed Center<br/>Check quality ratings]

    E -->|Before/After School| N[ASES or Licensed<br/>School-Age Program]
    E -->|Full Day<br/>Breaks/Summer| O[Day Camp or<br/>Full-Day Program]

    click G "../02_Provider_Search/Provider_Types.md"
    click H "../02_Provider_Search/Provider_Types.md"
    click I "../02_Provider_Search/Provider_Types.md"
    click K "../02_Provider_Search/Provider_Types.md"
    click L "../01_Subsidies/Head_Start/Head_Start_Overview.md"
    click M "../02_Provider_Search/Provider_Types.md"
    click N "../02_Provider_Search/School_Age_Programs.md"
    click O "../02_Provider_Search/School_Age_Programs.md"
```

---

## Decision Tree 4: CalWORKs Stage Transitions

This tree helps understand movement through CalWORKs childcare stages.

```mermaid
flowchart TD
    A[Start: CalWORKs Childcare] --> B{Currently receiving<br/>cash aid?}

    B -->|Yes| C[Stage 1<br/>County manages<br/>No family fee]
    B -->|No| D{Previously on<br/>CalWORKs?}

    C --> E{Leaving<br/>cash aid?}

    E -->|Yes| F[Auto-transfer to Stage 2<br/>APP takes over]
    E -->|No| G[Stay in Stage 1<br/>Continue with county]

    D -->|Yes| H{How long since<br/>leaving cash aid?}
    D -->|No| I[Not CalWORKs pathway<br/>Apply to APP directly]

    H -->|Under 24 months| J[Stage 2<br/>Through APP<br/>Family fee applies]
    H -->|Over 24 months| K{Still income<br/>eligible?}

    K -->|Yes| L[Stage 3<br/>Long-term through APP<br/>Until child turns 13]
    K -->|No| M[Explore other options<br/>CSPP, Head Start, Private]

    J --> N{24 months<br/>passed?}

    N -->|Yes| O{Still income<br/>eligible?}
    N -->|No| P[Continue Stage 2]

    O -->|Yes| Q[Transfer to Stage 3]
    O -->|No| R[Subsidy ends<br/>Check other programs]

    click C "../01_Subsidies/CalWORKs/CalWORKs_Overview.md"
    click F "../09_User_Journeys/Journey_CalWORKs_Transition.md"
    click I "../01_Subsidies/Alternative_Payment_Programs/APP_Overview.md"
    click J "../09_User_Journeys/Journey_CalWORKs_Transition.md"
    click L "../09_User_Journeys/Journey_CalWORKs_Transition.md"
```

---

## Decision Tree 5: Special Needs Navigation

This tree helps families with children who have disabilities or delays.

```mermaid
flowchart TD
    A[Start: Child Has<br/>Special Needs] --> B{Child's Age?}

    B -->|0-3| C[Contact Regional Center<br/>for Early Start assessment]
    B -->|3+| D[Contact Regional Center<br/>AND school district]

    C --> E{Eligible for<br/>Early Start?}

    E -->|Yes| F[Get IFSP developed<br/>Services + childcare coordination]
    E -->|No| G{At risk or<br/>suspected delay?}

    G -->|Yes| H[Monitoring plan<br/>Re-evaluate as needed]
    G -->|No| I[Standard childcare<br/>pathways]

    D --> J{Eligible for<br/>Regional Center?}

    J -->|Yes| K[Get IPP developed<br/>May include childcare funding]
    J -->|No| L{Eligible for<br/>school IEP?}

    L -->|Yes| M[IEP services<br/>+ childcare separately]
    L -->|No| N[Standard childcare<br/>with accommodations]

    F --> O[Head Start 10% slots<br/>+ subsidized care options]
    K --> O
    M --> O

    click C "../09_User_Journeys/Journey_Special_Needs_Child.md"
    click D "../09_User_Journeys/Journey_Special_Needs_Child.md"
    click F "../09_User_Journeys/Journey_Special_Needs_Child.md"
    click K "../09_User_Journeys/Journey_Special_Needs_Child.md"
    click O "../01_Subsidies/Head_Start/Head_Start_Eligibility.md"
```

---

## Decision Tree 6: Cost Reduction Strategies

This tree helps identify ways to reduce childcare costs.

```mermaid
flowchart TD
    A[Start: Reduce<br/>Childcare Costs] --> B{Employment<br/>Status?}

    B -->|Employed| C{Employer offers<br/>DCFSA?}
    B -->|Seeking Work| D[CalWORKs or APP<br/>Job search qualifies]
    B -->|Student/Training| E[Check program-based<br/>childcare support]

    C -->|Yes| F[Enroll in DCFSA<br/>Save ~30% in taxes]
    C -->|No| G{Employer has<br/>other benefits?}

    G -->|Yes| H[Check on-site care<br/>backup care, subsidies]
    G -->|No| I{Income under<br/>85% SMI?}

    F --> I
    H --> I

    I -->|Yes| J[Apply for subsidies<br/>APP, CSPP, Head Start]
    I -->|No| K{Can claim<br/>tax credit?}

    K -->|Yes| L[Child Care Tax Credit<br/>State + Federal]
    K -->|No| M[Consider FFN care<br/>or co-ops]

    J --> N{Multiple programs<br/>available?}

    N -->|Yes| O[Stack subsidies<br/>legally combine sources]
    N -->|No| P[Maximize single<br/>program benefits]

    click D "../01_Subsidies/CalWORKs/CalWORKs_Overview.md"
    click F "../03_Costs_and_Affordability/Employer_Benefits.md"
    click H "../03_Costs_and_Affordability/Employer_Benefits.md"
    click J "../01_Subsidies/Alternative_Payment_Programs/APP_Overview.md"
    click L "../03_Costs_and_Affordability/Tax_Credits.md"
    click O "../01_Subsidies/Subsidy_Stacking_Guide.md"
```

---

## Decision Tree 7: Emergency/Crisis Childcare

This tree helps families in urgent situations.

```mermaid
flowchart TD
    A[Start: Emergency<br/>Childcare Need] --> B{What type of<br/>crisis?}

    B -->|Homeless| C[Call 211<br/>Priority 1 status]
    B -->|Domestic Violence| D[Call DV hotline<br/>1-800-799-7233<br/>Priority 1 status]
    B -->|CPS Involvement| E[Contact CPS worker<br/>Priority 1 status]
    B -->|Provider Closed| F{Have backup care<br/>benefit?}
    B -->|Job Starting<br/>Immediately| G[Emergency childcare<br/>request to APP]

    C --> H[Apply for emergency<br/>childcare same day]
    D --> H
    E --> H

    F -->|Yes| I[Use employer<br/>backup care program]
    F -->|No| J[FFN care or<br/>drop-in center]

    G --> K{CalWORKs<br/>recipient?}

    K -->|Yes| L[Request Immediate Need<br/>through GAIN worker]
    K -->|No| M[Contact APP for<br/>expedited processing]

    H --> N[Gather documentation<br/>Shelter letter, court order, etc.]

    N --> O[Contact local APP<br/>or county welfare]

    click C "../09_User_Journeys/Journey_Crisis_Situation.md"
    click D "../09_User_Journeys/Journey_Crisis_Situation.md"
    click E "../09_User_Journeys/Journey_Crisis_Situation.md"
    click I "../03_Costs_and_Affordability/Employer_Benefits.md"
    click L "../01_Subsidies/CalWORKs/CalWORKs_Overview.md"
    click M "../01_Subsidies/Alternative_Payment_Programs/APP_Overview.md"
```

---

## Quick Reference: Which Tree to Use

| Your Situation | Start Here |
|----------------|------------|
| First time applying for subsidies | Tree 1: Which Subsidy Program |
| Wondering if you get priority | Tree 2: Priority Population Status |
| Choosing a provider type | Tree 3: Provider Type Selection |
| On CalWORKs, leaving cash aid | Tree 4: CalWORKs Stage Transitions |
| Child has disability or delay | Tree 5: Special Needs Navigation |
| Want to reduce costs | Tree 6: Cost Reduction Strategies |
| Urgent/emergency need | Tree 7: Emergency/Crisis Childcare |

---

## Notes on Using These Trees

1. **These are starting points** — always verify current eligibility requirements
2. **Multiple paths may apply** — you can often combine programs
3. **Timing matters** — apply early, especially during pregnancy
4. **Local variation** — your county may have additional programs
5. **Get help** — CCR&R agencies can walk you through options (free service)

---

*Related: [Planning Timeline](Planning_Timeline.md) | [User Journeys](../09_User_Journeys/) | [Common Mistakes FAQ](../04_Application_Processes/Common_Mistakes_FAQ.md)*

---

*Last updated: December 2025*
