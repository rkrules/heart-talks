#!/usr/bin/env python3
"""
Heart Talk Formatter - CORRECTED VERSION
Fixes: Processes ALL sections from both files, not just main file
"""
import re

MAIN_FILE = "/Users/ravikiran/Apps/claude/hralth/Heart Talk.md"
NUMBERS_FILE = "/Users/ravikiran/Apps/claude/hralth/numbers"
OUTPUT_FILE = "/Users/ravikiran/Apps/claude/hralth/Heart Talk - Formatted.md"
REPORT_FILE = "/Users/ravikiran/Apps/claude/hralth/Heart Talk - Analysis Report.md"

# Heart Talk #2 from user
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

        while title_start < len(lines) and not lines[title_start].strip():
            title_start += 1

        title = lines[title_start].strip() if title_start < len(lines) else ""
        content = '\n'.join(lines[title_start + 1:]).strip()

        key = int(num) if num != '59.1' else '59_snow'
        sections[key] = {'number': int(num) if num != '59.1' else 59, 'title': title, 'content': content}

    return sections


def parse_main_file():
    """Parse main file with improved conflicting marker handling"""
    with open(MAIN_FILE, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    markers = []
    for i, line in enumerate(lines):
        if re.match(r'^\s*#(\d+)\s*$', line):
            num = int(re.match(r'^\s*#(\d+)\s*$', line).group(1))
            markers.append((i, num, 'standalone'))
        elif re.search(r'(?:Heart [Tt]alk|HEART TALK)\s*#\s*(\d+)', line):
            num = int(re.search(r'(?:Heart [Tt]alk|HEART TALK)\s*#\s*(\d+)', line).group(1))
            markers.append((i, num, 'heading'))

    sections = []
    i = 0
    while i < len(markers):
        line_num, num, marker_type = markers[i]
        actual_num = num

        # Check for conflicting markers within 5 lines
        if i + 1 < len(markers) and markers[i+1][0] - line_num <= 5:
            if marker_type == 'standalone' and markers[i+1][2] == 'heading':
                actual_num = markers[i+1][1]  # Use heading number
                i += 1  # Skip next marker

        end_line = markers[i + 1][0] if i + 1 < len(markers) else len(lines)
        section_text = ''.join(lines[line_num:end_line])
        section_lines = section_text.split('\n')

        # Find title - skip ALL marker lines
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
print("Heart Talk - CORRECTED Formatter")
print("="*70)

# Parse both files
print("\n[1] Parsing files...")
numbers_sections = parse_numbers_file()
print(f"    Numbers file: {len(numbers_sections)} sections")
for key in sorted(numbers_sections.keys(), key=lambda x: x if isinstance(x, int) else 59.1):
    s = numbers_sections[key]
    print(f"      #{s['number']}: {s['title'][:60]}")

main_sections = parse_main_file()
print(f"    Main file: {len(main_sections)} sections parsed")

# Remove duplicates from main
print("\n[2] Removing duplicates from main file...")
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

# BUILD COMPLETE SECTION MAP - KEY FIX!
print("\n[3] Building complete section map from BOTH sources...")
all_sections_map = {}

# Add #2 from user first
all_sections_map[2] = {
    'number': 2,
    'title': HT2_TITLE,
    'content': HT2_CONTENT,
    'source': 'user',
    'orig_num': 'intro'
}

# Add all from numbers file (higher priority)
for key, section in numbers_sections.items():
    num = section['number']
    all_sections_map[num] = {
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
    if num in all_sections_map and all_sections_map[num]['source'] == 'numbers':
        print(f"    Skipping main #{num} (using numbers file version)")
        continue

    all_sections_map[num] = {
        'number': num,
        'title': section['title'],
        'content': section['content'],
        'source': 'main',
        'orig_num': num
    }

print(f"    Total unique sections in map: {len(all_sections_map)}")

# Build final ordered list with renumbering
print("\n[4] Applying renumbering logic...")
final = []

# Renumber 1-11
renumber_map = {
    1: all_sections_map.get(1),  # From numbers
    2: all_sections_map.get(2),  # From user
}

# Get sections 3-11 from main file (currently labeled 3-12)
main_nums_for_renumber = [s for s in unique if s['number'] >= 3 and s['number'] <= 12][:9]

for new_num, section in enumerate(main_nums_for_renumber, start=3):
    renumber_map[new_num] = {
        'number': new_num,
        'title': section['title'],
        'content': section['content'],
        'source': 'main',
        'orig_num': section['number']
    }

# Add renumbered sections
for num in range(1, 12):
    if num in renumber_map and renumber_map[num]:
        s = renumber_map[num]
        final.append({
            'num': num,
            'orig': s.get('orig_num', num),
            'title': s['title'],
            'content': s['content'],
            'source': s['source']
        })
        if s.get('orig_num') != num:
            print(f"    #{num}: {s['title'][:50]} (was #{s.get('orig_num')})")

# Add 12-62 from all_sections_map
for num in range(12, 63):
    if num in all_sections_map:
        s = all_sections_map[num]

        # Special case: #59 peripheral → rename to #59.ver1
        if num == 59 and 'PERIPHERAL' in s['title'].upper():
            final.append({
                'num': '59.ver1',
                'orig': 59,
                'title': s['title'],
                'content': s['content'],
                'source': 'main'
            })
            print(f"    #59.ver1: {s['title'][:50]} (renamed from #59)")
            continue

        final.append({
            'num': num,
            'orig': s.get('orig_num', num),
            'title': s['title'],
            'content': s['content'],
            'source': s['source']
        })

        if s['source'] == 'numbers':
            print(f"    #{num}: {s['title'][:50]} (from numbers file)")

# Add #59 snow from numbers (if exists)
if '59_snow' in numbers_sections:
    s = numbers_sections['59_snow']
    final.append({
        'num': 59,
        'orig': 'NEW (59.1)',
        'title': s['title'],
        'content': s['content'],
        'source': 'numbers'
    })
    print(f"    #59: {s['title'][:50]} (from numbers file as 59.1)")

# Sort
final.sort(key=lambda x: (
    59.1 if x['num'] == '59.ver1' else float(x['num'])
))

print(f"\n    Total final sections: {len(final)}")

# Write output
print("\n[5] Writing output...")
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
    f.write(f"- **Total sections in final document**: {len(final)}\n")
    f.write(f"- **From numbers file**: {len([s for s in final if s['source'] == 'numbers'])}\n")
    f.write(f"- **From user (HT#2)**: 1\n")
    f.write(f"- **Duplicates removed from main**: {len(dups)}\n\n")

    f.write("## Sections Added from External Sources\n\n")
    for s in final:
        if s['source'] in ['numbers', 'user']:
            f.write(f"- **#{s['num']}**: {s['title']} ({s['source']})\n")
    f.write("\n")

    f.write("## Duplicates Removed\n\n")
    for num, line, title in dups:
        f.write(f"- **#{num}** (line {line}): {title[:60]}\n")
    f.write("\n")

    f.write("## Renumbering (Sections 1-11)\n\n")
    f.write("| Final # | Original # | Title | Source |\n|---------|------------|-------|--------|\n")
    for s in final[:11]:
        f.write(f"| #{s['num']} | {s['orig']} | {s['title'][:50]} | {s['source']} |\n")
    f.write("\n")

    f.write("## Missing Numbers\n\n")
    all_nums = set([s['num'] for s in final if isinstance(s['num'], int)])
    missing = sorted(set(range(1, 63)) - all_nums)
    if missing:
        f.write(f"Missing: {', '.join(f'#{n}' for n in missing)}\n\n")
    else:
        f.write("No missing numbers in sequence 1-62!\n\n")

    f.write("## Complete Section List\n\n")
    for s in final:
        f.write(f"{s['num']}. {s['title']}\n")

print(f"    {OUTPUT_FILE}")
print(f"    {REPORT_FILE}")
print("\n" + "="*70)
print(f"COMPLETE! {len(final)} Heart Talk sections")
print("="*70)
