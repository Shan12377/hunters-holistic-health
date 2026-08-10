#!/usr/bin/env python3
"""
Burn headline text onto a challenge ad image.

Text is composited, not AI generated, so it is always spelled correctly and
always crisp. Generated lettering garbles often enough that it is not worth
the risk on a public ad.

Run:  python3 scripts/add-ad-text.py
Out:  public/images/ai/ad-final-*.jpg
"""

from PIL import Image, ImageDraw, ImageFont
import os

BASE_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'images', 'ai')
SOURCE = os.path.join(BASE_DIR, 'ad-hook-a.jpg')

# logo-mark.png has real transparency. logo.png has a solid white background and
# would render as a white box on the dark band.
LOGO = os.path.join(os.path.dirname(__file__), '..', 'public', 'logo-mark.png')

CHALLENGE_NAME = 'FREE 14-DAY FLAT BELLY CHALLENGE'
STARTS_LINE = 'STARTS MONDAY, AUGUST 10'
URL_LINE = 'huntersholistichealth.com/flat-belly-challenge'

# Exact brand tokens from src/styles/tokens.css. Do not eyeball these.
GOLD = (200, 167, 75)        # --gold        #c8a74b
TEAL = (11, 158, 142)        # --teal        #0B9E8E
BRAND_DARK = (20, 68, 69)    # --bg-page     #144445
WHITE = (247, 247, 245)

FONT_CANDIDATES = [
    '/System/Library/Fonts/Supplemental/Impact.ttf',
    '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
    '/System/Library/Fonts/Supplemental/Georgia Bold.ttf',
]

# Instagram feed is 4:5. The source is 2:3, so it gets cropped to fit.
TARGET_W, TARGET_H = 1080, 1350


def load_font(size):
    for path in FONT_CANDIDATES:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def fit_font(draw, text, max_width, start_size):
    """Shrink until the line actually fits. Text running off the edge is worse
    than text being a little smaller."""
    size = start_size
    while size > 10:
        font = load_font(size)
        if draw.textbbox((0, 0), text, font=font)[2] <= max_width:
            return font
        size -= 2
    return load_font(10)


def strip_white_bg(logo, thresh=30):
    """
    logo-mark.png carries a solid white plate behind the emblem, which renders
    as a white box on a dark band. Flood fill inward from the corners so only
    the background is removed and any white inside the mark survives.
    """
    rgb = logo.convert('RGB')
    w, h = rgb.size
    marker = (255, 0, 255)
    probe = rgb.copy()
    for corner in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        ImageDraw.floodfill(probe, corner, marker, thresh=thresh)

    out = logo.convert('RGBA')
    px_probe = probe.load()
    px_out = out.load()
    for y in range(h):
        for x in range(w):
            if px_probe[x, y] == marker:
                px_out[x, y] = (0, 0, 0, 0)
    return out


def crop_to_ratio(img, w, h):
    """Center-crop horizontally, favour the top so the face is never cut."""
    target_ratio = w / h
    src_ratio = img.width / img.height
    if src_ratio > target_ratio:
        new_w = int(img.height * target_ratio)
        left = (img.width - new_w) // 2
        img = img.crop((left, 0, left + new_w, img.height))
    else:
        new_h = int(img.width / target_ratio)
        img = img.crop((0, 0, img.width, new_h))
    return img.resize((w, h), Image.LANCZOS)


def add_scrim(img, height_frac=0.42):
    """Dark gradient at the top so light text stays readable over any photo."""
    scrim = Image.new('L', (1, img.height), 0)
    px = scrim.load()
    band = int(img.height * height_frac)
    for y in range(img.height):
        px[0, y] = int(215 * (1 - y / band)) if y < band else 0
    scrim = scrim.resize(img.size)
    overlay = Image.new('RGB', img.size, BRAND_DARK)
    return Image.composite(overlay, img, scrim.point(lambda v: v))


def draw_headline(img, lines, accent_last=True):
    draw = ImageDraw.Draw(img)
    size = int(img.width * 0.155)
    font = load_font(size)
    margin = int(img.width * 0.07)
    y = int(img.height * 0.055)

    for i, line in enumerate(lines):
        colour = GOLD if (accent_last and i == len(lines) - 1) else WHITE
        # Soft drop shadow keeps the type legible if the scrim is ever removed.
        draw.text((margin + 3, y + 3), line, font=font, fill=(0, 0, 0))
        draw.text((margin, y), line, font=font, fill=colour)
        y += int(size * 1.02)
    return img


def add_footer(img, lift=0.045):
    """
    Bottom band carrying the offer: what it is, when it starts, where to go.
    The headline is the hook; this band is the instruction. Without it nobody
    knows the challenge is called Flat Belly or how to join.
    """
    draw = ImageDraw.Draw(img)
    w, h = img.size

    margin = int(w * 0.06)
    line_gap = int(w * 0.016)
    logo_size = int(w * 0.145)
    # Width left for text once the logo and both margins are taken out.
    avail = w - margin * 2 - logo_size - int(w * 0.035)

    f_name = fit_font(draw, CHALLENGE_NAME, avail, int(w * 0.058))
    f_when = fit_font(draw, STARTS_LINE, avail, int(w * 0.037))
    f_url = fit_font(draw, URL_LINE, avail, int(w * 0.034))

    name_h = draw.textbbox((0, 0), CHALLENGE_NAME, font=f_name)[3]
    when_h = draw.textbbox((0, 0), STARTS_LINE, font=f_when)[3]
    url_h = draw.textbbox((0, 0), URL_LINE, font=f_url)[3]

    text_block = name_h + when_h + url_h + line_gap * 2
    band_h = max(text_block, logo_size) + int(h * 0.035)
    band_top = h - band_h - int(h * lift)

    # Solid band so the offer stays readable over any photo underneath.
    draw.rectangle([0, band_top, w, h], fill=BRAND_DARK)
    draw.rectangle([0, band_top, w, band_top + int(h * 0.004)], fill=GOLD)

    logo_x = margin
    logo_y = band_top + (band_h - logo_size) // 2
    if os.path.exists(LOGO):
        # The mark sits on a white plate, so present it as a deliberate white
        # circle badge. Keying the white out leaves the emblem muddy on dark.
        badge = Image.new('RGBA', (logo_size, logo_size), (0, 0, 0, 0))
        ImageDraw.Draw(badge).ellipse([0, 0, logo_size - 1, logo_size - 1], fill=(255, 255, 255, 255))
        inner = int(logo_size * 0.82)
        logo = Image.open(LOGO).convert('RGBA').resize((inner, inner), Image.LANCZOS)
        off = (logo_size - inner) // 2
        badge.paste(logo, (off, off), logo)
        img.paste(badge, (logo_x, logo_y), badge)
        text_x = logo_x + logo_size + int(w * 0.035)
    else:
        text_x = margin

    y = band_top + (band_h - text_block) // 2
    draw.text((text_x, y), CHALLENGE_NAME, font=f_name, fill=WHITE)
    y += name_h + line_gap
    draw.text((text_x, y), STARTS_LINE, font=f_when, fill=GOLD)
    y += when_h + line_gap
    draw.text((text_x, y), URL_LINE, font=f_url, fill=WHITE)
    return img




# (file, headline lines, width, height)
# 1080x1350 is Instagram feed. 1080x1920 is WhatsApp Status and Stories, which
# run full screen, so the footer needs to sit above the reply bar.
VARIANTS = [
    ('ad-final-1.jpg', ['NOT CALORIES.', 'CORTISOL.'], 1080, 1350),
    ('ad-final-2.jpg', ['EATING CLEAN.', 'STILL STUCK.'], 1080, 1350),
    ('ad-final-3.jpg', ['IT IS NOT', 'WILLPOWER.'], 1080, 1350),
    ('ad-status-1.jpg', ['NOT CALORIES.', 'CORTISOL.'], 1080, 1920),
    ('ad-status-2.jpg', ['EATING CLEAN.', 'STILL STUCK.'], 1080, 1920),
    ('ad-status-3.jpg', ['NOT CALORIES.', 'STRESS.'], 1080, 1920),
]


def main():
    if not os.path.exists(SOURCE):
        raise SystemExit(f'Source image missing: {SOURCE}')

    for filename, lines, w, h in VARIANTS:
        img = Image.open(SOURCE).convert('RGB')
        img = crop_to_ratio(img, w, h)
        img = add_scrim(img)
        img = draw_headline(img, lines)
        # Status is full screen, so lift the footer clear of the reply bar.
        img = add_footer(img, lift=0.085 if h == 1920 else 0.03)
        out = os.path.join(BASE_DIR, filename)
        img.save(out, 'JPEG', quality=92)
        print(f'saved {filename}  {w}x{h}  {os.path.getsize(out) // 1024} KB')


if __name__ == '__main__':
    main()
