/**
 * matchFundingPrograms.js
 *
 * Pure, deterministic matching algorithm that scores user answers against
 * the funding program catalog and returns ranked results by eligibility tier.
 *
 * No ML, no fuzzy matching — just filter + sort.
 */

const POPULATION_MAP = {
  'under-500': 250,
  '500-3300': 1900,
  '3300-10000': 6500,
  '10000-50000': 30000,
  'over-50000': 75000
}

const FUNDING_TYPE_PRIORITY = {
  'grant': 0,
  'technical-assistance': 1,
  'mixed': 2,
  'loan-and-grant': 3,
  'loan': 4
}

/**
 * Match user answers against funding programs and return tiered results.
 *
 * @param {Object} answers - User questionnaire answers
 * @param {string} answers.entityType - 'public-agency' | 'tribe' | 'nonprofit' | 'private-utility' | 'mutual-water-company'
 * @param {string[]} answers.projectTypes - Array of project type values
 * @param {string} answers.populationServed - Population range key
 * @param {string} answers.dacStatus - 'dac' | 'sdac' | 'no' | 'unsure'
 * @param {string} answers.matchFunds - 'yes' | 'limited' | 'no'
 * @param {Object[]} programs - Array of funding program objects
 * @returns {{ eligible: Object[], likelyEligible: Object[], mayQualify: Object[] }}
 */
export default function matchFundingPrograms(answers, programs) {
  const populationMidpoint = POPULATION_MAP[answers.populationServed] ?? 0
  const userIsDac = answers.dacStatus === 'dac' || answers.dacStatus === 'sdac'

  const eligible = []
  const likelyEligible = []
  const mayQualify = []

  for (const program of programs) {
    const elig = program.eligibility
    const matchReasons = []
    const barriers = []
    let tier = 'eligible'

    // --- Hard filters (skip entirely if failed) ---

    // 1. Entity type check
    if (!elig.entityTypes.includes(answers.entityType)) continue

    // 2. Project type overlap
    const overlapping = elig.projectTypes.filter(pt => answers.projectTypes.includes(pt))
    if (overlapping.length === 0) continue

    // 3. Population check
    if (elig.populationMax != null && populationMidpoint > elig.populationMax) continue

    // 4. DAC check (hard filter only for dacRequired === true AND user said 'no')
    if (elig.dacRequired === true && answers.dacStatus === 'no') continue

    // --- Soft checks (affect tier assignment) ---

    // DAC tier adjustments
    if (elig.dacRequired === true && answers.dacStatus === 'unsure') {
      tier = 'likely-eligible'
      barriers.push('Requires Disadvantaged Community (DAC) designation — verify your status')
    }

    if (elig.dacRequired === 'preferred') {
      if (userIsDac) {
        matchReasons.push('DAC preference applies — may receive priority or better terms')
      }
      // Non-DAC users are still eligible, just without preference — stays at current tier
    }

    // Match funds tier adjustments
    if (elig.matchRequired) {
      const pct = elig.matchPercentage
      const matchLabel = pct ? `${pct}% matching funds` : 'matching funds'
      if (answers.matchFunds === 'no') {
        tier = 'may-qualify'
        barriers.push(`Requires ${matchLabel}`)
      } else if (answers.matchFunds === 'limited') {
        if (tier === 'eligible') tier = 'likely-eligible'
        barriers.push(`Requires ${matchLabel} — limited ability noted`)
      }
    }

    // Weak project type fit
    if (overlapping.length === 1 && answers.projectTypes.length > 1) {
      if (tier === 'eligible') tier = 'likely-eligible'
    }

    // Additional criteria flag
    if (elig.additionalCriteria && elig.additionalCriteria.length > 0) {
      if (tier === 'eligible' && elig.additionalCriteria.length >= 3) {
        // Many additional criteria suggests further qualification needed
        tier = 'likely-eligible'
      }
    }

    // Build match reasons
    matchReasons.unshift(`Matches: ${overlapping.join(', ')}`)
    if (overlapping.length === elig.projectTypes.length) {
      matchReasons.push('Full project type alignment')
    }

    // Score for sorting within tiers
    const overlapScore = overlapping.length * 10
    const fundingPriority = FUNDING_TYPE_PRIORITY[program.fundingType] ?? 5
    const matchScore = overlapScore - fundingPriority

    const result = {
      ...program,
      tier,
      matchScore,
      matchReasons,
      barriers
    }

    if (tier === 'eligible') eligible.push(result)
    else if (tier === 'likely-eligible') likelyEligible.push(result)
    else mayQualify.push(result)
  }

  // Sort within tiers: higher matchScore first, then alphabetical
  const sortByScore = (a, b) =>
    b.matchScore - a.matchScore || a.name.localeCompare(b.name)

  eligible.sort(sortByScore)
  likelyEligible.sort(sortByScore)
  mayQualify.sort(sortByScore)

  return { eligible, likelyEligible, mayQualify }
}
