#!/usr/bin/env python3
"""
Print-ready one page checklist for the 14-Day Flat Belly Challenge.

Deliberately does NOT print the daily actions. Only the lesson titles and a blank
line. The checklist is a container; the morning email fills it in. That is what
keeps people opening the email, and it means the page can be given away publicly
without giving away the program.

Run:  python3 scripts/make-challenge-checklist.py
Out:  public/flat-belly-challenge-checklist.pdf (and .png for preview)
"""

from PIL import Image, ImageDraw, ImageFont
import os, random

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public')

# Her social palette, not the app's dark palette. Confirmed 2026-08-10.
TEAL_PRIMARY = (11, 110, 110)     # #0B6E6E
TEAL_SECOND = (11, 158, 142)      # #0B9E8E
GOLD = (200, 168, 75)             # #C8A84B
GOLD_DARK = (168, 137, 58)        # #A8893A, readable gold on light
LINEN = (245, 242, 235)
LINEN_WEAVE = (232, 227, 218)

AVENIR = '/System/Library/Fonts/Avenir Next.ttc'
IDX = {'bold': 0, 'demi': 2, 'medium': 5, 'regular': 7}

W, H = 2550, 3300  # US Letter at 300 dpi
M = 210            # margin, roughly 10 percent safe zone


def font(weight, size):
    return ImageFont.truetype(AVENIR, size, index=IDX[weight])


def linen_background():
    """Warm linen with a visible weave. The texture is the point: it reads as
    paper rather than a screen."""
    img = Image.new('RGB', (W, H), LINEN)
    d = ImageDraw.Draw(img)
    random.seed(7)
    for y in range(0, H, 4):
        if random.random() < 0.55:
            d.line([(0, y), (W, y)], fill=LINEN_WEAVE, width=1)
    for x in range(0, W, 4):
        if random.random() < 0.35:
            d.line([(x, 0), (x, H)], fill=LINEN_WEAVE, width=1)
    return img


HABITS = [
    'Three breaths before every meal',
    '30g protein at your first meal',
    'In bed by 10:15',
    'One inflammation swap',
    'Dead bug (from Day 5)',
]

# Titles only. Never the actions.
DAYS = [
    'The Cortisol Belly Connection',
    'Protein First. Always.',
    'Sleep Is Not Optional',
    'Hidden Inflammation',
    'One Exercise, Not One Hundred Crunches',
    'Minerals, Water, and Gut Transit',
    'Week One Review',
    'The Plate and the Insulin Switch',
    'Probiotics, Prebiotics, and Your Liver',
    'Why It Changed After 40',
    'Why You Wake Up Hungry',
    'The Post-Meal Walk and Your Trigger',
    'The Hormone Everyone Is Injecting',
    'What You Built',
]


def main():
    img = linen_background()
    d = ImageDraw.Draw(img)
    y = M

    # ---- Title ----
    d.text((M, y), '14-DAY FLAT BELLY CHALLENGE', font=font('bold', 78), fill=TEAL_PRIMARY)
    y += 108
    d.text((M, y), 'Daily Checklist', font=font('regular', 50), fill=TEAL_SECOND)
    y += 88
    d.rectangle([M, y, W - M, y + 6], fill=GOLD)
    y += 74

    # ---- Standing habits with a 14 day streak grid ----
    d.text((M, y), 'THE FIVE HABITS', font=font('demi', 38), fill=TEAL_PRIMARY)
    y += 62

    box, gap = 40, 14
    grid_w = 14 * box + 13 * gap
    grid_x = W - M - grid_w

    dn = font('regular', 24)
    for i in range(14):
        x = grid_x + i * (box + gap)
        d.text((x + 10, y - 34), str(i + 1), font=dn, fill=TEAL_SECOND)

    f_habit = font('regular', 34)
    for h in HABITS:
        d.text((M, y + 4), h, font=f_habit, fill=TEAL_PRIMARY)
        for i in range(14):
            x = grid_x + i * (box + gap)
            d.rectangle([x, y, x + box, y + box], outline=TEAL_SECOND, width=2)
        y += box + 22

    y += 40
    d.rectangle([M, y, W - M, y + 3], fill=GOLD)
    y += 66

    # ---- The 14 days: title and a blank line they fill in ----
    d.text((M, y), 'YOUR 14 DAYS', font=font('demi', 38), fill=TEAL_PRIMARY)
    d.text((M + 420, y + 8), 'Write your action from each morning email', font=font('regular', 28), fill=TEAL_SECOND)
    y += 66

    f_day = font('bold', 34)
    f_title = font('demi', 32)
    f_line = font('regular', 26)
    row = 116

    for i, title in enumerate(DAYS, start=1):
        d.text((M, y), f'DAY {i}', font=f_day, fill=GOLD_DARK)
        d.text((M + 170, y), title, font=f_title, fill=TEAL_PRIMARY)

        # the blank line they write on
        ly = y + 74
        d.line([(M + 170, ly), (W - M - 90, ly)], fill=TEAL_SECOND, width=2)
        d.text((M + 176, ly - 42), "Today's action:", font=f_line, fill=(150, 170, 168))

        # checkbox
        bs = 52
        bx = W - M - bs
        d.rectangle([bx, y + 24, bx + bs, y + 24 + bs], outline=TEAL_PRIMARY, width=3)
        y += row

    y += 20
    d.rectangle([M, y, W - M, y + 3], fill=GOLD)
    y += 62

    # ---- Measurements ----
    # Waist leads. Weight is optional and labelled that way, because cortisol
    # swings water weight several pounds day to day and the scale discourages
    # people before the tape has had a chance to move.
    d.text((M, y), 'YOUR NUMBERS', font=font('demi', 38), fill=TEAL_PRIMARY)
    d.text((M + 400, y + 8), 'Same time each morning, after the bathroom, before eating',
           font=font('regular', 28), fill=TEAL_SECOND)
    y += 78

    f_m = font('regular', 32)
    f_sm = font('regular', 26)
    seg = (W - 2 * M) // 3

    for row_label, note, extra in [('Waist', '', 0), ('Weight', 'optional', 76)]:
        yy = y + extra
        d.text((M, yy), row_label, font=f_m, fill=TEAL_PRIMARY)
        if note:
            d.text((M + 150, yy + 8), note, font=f_sm, fill=(150, 170, 168))
        for i, label in enumerate(['Day 1', 'Day 7', 'Day 14']):
            x = M + 300 + i * (seg - 40)
            d.text((x, yy), label, font=f_sm, fill=TEAL_SECOND)
            d.line([(x + 110, yy + 40), (x + seg - 190, yy + 40)], fill=TEAL_SECOND, width=2)
    y += 76

    # ---- Footer, stacked vertically, centred, no logo ----
    # Positioned below the measurement block, never overlapping it.
    fy = max(y + 130, H - M - 190)
    foot = [
        ('Dr. Shallanda Hunter, PharmD, MBA, CFNMP', font('demi', 28)),
        ("Hunter's Holistic Health", font('regular', 26)),
        ('huntersholistichealth.com', font('regular', 26)),
        ('For educational purposes only. Not medical advice.', font('regular', 24)),
    ]
    for text, f in foot:
        tw = d.textbbox((0, 0), text, font=f)[2]
        d.text(((W - tw) // 2, fy), text, font=f, fill=(90, 130, 128))
        fy += 40

    os.makedirs(OUT_DIR, exist_ok=True)
    pdf = os.path.join(OUT_DIR, 'flat-belly-challenge-checklist.pdf')
    png = os.path.join(OUT_DIR, 'flat-belly-challenge-checklist.png')
    img.save(pdf, 'PDF', resolution=300.0)
    img.save(png, 'PNG')
    print('saved', pdf, f'{os.path.getsize(pdf)//1024} KB')
    print('saved', png, f'{os.path.getsize(png)//1024} KB')


if __name__ == '__main__':
    main()
