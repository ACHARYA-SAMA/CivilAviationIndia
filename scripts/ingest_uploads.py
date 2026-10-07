#!/usr/bin/env python3
"""
Ingest the owner's uploaded documents into the site.

    pip install pymupdf pillow opencv-python numpy
    python scripts/ingest_uploads.py            # all
    python scripts/ingest_uploads.py letters    # or: gallery brand hero

Reads from the three "fwdmail*" upload folders (paths below) and the screen recording, writes:
  public/media/letters/letter-NN.webp      optimised scan (max 2400px long side)
  public/documents/letters/letter-NN.<ext> untouched original, for the Download button
  public/media/gallery/act-PP-K.webp       event photos (rotation fixed, near-duplicates dropped)
  public/media/brand/assi-emblem.png       Aero Space Society of India emblem (alpha kept)
  public/media/home/hero-glass-roof.webp   interim hero cropped from the screen recording
  src/content/media.generated.json         id -> { src, width, height, blur, ... }

Student registers / result sheets in the uploads contain personal data (DOB, Aadhaar, phone,
passwords). Their text is never read; the only thing taken from one of them is the emblem bitmap.
"""
import io, json, os, re, sys, zipfile, base64
import pymupdf
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DL = os.path.expanduser('~/Downloads/')
M1 = DL + 'fwdmail1requestforproposalofnewwebsitedevelopment/'
M2 = DL + 'fwdmail2requestforproposalofnewwebsitedevelopment/'
M3 = DL + 'fwdmail3requestforproposalofnewwebsitedevelopment/'
LETTERS_DOCX = M3 + 'appreciationletters.docx'
ACTIVITIES_PDF = M2 + 'ASSI ACTIVITIES.1.pdf'
EMBLEM_PDF = M2 + 'batch 1.pdf'
VIDEO = os.path.expanduser('~/AppData/Local/Packages/Microsoft.ScreenSketch_8wekyb3d8bbwe/TempState/Recordings/20261006-1712-45.4134721.mp4')

MANIFEST = os.path.join(ROOT, 'src/content/media.generated.json')
manifest = json.load(open(MANIFEST)) if os.path.exists(MANIFEST) else {}


def out(*p):
    path = os.path.join(ROOT, *p)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    return path


def blur_of(im):
    t = im.convert('RGB'); t.thumbnail((20, 20))
    buf = io.BytesIO(); t.save(buf, 'JPEG', quality=40)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()


def save_webp(im, rel, max_side, q=84):
    im = im.convert('RGBA') if im.mode in ('RGBA', 'LA', 'P') else im.convert('RGB')
    im.thumbnail((max_side, max_side), Image.LANCZOS)
    im.save(out('public', rel), 'WEBP', quality=q, method=6)
    return im.size


def ahash(im, n=16):
    g = im.convert('L').resize((n, n), Image.LANCZOS)
    px = list(g.getdata()); avg = sum(px) / len(px)
    return int(''.join('1' if p > avg else '0' for p in px), 2)


def hamming(a, b):
    return bin(a ^ b).count('1')


def letters():
    z = zipfile.ZipFile(LETTERS_DOCX)
    xml = z.read('word/document.xml').decode('utf8')
    rels = z.read('word/_rels/document.xml.rels').decode('utf8')
    rid2t = {}
    for m in re.finditer(r'<Relationship [^>]*>', rels):
        tag = m.group(0)
        rid = re.search(r'Id="(rId\d+)"', tag); tgt = re.search(r'Target="(media/[^"]+)"', tag)
        if rid and tgt: rid2t[rid.group(1)] = tgt.group(1)
    order = [rid2t[r] for r in re.findall(r'r:embed="(rId\d+)"', xml) if r in rid2t]
    for i, t in enumerate(order, 1):
        data = z.read('word/' + t)
        ext = t.rsplit('.', 1)[-1].lower()
        lid = f'letter-{i:02d}'
        with open(out('public/documents/letters', f'{lid}.{ext}'), 'wb') as f: f.write(data)
        im = Image.open(io.BytesIO(data)); im.load()
        w, h = save_webp(im, f'media/letters/{lid}.webp', 2400, 86)
        manifest[lid] = dict(src=f'/media/letters/{lid}.webp', width=w, height=h, blur=blur_of(im), kind='letter',
                             download=f'/documents/letters/{lid}.{ext}')
    print('letters', len(order))


# Photos stored sideways in the source PDF (no EXIF rotation applied by whoever built it); angle is
# counter-clockwise degrees, verified by eye. Keyed by "<page>-<k>".
MANUAL_ROT = {'27-0': 270, '27-1': 270, '32-1': 270, '47-0': 270, '57-0': 270, '59-0': 270}


def upright(im, gid):
    rot = MANUAL_ROT.get(gid, 0)
    return (im.rotate(rot, expand=True), rot) if rot else (im, 0)


def gallery():
    doc = pymupdf.open(ACTIVITIES_PDF)
    seen_xref, kept = set(), []
    for pn, page in enumerate(doc, 1):
        infos = {i['xref']: i for i in page.get_image_info(xrefs=True)}
        for k, img in enumerate(page.get_images(full=True)):
            xref = img[0]
            if xref in seen_xref: continue
            seen_xref.add(xref)
            info = infos.get(xref)
            try:
                pix = pymupdf.Pixmap(doc, xref)
                if pix.n - pix.alpha >= 4: pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
                if pix.width < 300 or pix.height < 300: continue
                im = Image.open(io.BytesIO(pix.tobytes('png'))).convert('RGB')
            except Exception:
                continue
            if info:
                bx0, by0, bx1, by1 = info['bbox']; bw, bh = bx1 - bx0, by1 - by0
                # Image drawn rotated 90 degrees on the page: render the placed rectangle to get true orientation.
                if (im.width > im.height) != (bw > bh) and bw > 20 and bh > 20:
                    zoom = max(im.width, im.height) / max(bw, bh)
                    rp = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=pymupdf.Rect(info['bbox']))
                    im = Image.open(io.BytesIO(rp.tobytes('png'))).convert('RGB')
            kept.append((pn, k, im))
    # drop near-duplicates (same photo placed twice), keeping the larger
    hashes, final = [], []
    for pn, k, im in sorted(kept, key=lambda t: -t[2].width * t[2].height):
        h = ahash(im)
        if any(hamming(h, o) <= 10 for o in hashes): continue
        hashes.append(h); final.append((pn, k, im))
    for pn, k, im in sorted(final, key=lambda t: (t[0], t[1])):
        gid = f'act-{pn:02d}-{k}'
        im, _ = upright(im, f'{pn}-{k}')
        w, h = save_webp(im, f'media/gallery/{gid}.webp', 1800, 82)
        manifest[gid] = dict(src=f'/media/gallery/{gid}.webp', width=w, height=h, blur=blur_of(im), kind='photo', page=pn)
    print('gallery kept', len(final), 'of', len(kept))


def key_white(im, thr=232):
    """Make the white page background transparent by flood fill from the borders (keeps white inside the emblem)."""
    import numpy as np
    from collections import deque
    from PIL import ImageFilter
    rgb = im.convert('RGB'); a = np.array(rgb).astype(int); h, w, _ = a.shape
    near = (a[:, :, 0] > thr) & (a[:, :, 1] > thr) & (a[:, :, 2] > thr)
    seen = np.zeros((h, w), bool); q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if near[y, x] and not seen[y, x]: seen[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if near[y, x] and not seen[y, x]: seen[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and near[ny, nx] and not seen[ny, nx]: seen[ny, nx] = True; q.append((ny, nx))
    alpha = Image.fromarray(np.where(seen, 0, 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.8))
    out = rgb.convert('RGBA'); out.putalpha(alpha)
    return out


def brand():
    """The full-colour ASSI emblem. Only the logo bitmap is read from page 1 of batch 1.pdf, never its text (student data)."""
    import numpy as np
    doc = pymupdf.open(EMBLEM_PDF)
    best, best_score = None, 0
    for img in doc[0].get_images(full=True):
        pix = pymupdf.Pixmap(doc, img[0])
        if not (200 < pix.width < 320 and 200 < pix.height < 320): continue
        im = Image.open(io.BytesIO(pix.tobytes('png'))).convert('RGB')
        sat = np.array(im.convert('HSV'))[:, :, 1].mean()  # the washed-out watermark copies score low
        if sat > best_score: best, best_score = im, sat
    if best is None: print('emblem not found'); return
    emblem = key_white(best)
    bbox = emblem.getbbox(); emblem = emblem.crop(bbox) if bbox else emblem
    emblem.save(out('public/media/brand/assi-emblem.png'), optimize=True)
    # Favicon: 96 px, 128-colour palette (keeps it ~10 KB; it is fetched on every first visit).
    emblem.resize((96, round(96 * emblem.height / emblem.width)), Image.LANCZOS).quantize(colors=128, method=Image.Quantize.FASTOCTREE).save(out('src/app/icon.png'), optimize=True)
    manifest['assi-emblem'] = dict(src='/media/brand/assi-emblem.png', width=emblem.width, height=emblem.height, blur='', kind='brand')
    print('emblem', emblem.size)


def hero():
    """1200x630 social preview, centre-cropped (never stretched) from the original glass-roof hero photo."""
    src = os.path.join(ROOT, 'legacy-images', 'gHf6FbF3cgMIH3vYkWt4nNdE8EU.jpg')
    if not os.path.exists(src): print('hero original missing: run the legacy download first'); return
    im = Image.open(src).convert('RGB'); target = 1200 / 630
    if im.width / im.height > target:
        w = round(im.height * target); x = (im.width - w) // 2; im = im.crop((x, 0, x + w, im.height))
    else:
        h = round(im.width / target); y = (im.height - h) // 2; im = im.crop((0, y, im.width, y + h))
    im.resize((1200, 630), Image.LANCZOS).save(out('public/og.jpg'), 'JPEG', quality=86)
    manifest.pop('hero-glass-roof', None)
    print('og image from original hero')


LEGACY_DIR = os.path.join(ROOT, 'legacy-images')
# Originals downloaded (with the owner's permission) from the live site's Framer CDN. Scanned letters are
# skipped here because the full set comes from appreciationletters.docx; '8dio2…' is a platform icon.
LEGACY_SKIP = {'8rENETctv6E2iyp51XgJJ9mF2U', 'bDyHD1zkUTCdlZqAw7kPNhBpnIk', 'cQw0J4KrmJGuV5mXpdaoWjq71Ec', 'ZETYWUMHYrWekNIA2ko80KY2QAA',
               'xKHhjtVLiyINikKyqTB15h0x4PI', 'sX0UU2AklU1w8pR60OOp3nUA', '5Momd13z0y8GpUaSXHbM7Bvo8', 'f8kGI5dZ8yC82VW4xF7ClGkgi0',
               'rF4g2lgjIZiZB46Zt4LLWnGO0', 'yqqaUdjWitSG0k5pXJjJwp0zJa0', 'HepVVh6if6KCGDP114TO7t613M', '8dio2diSkOqgfwVLIeHIOuaCs'}


def legacy():
    """Old-site originals -> fr-<id>.webp (photos) and video/<id>.mp4 + poster."""
    import shutil
    n_img = n_vid = 0
    for name in sorted(os.listdir(LEGACY_DIR)):
        stem, ext = os.path.splitext(name)
        src = os.path.join(LEGACY_DIR, name)
        if stem in LEGACY_SKIP: continue
        if ext.lower() == '.mp4':
            import cv2
            shutil.copyfile(src, out('public/media/video', name))
            cap = cv2.VideoCapture(src); cap.set(cv2.CAP_PROP_POS_MSEC, 1500)
            ok, fr = cap.read()
            w = h = 0
            if ok:
                poster = Image.fromarray(cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)); w, h = poster.size
                save_webp(poster, f'media/video/{stem}.webp', 1600, 80)
            manifest[f'video-{stem}'] = dict(src=f'/media/video/{name}', poster=f'/media/video/{stem}.webp', width=w, height=h,
                                            blur=blur_of(poster) if ok else '', kind='video')
            n_vid += 1
            continue
        im = Image.open(src); im.load()
        if im.mode == 'P': im = im.convert('RGBA')
        w, h = save_webp(im, f'media/fr/{stem}.webp', 2400, 84)
        manifest[f'fr-{stem}'] = dict(src=f'/media/fr/{stem}.webp', width=w, height=h, blur=blur_of(im), kind='photo')
        n_img += 1
    print('legacy images', n_img, 'videos', n_vid)


# Owner documents published as downloads: key -> (source, public file name, title shown on the site)
DOCUMENTS = {
    'fee-schedule': (M1 + '1591940806077_AVIATION TRAINING PROGRAMS.pdf', 'aviation-training-programs-fee-schedule.pdf', 'Aviation training programmes: codes, intake, duration and fees'),
    'programme-list': (M1 + 'Aviation Training Programs.pdf', 'aviation-training-programs-list.pdf', 'Aviation training programmes list'),
    'btech-structure': (M1 + 'Syllabus B. Tech Aero Space.pdf', 'btech-aerospace-programme-structure.pdf', 'B.Tech Aerospace Engineering: programme structure'),
    'btech-courses': (M1 + 'Courses And Subjects.pdf', 'btech-courses-and-subjects.pdf', 'B.Tech Aeronautical Engineering: courses and subjects'),
    'ame-syllabus': (M1 + 'SYLLABUS AME.pdf', 'ame-syllabus.pdf', 'AME training manual and syllabus'),
    'ame-mechanical': (M1 + 'Detailed syllabus  mechnical  stream.pdf', 'ame-mechanical-detailed-syllabus.pdf', 'AME mechanical stream: detailed syllabus'),
    'ame-avionics': (M1 + 'Detailed Syllabus(1) aVIONICS.pdf', 'ame-avionics-detailed-syllabus.pdf', 'AME avionics stream: detailed syllabus'),
    'mro': (M1 + 'MRO.pdf', 'aircraft-maintenance-organisation.pdf', 'Aircraft maintenance organisation (MRO)'),
    'check-costs': (M3 + 'COST OF THE MAINTENACE CHEKCS.pdf', 'maintenance-check-costs.pdf', 'Cost of the maintenance checks'),
    'pilot-training': (M1 + 'PILOT TRAINING.pdf', 'pilot-training.pdf', 'Flying Training School: pilot training'),
    'bba-syllabus': (M1 + 'BBA-AVIATION-MANAGEMENT-2019-20.pdf', 'bba-aviation-management-syllabus-2019-20.pdf', 'BBA Aviation Management: regulations and syllabus 2019–20'),
    'mba-syllabus': (M1 + 'M.B.A.Aviation_Management.pdf', 'mba-aviation-management-syllabus-2019-20.pdf', 'MBA Aviation Management: regulations, curriculum and syllabus 2019–20'),
    'disaster-paper': (M1 + 'DISASTER MANAGEMENT.pdf', 'aviation-disaster-management.pdf', 'Aviation disaster management: assessment'),
    'diploma-syllabus': (M1 + 'Diploma Sylabus (I, II, III).pdf', 'diploma-aeronautical-engineering-syllabus.pdf', 'Diploma in Aeronautical Engineering: syllabus, years I–III'),
    'research-centre': (M1 + 'Research and development.pdf', 'research-and-development-centre.pdf', 'Research and Development Centre: guidelines for Organized Research Units'),
    'advisory-committee': (M1 + 'ADVISORY C MEMBERS OF ASSI.pdf', 'advisory-committee-members.pdf', 'Advisory committee members of the Aero Space Society of India'),
    # Blank forms only. 'Audit Form.pdf' asks for card numbers on paper and is deliberately not published.
    'registration-form': (M1 + 'REGISTRATION FORM.pdf', 'registration-form.pdf', 'Registration form'),
    'admission-form': (M1 + 'Certificate Course Admission Form.pdf', 'certificate-course-admission-form.pdf', 'Certificate course admission form'),
}


def documents():
    import shutil
    data = {}
    for key, (src, name, title) in DOCUMENTS.items():
        dst = out('public/documents/programmes', name)
        shutil.copyfile(src, dst)
        data[key] = dict(href=f'/documents/programmes/{name}', title=title, bytes=os.path.getsize(dst), pages=len(pymupdf.open(dst)))
    json.dump(data, open(os.path.join(ROOT, 'src/content/documents.generated.json'), 'w', encoding='utf8'), indent=1, ensure_ascii=False)
    print('documents', len(data))


if __name__ == '__main__':
    steps = sys.argv[1:] or ['letters', 'gallery', 'brand', 'hero', 'legacy', 'documents']
    for s in steps: globals()[s]()
    json.dump(manifest, open(MANIFEST, 'w'), indent=1)
    print('manifest entries', len(manifest))
