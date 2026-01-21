#!/usr/bin/env python3
"""
Fix broken URLs in WaterBot knowledge base.
Based on URL validation run on 2026-01-20.
"""

import re
import os
from pathlib import Path

KNOWLEDGE_DIR = Path(__file__).parent.parent / 'waterbot' / 'knowledge'

# URL fix mappings: (pattern_to_find, replacement)
# Using regex patterns where needed
URL_FIXES = [
    # DWR SGMA URLs - ca.gov should be water.ca.gov
    (r'https?://ca\.gov/programs/groundwater-management', 'https://water.ca.gov/Programs/Groundwater-Management'),
    (r'https?://ca\.gov/Programs/Groundwater-Management', 'https://water.ca.gov/Programs/Groundwater-Management'),
    (r'https?://ca\.gov/Programs/State-Water-Project', 'https://water.ca.gov/Programs/State-Water-Project'),

    # CIWQS public reports - old JSP URL is gone
    (r'https?://ciwqs\.waterboards\.ca\.gov/ciwqs/publicReports\.jsp',
     'https://www.waterboards.ca.gov/water_issues/programs/ciwqs/publicreports.html'),

    # GAMA groundwater map - simplified URL
    (r'https?://waterboards\.ca\.gov/gama/gamamap/public', 'https://www.waterboards.ca.gov/gama/'),

    # Drinking Water Watch (PDWW) - different subdomain
    (r'https?://waterboards\.ca\.gov/PDWW', 'https://sdwis.waterboards.ca.gov/PDWW/'),

    # SWAMP data and related URLs
    (r'https?://waterboards\.ca\.gov/swamp-data',
     'https://www.waterboards.ca.gov/water_issues/programs/swamp/'),
    (r'https?://waterboards\.ca\.gov/swamp/bioassessment',
     'https://www.waterboards.ca.gov/water_issues/programs/swamp/bioassessment/'),
    (r'https?://waterboards\.ca\.gov/swamp/clean_water_team',
     'https://www.waterboards.ca.gov/water_issues/programs/swamp/cwt_volunteer.html'),
    (r'https?://waterboards\.ca\.gov/swamp/cwt/guidance',
     'https://www.waterboards.ca.gov/water_issues/programs/swamp/cwt_volunteer.html'),

    # Water quality assessment
    (r'https?://waterboards\.ca\.gov/water_quality_assessment',
     'https://www.waterboards.ca.gov/water_issues/programs/water_quality_assessment/'),

    # Advanced Query Tool - needs full path
    (r'https?://waterboards\.ca\.gov/AdvancedQueryTool',
     'https://www.waterboards.ca.gov/water_issues/programs/ciwqs/publicreports.html'),

    # CEQA - ca.gov to resources.ca.gov
    (r'https?://ca\.gov/ceqa', 'https://resources.ca.gov/ceqa'),

    # CA.gov water group/headquarters - likely meant data.ca.gov
    (r'https?://ca\.gov/group/water', 'https://data.ca.gov/group/water'),
    (r'https?://ca\.gov/headquarters-sacramento/location',
     'https://www.waterboards.ca.gov/about_us/water_board_locations/'),
]

# URLs to flag as examples/placeholders (should have context indicating they're examples)
PLACEHOLDER_PATTERNS = [
    r'\[RESOURCE_ID\]',
    r'\[RESOURCE_ID\)',  # Missing bracket
]


def fix_urls_in_file(filepath: Path) -> tuple[int, list[str]]:
    """Fix URLs in a single file. Returns (changes_made, list of changes)."""
    try:
        content = filepath.read_text(encoding='utf-8')
    except Exception as e:
        return 0, [f"Error reading {filepath}: {e}"]

    original = content
    changes = []

    # Apply each fix
    for pattern, replacement in URL_FIXES:
        matches = list(re.finditer(pattern, content, re.IGNORECASE))
        if matches:
            content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
            for match in matches:
                changes.append(f"  Fixed: {match.group()[:60]}... → {replacement[:60]}...")

    # Write if changed
    if content != original:
        filepath.write_text(content, encoding='utf-8')
        return len(changes), changes

    return 0, []


def main():
    print("=" * 70)
    print("WaterBot URL Fix Script")
    print("=" * 70)

    if not KNOWLEDGE_DIR.exists():
        print(f"Error: Knowledge directory not found: {KNOWLEDGE_DIR}")
        return 1

    # Find all markdown files
    md_files = list(KNOWLEDGE_DIR.rglob('*.md'))
    print(f"Found {len(md_files)} markdown files\n")

    total_fixes = 0
    files_fixed = 0

    for filepath in sorted(md_files):
        num_fixes, changes = fix_urls_in_file(filepath)
        if num_fixes > 0:
            rel_path = filepath.relative_to(KNOWLEDGE_DIR)
            print(f"✓ {rel_path} ({num_fixes} fixes)")
            for change in changes:
                print(change)
            print()
            total_fixes += num_fixes
            files_fixed += 1

    print("=" * 70)
    print(f"SUMMARY: {total_fixes} URLs fixed across {files_fixed} files")
    print("=" * 70)

    if total_fixes > 0:
        print("\nNext steps:")
        print("1. Run chunk-knowledge.js to regenerate chunks.json")
        print("2. Run embed-chunks.py to re-embed into database")
        print("3. Re-run validate-all-urls.py to verify fixes")

    return 0


if __name__ == '__main__':
    exit(main())
