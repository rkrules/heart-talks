#!/usr/bin/env python3
"""
Simplified Heart Talk Formatter - v2
"""
import re

MAIN_FILE = "/Users/ravikiran/Apps/claude/hralth/Heart Talk.md"
NUMBERS_FILE = "/Users/ravikiran/Apps/claude/hralth/numbers"
OUTPUT_FILE = "/Users/ravikiran/Apps/claude/hralth/Heart Talk - Formatted.md"
REPORT_FILE = "/Users/ravikiran/Apps/claude/hralth/Heart Talk - Analysis Report.md"

def parse_numbers_file():
    """Parse numbers file - simpler approach"""
    with open(NUMBERS_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    sections = {}

    # Split by looking for section starts
    # Pattern: either "#X" line or "HEART TALK" line at start
    parts = re.split(r'\n(?=#\d+\s*$|\n(?:Heart [Tt]alk|HEART TALK))', '\n' + content)

    for part in parts:
        if not part.strip():
            continue

        lines = part.strip().split('\n')

        # Find the number
        num = None
        title_start = 0

        # Check first line for standalone #X
        if re.match(r'#(\d+(?:\.\d+)?)\s*$', lines[0]):
            num = re.match(r'#(\d+(?:\.\d+)?)\s*$', lines[0]).group(1)
            title_start = 1

            # Skip "HEART TALK #X" line if present
            if title_start < len(lines) and re.search(r'HEART TALK', lines[title_start], re.IGNORECASE):
                title_start += 1
        # Check first line for "HEART TALK #X"
        elif re.search(r'(?:Heart [Tt]alk|HEART TALK)\s+(?:#|NO|#number)\s*(\d+)', lines[0]):
            match = re.search(r'(?:Heart [Tt]alk|HEART TALK)\s+(?:#|NO|#number)\s*(\d+)', lines[0])
            num = match.group(1)
            title_start = 1

        if not num:
            continue

        # Get title (first non-empty line after header)
        title = ""
        while title_start < len(lines) and not lines[title_start].strip():
            title_start += 1

        if title_start < len(lines):
            title = lines[title_start].strip()
            content_lines = lines[title_start + 1:]
        else:
            content_lines = []

        content = '\n'.join(content_lines).strip()

        # Handle #59.1 special case
        key = '59_snow' if num == '59.1' else num
        display_num = '59' if num == '59.1' else num

        sections[key] = {
            'number': display_num,
            'title': title,
            'content': content
        }

    return sections


def parse_main_file():
    """Parse main Heart Talk.md"""
    with open(MAIN_FILE, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Find intro
    intro_end = 0
    for i, line in enumerate(lines):
        if re.match(r'^\s*#\d+\s*$', line) or re.search(r'HEART TALK\s*#', line, re.IGNORECASE):
            intro_end = i
            break

    intro = ''.join(lines[:intro_end]).strip()
    if intro.startswith("Heart Talk"):
        intro = intro[10:].strip()

    # Find all markers
    markers = []
    for i, line in enumerate(lines):
        if re.match(r'^\s*#(\d+)\s*$', line):
            num = int(re.match(r'^\s*#(\d+)\s*$', line).group(1))
            markers.append((i, num))
        elif re.search(r'(?:Heart [Tt]alk|HEART TALK)\s*#\s*(\d+)', line):
            num = int(re.search(r'(?:Heart [Tt]alk|HEART TALK)\s*#\s*(\d+)', line).group(1))
            markers.append((i, num))

    # Parse sections
    sections = []
    for idx, (line_num, num) in enumerate(markers):
        end_line = markers[idx + 1][0] if idx + 1 < len(markers) else len(lines)

        section_text = ''.join(lines[line_num:end_line])

        # Extract title - look for first substantial line after any headers
        section_lines = section_text.split('\n')
        title_idx = 0

        # Skip markers and empty lines
        for i, sline in enumerate(section_lines):
            if re.match(r'^\s*#\d+\s*$', sline) or re.search(r'HEART TALK', sline, re.IGNORECASE) or not sline.strip():
                continue
            title_idx = i
            break

        title = section_lines[title_idx].strip() if title_idx < len(section_lines) else ""
        content = '\n'.join(section_lines[title_idx + 1:]).strip()

        sections.append({
            'number': num,
            'title': title,
            'content': content,
            'line': line_num + 1
        })

    return intro, sections


print("="*70)
print("Heart Talk Formatting - Version 2")
print("="*70)

# Parse files
print("\n[1] Parsing files...")
new_sections = parse_numbers_file()
print(f"    Numbers file: {len(new_sections)} sections")
for key in sorted(new_sections.keys(), key=lambda x: (0 if x == '1' else 100 if '_snow' in x else int(x))):
    print(f"      #{new_sections[key]['number']}: {new_sections[key]['title']}")

intro, main_sections = parse_main_file()
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

print(f"    Removed {len(dups)} duplicates")

# Build final list with renumbering
print("\n[3] Building final document...")

final = []

# Add #1 from numbers
if '1' in new_sections:
    final.append({
        'num': 1,
        'orig': 'NEW',
        'title': new_sections['1']['title'],
        'content': new_sections['1']['content'],
        'source': 'numbers'
    })

# Get first 10 sections from main file for renumbering to #2-#11
renumber_sections = [s for s in unique if s['number'] <= 12][:10]

for i, s in enumerate(renumber_sections, start=2):
    final.append({
        'num': i,
        'orig': s['number'],
        'title': s['title'],
        'content': s['content'],
        'source': 'main'
    })

# Add rest, keeping their numbers
for s in unique:
    if s['number'] < 12:
        continue  # Already added in renumbering

    # Insert #19 from numbers if needed
    if s['number'] == 19 and '19' in new_sections:
        # Use version from numbers file (better formatted)
        final.append({
            'num': 19,
            'orig': 19,
            'title': new_sections['19']['title'],
            'content': new_sections['19']['content'],
            'source': 'numbers'
        })
        continue

    # Insert #24 from numbers if needed
    if s['number'] == 24 and '24' in new_sections:
        final.append({
            'num': 24,
            'orig': 24,
            'title': new_sections['24']['title'],
            'content': new_sections['24']['content'],
            'source': 'numbers'
        })
        continue

    # Insert #28 from numbers
    if s['number'] == 28 and '28' in new_sections:
        final.append({
            'num': 28,
            'orig': 'NEW',
            'title': new_sections['28']['title'],
            'content': new_sections['28']['content'],
            'source': 'numbers'
        })
        continue

    # Insert #42 from numbers
    if s['number'] == 42 and '42' in new_sections:
        final.append({
            'num': 42,
            'orig': 'NEW',
            'title': new_sections['42']['title'],
            'content': new_sections['42']['content'],
            'source': 'numbers'
        })
        continue

    # Handle #59 special case
    if s['number'] == 59:
        if 'PERIPHERAL' in s['title'].upper():
            # Rename to #59.ver1
            final.append({
                'num': '59.ver1',
                'orig': 59,
                'title': s['title'],
                'content': s['content'],
                'source': 'main'
            })
            continue

    # Regular section
    final.append({
        'num': s['number'],
        'orig': s['number'],
        'title': s['title'],
        'content': s['content'],
        'source': 'main'
    })

# Add #59 snow shoveling from numbers
if '59_snow' in new_sections:
    final.append({
        'num': 59,
        'orig': 'NEW (59.1)',
        'title': new_sections['59_snow']['title'],
        'content': new_sections['59_snow']['content'],
        'source': 'numbers'
    })

# Sort
final.sort(key=lambda x: (float(str(x['num']).replace('ver', '').replace('.', '.')) if 'ver' not in str(x['num']) else 59.1, str(x['num'])))

print(f"    Total sections: {len(final)}")

# Write output
print("\n[4] Writing formatted output...")

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    f.write("# Heart Talk Collection\n\n")
    f.write("by Dr. Keshava Aithal\n\n")

    if intro:
        f.write(intro + "\n\n")

    # TOC
    f.write("## Table of Contents\n\n")
    for s in final:
        num = s['num']
        title = s['title'] or "[Untitled]"
        anchor = f"heart-talk-{str(num).replace('.', '-')}"
        f.write(f"{num}. [Heart Talk #{num}: {title}](#{anchor})\n")

    f.write("\n---\n\n")

    # Sections
    for s in final:
        f.write(f"## Heart Talk #{s['num']}\n\n")
        if s['title']:
            f.write(f"### {s['title']}\n\n")
        f.write(s['content'])
        f.write("\n\n---\n\n")

print(f"    Written: {OUTPUT_FILE}")

# Write report
print("\n[5] Writing report...")

with open(REPORT_FILE, 'w', encoding='utf-8') as f:
    f.write("# Heart Talk - Complete Analysis Report\n\n")
    f.write("="*70 + "\n\n")

    f.write("## Summary\n\n")
    f.write(f"- **Total sections in final document**: {len(final)}\n")
    f.write(f"- **Sections from numbers file**: {len([s for s in final if s['source'] == 'numbers'])}\n")
    f.write(f"- **Duplicates removed**: {len(dups)}\n\n")

    f.write("## New/Updated Content from 'numbers' File\n\n")
    for s in final:
        if s['source'] == 'numbers':
            f.write(f"- **#{s['num']}**: {s['title']}\n")
    f.write("\n")

    f.write("## Duplicates Removed from Main File\n\n")
    for num, line, title in dups:
        f.write(f"- **#{num}** (line {line}): {title[:60]}\n")
    f.write("\n")

    f.write("## Renumbering Map (Sections 1-11)\n\n")
    f.write("| Final # | Original # | Title | Source |\n")
    f.write("|---------|------------|-------|--------|\n")
    for s in final[:11]:
        f.write(f"| #{s['num']} | {s['orig']} | {s['title'][:50]} | {s['source']} |\n")
    f.write("\n")

    f.write("## Complete Section List\n\n")
    for s in final:
        f.write(f"{s['num']}. {s['title']}\n")

print(f"    Written: {REPORT_FILE}")

print("\n" + "="*70)
print("COMPLETE!")
print(f"Final document has {len(final)} Heart Talk sections")
print("="*70)
