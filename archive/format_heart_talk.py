#!/usr/bin/env python3
"""
Format Heart Talk document with proper headings and renumbering
"""
import re
from collections import defaultdict

# File paths
MAIN_FILE = "/Users/ravikiran/Apps/claude/hralth/Heart Talk.md"
NUMBERS_FILE = "/Users/ravikiran/Apps/claude/hralth/numbers"
OUTPUT_FILE = "/Users/ravikiran/Apps/claude/hralth/Heart Talk - Formatted.md"
REPORT_FILE = "/Users/ravikiran/Apps/claude/hralth/Heart Talk - Analysis Report.md"


def parse_numbers_file(filepath):
    """Parse the numbers file to extract new/updated Heart Talk entries"""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Find all section boundaries
    section_markers = []
    for i, line in enumerate(lines):
        # Standalone #X
        standalone = re.match(r'^\s*#\s*(\d+(?:\.\d+)?)\s*$', line)
        if standalone:
            num = standalone.group(1)
            section_markers.append((i, num, 'standalone'))
            continue

        # "Heart Talk #X" variations
        heading = re.search(r'(?:Heart [Tt]alk|HEART TALK)\s+(?:#|NO|#number)\s*(\d+(?:\.\d+)?)', line)
        if heading:
            num = heading.group(1)
            section_markers.append((i, num, 'heading'))

    # Parse each section
    sections = {}
    for idx, (start_line, num, marker_type) in enumerate(section_markers):
        # Skip if this is a duplicate marker for same section
        if idx > 0 and section_markers[idx-1][1] == num:
            continue

        # Find end of section
        if idx + 1 < len(section_markers):
            end_line = section_markers[idx + 1][0]
        else:
            end_line = len(lines)

        # Extract section content
        section_lines = lines[start_line:end_line]

        # Parse based on marker type
        ptr = 0
        if marker_type == 'standalone':
            ptr = 1  # Skip #X marker
            # Skip empty lines and optional heading
            while ptr < len(section_lines) and (not section_lines[ptr].strip() or
                                                  re.search(r'HEART TALK', section_lines[ptr], re.IGNORECASE)):
                if re.search(r'HEART TALK', section_lines[ptr], re.IGNORECASE):
                    ptr += 1
                    break
                ptr += 1

            # Skip more empty lines
            while ptr < len(section_lines) and not section_lines[ptr].strip():
                ptr += 1

            # Get title
            title = section_lines[ptr].strip() if ptr < len(section_lines) else ""
            ptr += 1
        else:
            ptr = 1  # Skip heading line
            while ptr < len(section_lines) and not section_lines[ptr].strip():
                ptr += 1

            # Get title
            title = section_lines[ptr].strip() if ptr < len(section_lines) else ""
            ptr += 1

        # Rest is content
        content = ''.join(section_lines[ptr:]).strip()

        # Store section
        if num == "59.1":
            key = '59_snow'
            display_num = "59"
        else:
            key = num
            display_num = num

        sections[key] = {
            'number': display_num,
            'title': title,
            'content': content,
            'source': 'numbers_file'
        }

    return sections


def parse_main_file(filepath):
    """Parse the main Heart Talk.md file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')

    # Find intro (before first section)
    intro_end = 0
    for i, line in enumerate(lines):
        if re.match(r'^\s*#\d+\s*$', line) or re.search(r'(?:Heart [Tt]alk|HEART TALK)\s*#\s*\d+', line):
            intro_end = i
            break

    intro_content = '\n'.join(lines[:intro_end]).strip()
    if intro_content.startswith("Heart Talk"):
        intro_content = intro_content[10:].strip()

    # Find all section markers
    markers = []
    for i, line in enumerate(lines):
        standalone = re.match(r'^\s*#(\d+)\s*$', line)
        if standalone:
            markers.append((i, int(standalone.group(1)), 'standalone'))
            continue

        heading = re.search(r'(?:Heart [Tt]alk|HEART TALK)\s*#\s*(\d+)', line)
        if heading:
            markers.append((i, int(heading.group(1)), 'heading'))

    # Parse sections
    sections = []
    for idx, (line_num, num, marker_type) in enumerate(markers):
        if idx + 1 < len(markers):
            end_line = markers[idx + 1][0]
        else:
            end_line = len(lines)

        section_lines = lines[line_num:end_line]

        # Parse content
        if marker_type == 'standalone':
            ptr = 1
            while ptr < len(section_lines) and not section_lines[ptr].strip():
                ptr += 1

            if ptr < len(section_lines) and re.search(r'(?:Heart [Tt]alk|HEART TALK)\s*#', section_lines[ptr]):
                ptr += 1
                while ptr < len(section_lines) and not section_lines[ptr].strip():
                    ptr += 1

            title = section_lines[ptr].strip() if ptr < len(section_lines) else ""
            ptr += 1
        else:
            ptr = 1
            while ptr < len(section_lines) and not section_lines[ptr].strip():
                ptr += 1

            title = section_lines[ptr].strip() if ptr < len(section_lines) else ""
            ptr += 1

        content = '\n'.join(section_lines[ptr:]).strip()

        sections.append({
            'number': num,
            'title': title,
            'content': content,
            'start_line': line_num + 1,
            'source': 'main_file'
        })

    return intro_content, sections


def main():
    print("="*70)
    print("Heart Talk Formatting and Renumbering")
    print("="*70)

    # Step 1: Parse numbers file
    print("\n[1] Parsing 'numbers' file...")
    new_sections = parse_numbers_file(NUMBERS_FILE)
    print(f"    Found {len(new_sections)} new/updated sections")
    for key in sorted(new_sections.keys(), key=lambda x: float(x.replace('_snow', '')) if '_snow' not in x else 59.1):
        print(f"      - #{new_sections[key]['number']}: {new_sections[key]['title']}")

    # Step 2: Parse main file
    print("\n[2] Parsing main 'Heart Talk.md' file...")
    intro, main_sections = parse_main_file(MAIN_FILE)
    print(f"    Found {len(main_sections)} sections in main file")

    # Step 3: Remove duplicates from main file
    print("\n[3] Removing duplicates...")
    seen = {}
    unique_sections = []
    duplicates_removed = []

    for section in main_sections:
        num = section['number']
        if num not in seen:
            seen[num] = section
            unique_sections.append(section)
        else:
            duplicates_removed.append((num, section['start_line'], section['title']))
            print(f"    Removed duplicate #{num} at line {section['start_line']}")

    print(f"    Total duplicates removed: {len(duplicates_removed)}")

    # Step 4: Build final section list with renumbering
    print("\n[4] Renumbering and integrating content...")

    final_sections = []

    # Add Heart Talk #1 (Calcium) from numbers file
    if '1' in new_sections:
        final_sections.append({
            'final_number': 1,
            'original_number': 'NEW',
            'title': new_sections['1']['title'],
            'content': new_sections['1']['content'],
            'source': 'numbers_file'
        })
        print(f"    #1: {new_sections['1']['title'][:50]}... (NEW from numbers file)")

    # Renumber sections 1-11
    renumber_map = [
        (unique_sections[0], 2),  # Lipoprotein  (was unlabeled/1) → #2
    ]

    # Find first 10 sections after lipoprotein for renumbering to #3-#11
    sections_for_renumbering = [s for s in unique_sections if s['number'] <= 12][:11]

    new_num = 2
    for section in sections_for_renumbering:
        if section['number'] == 12:  # This becomes #11
            new_num = 11

        final_sections.append({
            'final_number': new_num,
            'original_number': section['number'],
            'title': section['title'],
            'content': section['content'],
            'source': 'main_file'
        })

        if section['number'] != new_num:
            print(f"    #{new_num}: {section['title'][:50]}... (was #{section['number']})")
        else:
            print(f"    #{new_num}: {section['title'][:50]}...")

        new_num += 1
        if new_num == 12:
            break

    # Add sections 12 onwards, keeping their numbers
    for section in unique_sections:
        if section['number'] >= 12:
            # Check if we need to insert new sections
            final_num = section['number']

            # Insert #28 from numbers file before adding main file's #28
            if final_num == 28 and '28' in new_sections:
                final_sections.append({
                    'final_number': 28,
                    'original_number': 'NEW',
                    'title': new_sections['28']['title'],
                    'content': new_sections['28']['content'],
                    'source': 'numbers_file'
                })
                print(f"    #28: {new_sections['28']['title'][:50]}... (NEW from numbers file)")
                continue  # Skip the main file's #28 if it exists

            # Insert #42 from numbers file
            if final_num == 42 and '42' in new_sections:
                final_sections.append({
                    'final_number': 42,
                    'original_number': 'NEW',
                    'title': new_sections['42']['title'],
                    'content': new_sections['42']['content'],
                    'source': 'numbers_file'
                })
                print(f"    #42: {new_sections['42']['title'][:50]}... (NEW from numbers file)")
                continue

            # Handle #59 special case
            if final_num == 59:
                # Check which #59 this is
                if 'PERIPHERAL' in section['title'].upper():
                    # This is the original - rename to #59.ver1
                    final_sections.append({
                        'final_number': '59.ver1',
                        'original_number': 59,
                        'title': section['title'],
                        'content': section['content'],
                        'source': 'main_file'
                    })
                    print(f"    #59.ver1: {section['title'][:50]}... (renamed from #59)")
                    continue

            final_sections.append({
                'final_number': final_num,
                'original_number': final_num,
                'title': section['title'],
                'content': section['content'],
                'source': 'main_file'
            })

    # Add #59 (Snow Shoveling) from numbers file
    if '59_snow' in new_sections:
        final_sections.append({
            'final_number': 59,
            'original_number': 'NEW (#59.1 in numbers)',
            'title': new_sections['59_snow']['title'],
            'content': new_sections['59_snow']['content'],
            'source': 'numbers_file'
        })
        print(f"    #59: {new_sections['59_snow']['title'][:50]}... (from numbers file)")

    # Sort final sections
    final_sections.sort(key=lambda x: (float(str(x['final_number']).replace('ver', '')) if 'ver' not in str(x['final_number']) else 59.1))

    print(f"\n    Total final sections: {len(final_sections)}")

    # Step 5: Write formatted output
    print("\n[5] Writing formatted output...")

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        # Title
        f.write("# Heart Talk Collection\n\n")
        f.write("by Dr. Keshava Aithal\n\n")

        # Intro
        if intro:
            f.write(intro)
            f.write("\n\n")

        # Table of Contents
        f.write("## Table of Contents\n\n")
        for section in final_sections:
            num = section['final_number']
            title = section['title'] if section['title'] else "[Untitled]"
            anchor = f"heart-talk-{str(num).replace('.', '-')}"
            f.write(f"{num}. [Heart Talk #{num}: {title}](#{anchor})\n")

        f.write("\n---\n\n")

        # Sections
        for section in final_sections:
            num = section['final_number']
            f.write(f"## Heart Talk #{num}\n\n")
            if section['title']:
                f.write(f"### {section['title']}\n\n")
            f.write(section['content'])
            f.write("\n\n---\n\n")

    print(f"    Written to: {OUTPUT_FILE}")

    # Step 6: Generate report
    print("\n[6] Generating analysis report...")

    with open(REPORT_FILE, 'w', encoding='utf-8') as f:
        f.write("# Heart Talk - Renumbering and Integration Report\n\n")
        f.write("=" * 70 + "\n\n")

        f.write("## Summary\n\n")
        f.write(f"- **Total sections in final document**: {len(final_sections)}\n")
        f.write(f"- **New sections added from 'numbers' file**: {len([s for s in final_sections if s['source'] == 'numbers_file'])}\n")
        f.write(f"- **Duplicates removed**: {len(duplicates_removed)}\n")
        f.write(f"- **Sections renumbered**: {len([s for s in final_sections if s['original_number'] != s['final_number'] and s['original_number'] != 'NEW'])}\n\n")

        f.write("## New Content Added from 'numbers' File\n\n")
        for section in final_sections:
            if section['source'] == 'numbers_file':
                f.write(f"- **Heart Talk #{section['final_number']}**: {section['title']}\n")
        f.write("\n")

        f.write("## Duplicates Removed\n\n")
        for num, line, title in duplicates_removed:
            f.write(f"- **Heart Talk #{num}** (line {line}): {title}\n")
        f.write("\n")

        f.write("## Renumbering Changes (Sections 1-11)\n\n")
        f.write("| Final # | Original # | Title |\n")
        f.write("|---------|------------|-------|\n")
        for section in final_sections[:12]:
            if section['final_number'] <= 11 or section['original_number'] == 'NEW':
                orig = str(section['original_number'])
                final = str(section['final_number'])
                title = section['title'][:60]
                f.write(f"| #{final} | {orig} | {title} |\n")
        f.write("\n")

        f.write("## Special Handling: Heart Talk #59\n\n")
        f.write("- **#59.ver1**: PERIPHERAL ARTERIAL DISEASE (original #59 from main file)\n")
        f.write("- **#59**: CARDIOVASCULAR EFFECTS OF SNOW SHOVELING (from 'numbers' file)\n\n")

        f.write("## Final Section List\n\n")
        for section in final_sections:
            f.write(f"{section['final_number']}. {section['title']}\n")

    print(f"    Written to: {REPORT_FILE}")

    print("\n" + "="*70)
    print("COMPLETE!")
    print("="*70)


if __name__ == "__main__":
    main()
