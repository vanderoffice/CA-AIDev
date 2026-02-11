#!/usr/bin/env python3
"""
Apply URL fixes to the WaterBot URL registry based on validation results.
Fixes broken URLs (404), updates redirected URLs to final destinations,
and normalizes URL patterns.
"""

import json
from pathlib import Path

REGISTRY_PATH = Path(__file__).parent.parent / "rag-content" / "waterbot" / "url_registry.json"

# =============================================================================
# URL REPLACEMENT MAP
# Format: old_url -> new_url
# =============================================================================

REPLACEMENTS = {
    # --- waterboards.ca.gov broken URLs (404) ---
    "https://www.waterboards.ca.gov/water_issues/programs/agriculture/ag_waivers.html":
        "https://www.waterboards.ca.gov/water_issues/programs/agriculture/",
    "https://www.waterboards.ca.gov/water_issues/programs/grants_loans/graywater/":
        "https://www.waterboards.ca.gov/drinking_water/certlic/drinkingwater/onsite_nonpotable_reuse_regulations.html",
    "https://www.waterboards.ca.gov/water_issues/programs/conservation/rainwater/":
        "https://www.waterboards.ca.gov/waterrights/board_info/faqs.html",
    "https://www.waterboards.ca.gov/water_issues/programs/recycledwater/graywater.html":
        "https://www.waterboards.ca.gov/drinking_water/certlic/drinkingwater/onsite_nonpotable_reuse_regulations.html",
    "https://www.waterboards.ca.gov/water_issues/programs/swamp/cwt/":
        "https://www.waterboards.ca.gov/water_issues/programs/swamp/clean_water_team/",
    "https://www.waterboards.ca.gov/environmental_justice/":
        "https://www.waterboards.ca.gov/water_issues/programs/outreach/education/justice.html",
    "https://www.waterboards.ca.gov/resources/complaints/":
        "https://www.waterboards.ca.gov/about_us/contact_us/",
    "https://www.waterboards.ca.gov/drinking_water/certlic/drinkingwater/humanrighttowater.html":
        "https://www.waterboards.ca.gov/water_issues/programs/hr2w/",
    "https://www.waterboards.ca.gov/resources/contacts/":
        "https://www.waterboards.ca.gov/about_us/contact_us/",
    "https://www.waterboards.ca.gov/drinking_water/certlic/drinkingwater/privatewells.html":
        "https://www.waterboards.ca.gov/gama/well_owners.html",
    "https://www.waterboards.ca.gov/water_issues/programs/grants_loans/swgp/storm_water_resource_plans.html":
        "https://www.waterboards.ca.gov/water_issues/programs/grants_loans/swgp/",
    "https://www.waterboards.ca.gov/drinking_water/certlic/drinkingwater/waterworksstandards.html":
        "https://www.waterboards.ca.gov/drinking_water/certlic/drinkingwater/Lawbook.html",
    "https://www.waterboards.ca.gov/water_issues/programs/conservation/":
        "https://www.waterboards.ca.gov/conservation/",
    "https://www.waterboards.ca.gov/water_issues/programs/recycledwater/":
        "https://www.waterboards.ca.gov/water_issues/programs/recycled_water/",
    "https://www.waterboards.ca.gov/water_issues/programs/quagga_zebra_mussel/":
        "https://www.waterboards.ca.gov/water_issues/programs/swamp/ais/",
    "https://www.waterboards.ca.gov/drinking_water/certlic/drinkingwater/smallwatersystems.html":
        "https://www.waterboards.ca.gov/drinking_water/certlic/drinkingwater/publicwatersystems.html",
    "https://www.waterboards.ca.gov/drinking_water/certlic/drinkingwater/recycledwater/title22.html":
        "https://www.waterboards.ca.gov/drinking_water/certlic/drinkingwater/water-recycling-criteria.html",
    "https://www.waterboards.ca.gov/water_issues/programs/cwa401/docs/procedures_conformed.pdf":
        "https://www.waterboards.ca.gov/water_issues/programs/cwa401/docs/2021/procedures.pdf",
    "https://www.waterboards.ca.gov/water_issues/programs/scp/about.html":
        "https://www.waterboards.ca.gov/water_issues/programs/site_cleanup_program/",
    "https://www.waterboards.ca.gov/water_issues/programs/conservation/assistance/":
        "https://www.waterboards.ca.gov/conservation/assistance/",
    "https://www.waterboards.ca.gov/water_issues/programs/conservation/water_shutoffs/":
        "https://www.waterboards.ca.gov/drinking_water/certlic/drinkingwater/shutoff-protection.html",

    # --- water.ca.gov (DWR) redirect-to-404 URLs ---
    "https://water.ca.gov/Programs/All-Programs/Desalination":
        "https://water.ca.gov/Work-With-Us/Grants-And-Loans/desalination-Grant-Program",
    "https://water.ca.gov/Programs/Integrated-Regional-Water-Management/Stormwater":
        "https://water.ca.gov/programs/integrated-regional-water-management",
    "https://water.ca.gov/Programs/All-Programs/Water-Storage":
        "https://water.ca.gov/What-We-Do/Water-Storage-And-Supply",
    "https://water.ca.gov/Programs/Groundwater-Management/Groundwater-Sustainability-Agencies":
        "https://water.ca.gov/Programs/Groundwater-Management/SGMA-Groundwater-Management/Groundwater-Sustainable-Agencies",

    # --- EPA broken URLs (404) ---
    "https://www.epa.gov/environmentaljustice":
        "https://www.epa.gov/aboutepa/about-office-environmental-justice-and-external-civil-rights",
    "https://www.epa.gov/enviro/sdwis-search":
        "https://enviro.epa.gov/facts/sdwis/search.html",
    "https://www.epa.gov/ground-water-and-drinking-water/drinking-water-treatment-technology":
        "https://www.epa.gov/sdwa/overview-drinking-water-treatment-technologies",
    "https://www.epa.gov/ground-water-and-drinking-water/public-notification-rule":
        "https://www.epa.gov/dwreginfo/public-notification-rule",
    "https://www.epa.gov/watersense/outdoor-water-use":
        "https://www.epa.gov/watersense/outdoors",
    "https://www.epa.gov/grants/water-grants-and-funding":
        "https://www.epa.gov/ground-water-and-drinking-water/drinking-water-grants",
    "https://www.epa.gov/tribal-drinking-water":
        "https://www.epa.gov/tribaldrinkingwater",
    "https://www.epa.gov/invasive-species":
        "https://www.epa.gov/vessels-marinas-and-ports/aquatic-nuisance-species-ans",
    "https://www.epa.gov/waterdata/water-quality-analysis":
        "https://www.epa.gov/waterdata",
    "https://www.epa.gov/ground-water-and-drinking-water/household-drinking-water-frequently-asked-questions":
        "https://www.epa.gov/ground-water-and-drinking-water",

    # --- Other broken URLs (404) ---
    "https://oag.ca.gov/government/public-records":
        "https://oag.ca.gov/consumers/general/pra",
    "https://www.cdc.gov/drinking-water/about/water-disinfection.html":
        "https://www.cdc.gov/drinking-water/about/about-water-disinfection-with-chlorine-and-chloramine.html",
    "https://www.cdc.gov/drinking-water/about/making-water-safe.html":
        "https://www.cdc.gov/water-emergency/about/index.html",
    "https://www.cdph.ca.gov/Programs/CEH/DRSEM/Pages/EMB/RecHealth/":
        "https://www.cdph.ca.gov/Programs/CEH/DRSEM/Pages/EMB/RecreationalHealth/California-Swimming-Pool-Requirements.aspx",
    "https://www.cdph.ca.gov/Programs/CEH/DRSEM/Pages/EMB/RecHealth/Pool-Safety.aspx":
        "https://www.cdph.ca.gov/Programs/CEH/DRSEM/Pages/EMB/RecreationalHealth/California-Swimming-Pool-Requirements.aspx",
    "https://www.fda.gov/food/resources-you-food/bottled-water-everywhere-keeping-it-safe":
        "https://www.fda.gov/consumers/consumer-updates/bottled-water-everywhere-keeping-it-safe",
    "https://www.bia.gov/service/water-rights":
        "https://www.bia.gov/service/water-rights-negotiation-and-litigation-program",
    "https://www.fisheries.noaa.gov/west-coast/habitat-conservation/fish-passage-engineering":
        "https://www.fisheries.noaa.gov/west-coast/habitat-conservation/west-coast-fish-passage-guidelines",
    "https://www.nsf.org/consumer-resources/articles/water-filters-testing-standards":
        "https://www.nsf.org/consumer-resources/articles/standards-water-treatment-systems",

    # --- Redirected URLs (update to final destination) ---
    "https://www.epa.gov/dwstandardsregulations":
        "https://www.epa.gov/dwreginfo/drinking-water-regulations",
    "https://opr.ca.gov/planning/general-plan/":
        "https://lci.ca.gov/planning/general-plan/",
    "https://www.epa.gov/ground-water-and-drinking-water/safe-drinking-water-hotline":
        "https://www.epa.gov/ground-water-and-drinking-water/safe-drinking-water-information",
    "https://www.waterboards.ca.gov/water_issues/programs/groundwater/sb4/oil_field_produced/produced_water_ponds/index.html":
        "https://www.waterboards.ca.gov/oil-gas/oil_field_produced/produced_water_ponds/index.html",
    "https://www.usgs.gov/special-topics/water-science-school/science/hardness-water":
        "https://www.usgs.gov/water-science-school/science/hardness-water",
    "https://www.waterboards.ca.gov/waterrights/water_issues/programs/ewrims/":
        "https://www.waterboards.ca.gov/upward/calwatrs/",
    "https://www.epa.gov/npdes/":
        "https://www.epa.gov/npdes",
    "https://www.fema.gov/emergency-managers/risk-management/dam-safety":
        "https://www.fema.gov/grants/mitigation/learn/dam-safety",
    "https://www.rcac.org/environmental/drinking-water/":
        "https://www.rcac.org/events/drinking-water-compliance/",
    "https://healthebay.org/beach-report-card/":
        "https://healthebay.org/beach-report-card-2018/",
}


def main():
    with open(REGISTRY_PATH) as f:
        registry = json.load(f)

    entries = registry["entries"]
    total_replaced = 0
    affected_topics = set()

    for entry in entries:
        for url_obj in entry.get("urls", []):
            old_url = url_obj["url"]
            if old_url in REPLACEMENTS:
                new_url = REPLACEMENTS[old_url]
                url_obj["url"] = new_url
                url_obj["stable"] = False  # Mark as recently changed
                total_replaced += 1
                affected_topics.add(entry["topic"])
                print(f"  [{entry['topic']}] {old_url}")
                print(f"    → {new_url}")

    print(f"\nTotal URLs replaced: {total_replaced}")
    print(f"Topics affected: {len(affected_topics)}")

    # Deduplicate URLs within each topic
    dedup_count = 0
    for entry in entries:
        urls = entry.get("urls", [])
        seen = set()
        unique = []
        for u in urls:
            if u["url"] not in seen:
                seen.add(u["url"])
                unique.append(u)
            else:
                dedup_count += 1
                print(f"  Removed duplicate in '{entry['topic']}': {u['url']}")
        entry["urls"] = unique

    if dedup_count:
        print(f"\nDuplicates removed: {dedup_count}")

    # Verify URL counts per topic (2-5 range)
    out_of_range = []
    for entry in entries:
        n = len(entry.get("urls", []))
        if n < 2 or n > 5:
            out_of_range.append((entry["topic"], n))

    if out_of_range:
        print(f"\nTopics with URL count out of range (2-5):")
        for topic, n in out_of_range:
            print(f"  {topic}: {n} URLs")

    # Update stats
    total_urls = sum(len(e.get("urls", [])) for e in entries)
    registry["stats"]["total_urls"] = total_urls
    registry["stats"]["total_topics"] = len(entries)

    # Write updated registry
    with open(REGISTRY_PATH, "w") as f:
        json.dump(registry, f, indent=2)

    print(f"\nRegistry updated: {len(entries)} topics, {total_urls} URLs")
    return total_replaced


if __name__ == "__main__":
    main()
