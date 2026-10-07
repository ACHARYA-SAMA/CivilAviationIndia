#!/usr/bin/env python3
"""
Extract the owner's fee tables into src/content/fees.generated.json.

Sources (uploads):
  1591940806077_AVIATION TRAINING PROGRAMS.pdf  rows 1-142 in five sections (see SECTIONS)
  COST OF THE MAINTENACE CHEKCS.pdf             A&B / C light / C heavy / D check costs
Only obvious typos are corrected (listed in FIXES) so the published figures stay verbatim.
"""
import json, os, re
import pymupdf

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DL = os.path.expanduser('~/Downloads/')
PROGRAMS_PDF = DL + 'fwdmail1requestforproposalofnewwebsitedevelopment/1591940806077_AVIATION TRAINING PROGRAMS.pdf'
CHECKS_PDF = DL + 'fwdmail3requestforproposalofnewwebsitedevelopment/COST OF THE MAINTENACE CHEKCS.pdf'
OUT = os.path.join(ROOT, 'src/content/fees.generated.json')

# Section boundaries by serial number, from the page headings ("AIRCRAFT MAINTENANCE ENGINEERING", "PILOT TRAINING").
SECTIONS = [
    ('maintenance', 1, 11),        # AME / licensing / on-job training
    ('maintenanceTypes', 12, 69),  # engineer type courses by aircraft family
    ('pilot', 70, 74),             # PPL / CPL / simulator / helicopter
    ('pilotTypes', 75, 131),       # pilot type ratings by aircraft family
    ('other', 132, 142),           # cabin crew, aviation medicine, degrees, ground handling
]
FIXES = {'Aircrfat': 'Aircraft', '&600K': '$600K', '$$120K': '$120K'}


def clean(text):
    text = (text or '').strip()
    for a, b in FIXES.items(): text = text.replace(a, b)
    return text


def one_line(text):
    return re.sub(r'\s+', ' ', clean(text).replace('\n', ' ')).strip()


def variants(text):
    """Aircraft cell -> list of lines ("A320 - 100 series", "- 200 series", ...), re-joining PDF line wraps."""
    lines = [re.sub(r'\s+', ' ', line).strip() for line in clean(text).split('\n') if line.strip()]
    out = []
    for line in lines:
        prev = out[-1] if out else ''
        unbalanced = prev.count('(') > prev.count(')')
        wrapped = bool(prev) and (unbalanced or prev.endswith(('/', ',')) or (prev.endswith('-') and not prev.endswith(' -'))
                                  or line[0] == ')' or line.startswith('series') or len(line) <= 4)
        if wrapped:
            glue = '' if prev.endswith('-') and not prev.endswith(' -') else ' '
            out[-1] = prev + glue + line
        else:
            out.append(line)
    return out


def programme_rows():
    doc = pymupdf.open(PROGRAMS_PDF)
    rows = {}
    for page in doc:
        for table in page.find_tables().tables:
            for r in table.extract():
                if not r or not r[0] or not re.fullmatch(r'\d+', r[0].strip()): continue
                n = int(r[0])
                rows[n] = dict(no=n, code=one_line(r[1]), training=r[2] or '', strength=one_line(r[3]), duration=one_line(r[4]), fee=one_line(r[5]))
    return rows


def checks_rows():
    doc = pymupdf.open(CHECKS_PDF)
    out = []
    for page in doc:
        for table in page.find_tables().tables:
            for r in table.extract():
                cells = [one_line(c) for c in r]
                if not cells or not re.fullmatch(r'\d+', cells[0] or ''): continue
                out.append(cells)
    return out


def main():
    rows = programme_rows()
    data = {}
    for name, lo, hi in SECTIONS:
        items = []
        for n in range(lo, hi + 1):
            row = rows.get(n)
            if not row: print('missing row', n); continue
            entry = dict(row)
            if name.endswith('Types'):
                entry['aircraft'] = variants(row['training'])
                del entry['training']
            else:
                entry['training'] = one_line(row['training'])
            items.append(entry)
        data[name] = items
    data['checks'] = checks_rows()
    json.dump(data, open(OUT, 'w', encoding='utf8'), indent=1, ensure_ascii=False)
    print({k: len(v) for k, v in data.items()})


if __name__ == '__main__':
    main()
