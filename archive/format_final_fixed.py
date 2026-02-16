#!/usr/bin/env python3
"""
Final Heart Talk Formatter - ALL FIXES
Fixes:
1. #9 title shows "METABOLIC SYNDROME" not "#9"
2. Remove duplicate #12
3. Add #59 (Snow Shoveling) from numbers file
4. Renumber original #28 to #31
"""
import re

MAIN_FILE = "/Users/ravikiran/Apps/claude/hralth/Heart Talk.md"
NUMBERS_FILE = "/Users/ravikiran/Apps/claude/hralth/numbers"
OUTPUT_FILE = "/Users/ravikiran/Apps/claude/hralth/Heart Talk - Formatted.md"
REPORT_FILE = "/Users/ravikiran/Apps/claude/hralth/Heart Talk - Analysis Report.md"

# Heart Talk #2 provided by user
HT2_TITLE = "What is lipoprotein a and why is it Important for Southeast Asian people"
HT2_CONTENT = """Lipoprotein a, commonly called as L-P - little a or Lp(a) is often elevated in south east Asian people like Indians. It is often called  the evil twin of familiar low density lipoprotein or LDL.
Lp(a) Particles are similar to LDL particles, but an Apolipiprotein molecule wrapped around each one. LP little an accelerate the buildup of fatty plaques inside arteries and inflammation even more than LDL does. High LP a level may double or even triple the person risk of heart attack. It also increases the risk of stroke and linked tonarrowing of the aortic valve called aortic stenosis.
LPL is not picked up by standard cholesterol test. It has to be ordered separately. Many doctors have not commonly ordered this test because currently there aren't any FDA approved drugs to lower the elevated LP a. LP a levels are large genetically determined, eating and exercise habits have virtually no effect on the level of LP a

Europian in Canadian guidelines already recommend that everyone gets tested for LP a levell at least once in their lives. In the United States, that recommendations are more conservative with testing suggested for the following groups
1. People with premature cardiovascular disease, defined as people who have had a heart attack, stroke or peripheral artery disease or aortic stenosis before the age of 55 for men or before the age of 65 for women line.
2. People who have a father, mother, brother, or sister with premature cardiovascular disease.
3.People with very high LDL cholesterol level that is greater than 190.
\t4.\tClose relatives like siblings, children, and parents of anyone with elevated Lp a level
I would measure LP little level at least once in everyone, but definitely in South Asian people who have higher incidence of LP
a level. People with high Lp a labels often have close family members who suffered a heart attack or a stroke in their 50s or even earlier. Some of these people appear to be unlikely candidate for developing heart disease because they don't have any traditional risk factors, such as high LDL cholesterol, diabetes or high blood pressure.
But many others have one or more of these risk factors and high LP a add to their overall vulnerability to heart problems. High Lp a Is considered as risk enhancing factor that warrants more intensive LDL lowering in addition to paying close attention to a healthy lifestyle. Even though aspirin is not recommended routinely for primary prevention, inpatient with elevated LP little  more and more cardiologists are recommending low-dose aspirin with elevated Lp a levels. People with elevated Lp a level should consider consulting  a cardiologist for specific advice. They should also have Lp a testing  for their close family members.
Unfortunately presently available oral lipid loading drugs. Do not have any effect on LP a. There are 2 PCSK9 inhibitors- Evolocumab and alirocumab both have beneficial effect in lowering LP a . However, these were given by injection twice monthly. There are novel RNA based drugs in development to lower LP a. And they are promising . Until they are available, options are to use this injectable, drugs or aggressive lowering of LDL cholesterol by statins.
It's always good to have LP a level tested at least once for everyone, more so if you have family history of early heart, disease, or stroke or family members with elevated Lp a level.
I hope I did not cause confusion. Always talk to your doctor about this.

ಅಂಕ Eight double O"""


def parse_numbers_file():
    """Parse numbers file"""
    with open(NUMBERS_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    sections = {}
    parts = re.split(r'\n(?=#\s*\d+|\n(?:Heart [Tt]alk|HEART TALK))', '\n' + content)

    for part in parts:
        if not part.strip():
            continue

        lines = part.strip().split('\n')
        num = None
        title_start = 0

        # Parse number - allow space after #
        if re.match(r'#\s*(\d+(?:\.\d+)?)\s*$', lines[0]):
            num = re.match(r'#\s*(\d+(?:\.\d+)?)\s*$', lines[0]).group(1)
            title_start = 1
            if title_start < len(lines) and re.search(r'HEART TALK', lines[title_start], re.IGNORECASE):
                title_start += 1
        elif re.search(r'(?:Heart [Tt]alk|HEART TALK)\s+(?:#|NO|#number)\s*(\d+)', lines[0]):
            match = re.search(r'(?:Heart [Tt]alk|HEART TALK)\s+(?:#|NO|#number)\s*(\d+)', lines[0])
            num = match.group(1)
            title_start = 1

        if not num:
            continue

        # Get title
        while title_start < len(lines) and not lines[title_start].strip():
            title_start += 1

        title = lines[title_start].strip() if title_start < len(lines) else ""
        content = '\n'.join(lines[title_start + 1:]).strip()

        key = '59_snow' if num == '59.1' else num
        display_num = 59 if num == '59.1' else int(num)

        sections[key] = {'number': display_num, 'title': title, 'content': content}

    return sections


def parse_main_file():
    """Parse main file - handle conflicting markers"""
    with open(MAIN_FILE, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Find all markers
    markers = []
    for i, line in enumerate(lines):
        if re.match(r'^\s*#(\d+)\s*$', line):
            num = int(re.match(r'^\s*#(\d+)\s*$', line).group(1))
            markers.append((i, num, 'standalone'))
        elif re.search(r'(?:Heart [Tt]alk|HEART TALK)\s*#\s*(\d+)', line):
            num = int(re.search(r'(?:Heart [Tt]alk|HEART TALK)\s*#\s*(\d+)', line).group(1))
            markers.append((i, num, 'heading'))

    # Parse sections - handle conflicting markers
    sections = []
    i = 0
    while i < len(markers):
        line_num, num, marker_type = markers[i]

        # Check if next line also has a marker (conflict!)
        actual_num = num
        skip_next = False
        if i + 1 < len(markers) and markers[i+1][0] - line_num <= 5:
            # Conflicting markers close together
            if marker_type == 'standalone' and markers[i+1][2] == 'heading':
                # Use standalone number (more reliable than heading)
                # But skip the heading marker
                actual_num = num  # Keep standalone number
                skip_next = True  # Skip the heading marker

        # Find section end
        next_marker_idx = i + 2 if skip_next else i + 1
        if next_marker_idx < len(markers):
            end_line = markers[next_marker_idx][0]
        else:
            end_line = len(lines)

        section_text = ''.join(lines[line_num:end_line])
        section_lines = section_text.split('\n')

        # Find title - skip ALL marker lines AND empty lines
        title_idx = 0
        for j, sline in enumerate(section_lines):
            if (re.match(r'^\s*#\d+\s*$', sline) or
                re.search(r'HEART TALK', sline, re.IGNORECASE) or
                not sline.strip()):
                continue
            title_idx = j
            break

        title = section_lines[title_idx].strip() if title_idx < len(section_lines) else ""
        content = '\n'.join(section_lines[title_idx + 1:]).strip()

        sections.append({
            'number': actual_num,
            'title': title,
            'content': content,
            'line': line_num + 1
        })

        i += 2 if skip_next else 1

    return sections


print("="*70)
print("Heart Talk - Final Formatter (ALL FIXES)")
print("="*70)

# Parse
print("\n[1] Parsing...")
new_sections = parse_numbers_file()
print(f"    Numbers file: {len(new_sections)} sections")
for key in sorted(new_sections.keys(), key=lambda x: (100 if '_snow' in str(x) else int(x) if str(x).isdigit() else 0)):
    s = new_sections[key]
    print(f"      #{s['number']}: {s['title'][:60]}")

main_sections = parse_main_file()
print(f"    Main file: {len(main_sections)} sections")

# Remove duplicates
print("\n[2] Removing duplicates...")
seen = {}
unique = []
dups = []

for s in main_sections:
    if s['number'] not in seen:
        seen[s['number']] = s
        unique.append(s)
    else:
        dups.append((s['number'], s['line'], s['title']))

print(f"    Removed: {len(dups)} duplicates")

# Build complete section map from BOTH sources
print("\n[3] Building section map from both sources...")
all_sections = {}

# Add #2 from user first
all_sections[2] = {
    'number': 2,
    'title': HT2_TITLE,
    'content': HT2_CONTENT,
    'source': 'user',
    'orig_num': 'intro'
}

# Add all from numbers file (higher priority for conflicts)
for key, section in new_sections.items():
    num = section['number']
    all_sections[num] = {
        'number': num,
        'title': section['title'],
        'content': section['content'],
        'source': 'numbers',
        'orig_num': 'NEW'
    }

# Add from main file (don't override numbers file versions)
for section in unique:
    num = section['number']
    # Skip if already in map from numbers file
    if num in all_sections and all_sections[num]['source'] == 'numbers':
        print(f"    Skipping main #{num} (using numbers file version)")
        continue

    all_sections[num] = {
        'number': num,
        'title': section['title'],
        'content': section['content'],
        'source': 'main',
        'orig_num': num
    }

print(f"    Total unique sections: {len(all_sections)}")

# Build final list with renumbering
print("\n[4] Building final document with renumbering...")
final = []

# Add #1 from numbers (if exists)
if 1 in all_sections:
    final.append({
        'num': 1,
        'orig': all_sections[1].get('orig_num', 'NEW'),
        'title': all_sections[1]['title'],
        'content': all_sections[1]['content'],
        'source': all_sections[1]['source']
    })
    print(f"    #1: {all_sections[1]['title'][:50]} ({all_sections[1]['source']})")

# Add #2 from user
if 2 in all_sections:
    final.append({
        'num': 2,
        'orig': 'intro',
        'title': all_sections[2]['title'],
        'content': all_sections[2]['content'],
        'source': 'user'
    })
    print(f"    #2: {all_sections[2]['title'][:50]} (user)")

# #3-#11: Take first 9 sections from main (after duplicates removed) and renumber as #3-#11
# This handles the case where #11 doesn't exist in original file
first_sections = [s for s in unique if s['number'] >= 3][:9]  # Take first 9 sections
for i, s in enumerate(first_sections, start=3):
    final.append({
        'num': i,
        'orig': s['number'],
        'title': s['title'],
        'content': s['content'],
        'source': 'main'
    })
    if s['number'] != i:
        print(f"    #{i}: {s['title'][:50]} (was #{s['number']})")

# Get the section numbers that were renumbered to #3-#11
renumbered_orig_nums = [s['number'] for s in first_sections]
print(f"    Renumbered sections (original numbers): {renumbered_orig_nums}")

# #12-#62: Iterate through ALL numbers
for num in range(12, 63):
    # Skip if this number was already used in renumbering
    if num in renumbered_orig_nums:
        print(f"    Skipping #{num} (already renumbered to #{3 + renumbered_orig_nums.index(num)})")
        continue

    # Special handling for #28 -> becomes #31
    if num == 28:
        # Add #28 from numbers file
        if num in all_sections and all_sections[num]['source'] == 'numbers':
            final.append({
                'num': 28,
                'orig': 'NEW',
                'title': all_sections[28]['title'],
                'content': all_sections[28]['content'],
                'source': 'numbers'
            })
            print(f"    #28: {all_sections[28]['title'][:50]} (from numbers)")
        continue

    # Special handling for #31 (was #28 in main file)
    if num == 31:
        # Find the original #28 from main file
        orig_28 = next((s for s in unique if s['number'] == 28), None)
        if orig_28:
            final.append({
                'num': 31,
                'orig': 28,
                'title': orig_28['title'],
                'content': orig_28['content'],
                'source': 'main'
            })
            print(f"    #31: {orig_28['title'][:50]} (was #28)")
        continue

    # Special handling for #59
    if num == 59:
        # Add #59.ver1 (PERIPHERAL ARTERIAL DISEASE from main)
        orig_59 = next((s for s in unique if s['number'] == 59 and 'PERIPHERAL' in s['title'].upper()), None)
        if orig_59:
            final.append({
                'num': '59.ver1',
                'orig': 59,
                'title': orig_59['title'],
                'content': orig_59['content'],
                'source': 'main'
            })
            print(f"    #59.ver1: {orig_59['title'][:50]} (renamed from #59)")

        # Add #59 (SNOW SHOVELING from numbers file)
        if '59_snow' in new_sections:
            final.append({
                'num': 59,
                'orig': 'NEW (59.1)',
                'title': new_sections['59_snow']['title'],
                'content': new_sections['59_snow']['content'],
                'source': 'numbers'
            })
            print(f"    #59: {new_sections['59_snow']['title'][:50]} (from numbers)")
        continue

    # Regular section - check if it exists in all_sections
    if num in all_sections:
        s = all_sections[num]
        final.append({
            'num': num,
            'orig': s.get('orig_num', num),
            'title': s['title'],
            'content': s['content'],
            'source': s['source']
        })

        if s['source'] == 'numbers':
            print(f"    #{num}: {s['title'][:50]} (from numbers)")

# Sort
final.sort(key=lambda x: (
    59.1 if x['num'] == '59.ver1' else float(x['num']),
    str(x['num'])
))

print(f"    Total: {len(final)} sections")

# Write output
print("\n[4] Writing output...")
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    f.write("# Heart Talk Collection\n\nby Dr. Keshava Aithal\n\n")

    # TOC
    f.write("## Table of Contents\n\n")
    for s in final:
        anchor = f"heart-talk-{str(s['num']).replace('.', '-')}"
        f.write(f"{s['num']}. [Heart Talk #{s['num']}: {s['title']}](#{anchor})\n")
    f.write("\n---\n\n")

    # Sections
    for s in final:
        f.write(f"## Heart Talk #{s['num']}\n\n")
        if s['title']:
            f.write(f"### {s['title']}\n\n")
        f.write(s['content'])
        f.write("\n\n---\n\n")

# Report
with open(REPORT_FILE, 'w', encoding='utf-8') as f:
    f.write("# Heart Talk - Complete Analysis Report\n\n")
    f.write("="*70 + "\n\n")
    f.write("## Summary\n\n")
    f.write(f"- **Total sections**: {len(final)}\n")
    f.write(f"- **From numbers file**: {len([s for s in final if s['source'] == 'numbers'])}\n")
    f.write(f"- **From user (HT#2)**: 1\n")
    f.write(f"- **Duplicates removed**: {len(dups)}\n\n")

    f.write("## New Content Added\n\n")
    for s in final:
        if s['source'] in ['numbers', 'user']:
            f.write(f"- **#{s['num']}**: {s['title']} ({s['source']})\n")
    f.write("\n")

    f.write("## Duplicates Removed\n\n")
    for num, line, title in dups:
        f.write(f"- **#{num}** (line {line}): {title[:60]}\n")
    f.write("\n")

    f.write("## Renumbering (Sections 1-11)\n\n")
    f.write("| Final # | Original # | Title |\n|---------|------------|-------|\n")
    for s in final[:11]:
        f.write(f"| #{s['num']} | {s['orig']} | {s['title'][:60]} |\n")
    f.write("\n")

    f.write("## Special Changes\n\n")
    f.write("- **#28**: HEART ATTACK VS CARDIAC ARREST (NEW from numbers file)\n")
    f.write("- **#31**: LONG COVID AND HEART (was #28 in main file)\n")
    f.write("- **#42**: INHERITED HIGH CHOLESTEROL (NEW from numbers file)\n")
    f.write("- **#59**: CARDIOVASCULAR EFFECTS OF SNOW SHOVELING (from numbers file)\n")
    f.write("- **#59.ver1**: PERIPHERAL ARTERIAL DISEASE (renamed from #59)\n\n")

    f.write("## Complete Section List\n\n")
    for s in final:
        f.write(f"{s['num']}. {s['title']}\n")

print(f"    {OUTPUT_FILE}")
print(f"    {REPORT_FILE}")
print("\n" + "="*70)
print(f"COMPLETE! {len(final)} Heart Talk sections")
print("="*70)
