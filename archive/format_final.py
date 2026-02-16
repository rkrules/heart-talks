#!/usr/bin/env python3
"""
Final Heart Talk Formatter - Handles all edge cases
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
    parts = re.split(r'\n(?=#\d+\s*$|\n(?:Heart [Tt]alk|HEART TALK))', '\n' + content)

    for part in parts:
        if not part.strip():
            continue

        lines = part.strip().split('\n')
        num = None
        title_start = 0

        # Parse number
        if re.match(r'#(\d+(?:\.\d+)?)\s*$', lines[0]):
            num = re.match(r'#(\d+(?:\.\d+)?)\s*$', lines[0]).group(1)
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
        display_num = '59' if num == '59.1' else num

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
        if i + 1 < len(markers) and markers[i+1][0] - line_num <= 5:
            # Conflicting markers close together - use the heading number
            if marker_type == 'standalone' and markers[i+1][2] == 'heading':
                actual_num = markers[i+1][1]
                i += 1  # Skip the heading marker

        # Find section end
        if i + 1 < len(markers):
            end_line = markers[i + 1][0]
        else:
            end_line = len(lines)

        section_text = ''.join(lines[line_num:end_line])
        section_lines = section_text.split('\n')

        # Find title - skip all marker lines
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

        i += 1

    return sections


print("="*70)
print("Heart Talk - Final Formatter")
print("="*70)

# Parse
print("\n[1] Parsing...")
new_sections = parse_numbers_file()
print(f"    Numbers file: {len(new_sections)} sections")

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

# Build final list
print("\n[3] Building final document...")
final = []

# #1: Calcium (from numbers)
if '1' in new_sections:
    final.append({
        'num': 1, 'orig': 'NEW',
        'title': new_sections['1']['title'],
        'content': new_sections['1']['content'],
        'source': 'numbers'
    })

# #2: Lipoprotein (provided by user)
final.append({
    'num': 2, 'orig': 'intro',
    'title': HT2_TITLE,
    'content': HT2_CONTENT,
    'source': 'user'
})

# #3-#11: Renumber first 9 sections from main file
first_sections = [s for s in unique if s['number'] >= 3 and s['number'] <= 12][:9]
for i, s in enumerate(first_sections, start=3):
    final.append({
        'num': i,
        'orig': s['number'],
        'title': s['title'],
        'content': s['content'],
        'source': 'main'
    })

# #12 onwards: Keep original numbers, add new ones
for s in unique:
    if s['number'] < 12:
        continue

    # Replace #19 with numbers version
    if s['number'] == 19 and '19' in new_sections:
        final.append({
            'num': 19, 'orig': 19,
            'title': new_sections['19']['title'],
            'content': new_sections['19']['content'],
            'source': 'numbers'
        })
        continue

    # Replace #24 with numbers version
    if s['number'] == 24 and '24' in new_sections:
        final.append({
            'num': 24, 'orig': 24,
            'title': new_sections['24']['title'],
            'content': new_sections['24']['content'],
            'source': 'numbers'
        })
        continue

    # Add #28 from numbers
    if s['number'] == 28 and '28' in new_sections:
        final.append({
            'num': 28, 'orig': 'NEW',
            'title': new_sections['28']['title'],
            'content': new_sections['28']['content'],
            'source': 'numbers'
        })
        continue

    # Add #42 from numbers
    if s['number'] == 42 and '42' in new_sections:
        final.append({
            'num': 42, 'orig': 'NEW',
            'title': new_sections['42']['title'],
            'content': new_sections['42']['content'],
            'source': 'numbers'
        })
        continue

    # Rename #59 peripheral to #59.ver1
    if s['number'] == 59 and 'PERIPHERAL' in s['title'].upper():
        final.append({
            'num': '59.ver1', 'orig': 59,
            'title': s['title'],
            'content': s['content'],
            'source': 'main'
        })
        continue

    # Regular section
    final.append({
        'num': s['number'], 'orig': s['number'],
        'title': s['title'],
        'content': s['content'],
        'source': 'main'
    })

# Add #59 snow from numbers
if '59_snow' in new_sections:
    final.append({
        'num': 59, 'orig': 'NEW (59.1)',
        'title': new_sections['59_snow']['title'],
        'content': new_sections['59_snow']['content'],
        'source': 'numbers'
    })

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
    f.write("# Heart Talk - Final Analysis Report\n\n")
    f.write("="*70 + "\n\n")
    f.write("## Summary\n\n")
    f.write(f"- **Total sections**: {len(final)}\n")
    f.write(f"- **From numbers file**: {len([s for s in final if s['source'] == 'numbers'])}\n")
    f.write(f"- **Duplicates removed**: {len(dups)}\n\n")

    f.write("## New Content Added\n\n")
    for s in final:
        if s['source'] in ['numbers', 'user']:
            f.write(f"- **#{s['num']}**: {s['title']} ({s['source']})\n")
    f.write("\n")

    f.write("## Renumbering (Sections 1-11)\n\n")
    f.write("| Final # | Original # | Title |\n|---------|------------|-------|\n")
    for s in final[:11]:
        f.write(f"| #{s['num']} | {s['orig']} | {s['title'][:60]} |\n")
    f.write("\n")

    f.write("## All Sections\n\n")
    for s in final:
        f.write(f"{s['num']}. {s['title']}\n")

print(f"    {OUTPUT_FILE}")
print(f"    {REPORT_FILE}")
print("\n" + "="*70)
print(f"COMPLETE! {len(final)} Heart Talk sections")
print("="*70)
