"""Draw original DNA base and fragment cards (512 px transparent PNG)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = Path(__file__).parent / "assets" / "characters"
OUT.mkdir(parents=True, exist_ok=True)
FONT = "C:/Windows/Fonts/arialbd.ttf"
BIG = ImageFont.truetype(FONT, 225)
MID = ImageFont.truetype(FONT, 50)
SMALL = ImageFont.truetype(FONT, 32)

PALETTES = [
    ("#f9af8e", "#b45c48", "#693a32"),  # A and T: warm pair
    ("#f6c0a6", "#c47453", "#724536"),
    ("#9fdfdc", "#3d989f", "#1f5964"),  # C and G: cool pair
    ("#a8d4ed", "#4d86ac", "#2b5274"),
    ("#b8e6cf", "#4a9b82", "#245b53"),
    ("#b8dae9", "#5789a8", "#2b5267"),
    ("#d3c7f1", "#8169b2", "#4b416d"),
    ("#f3dda2", "#b69146", "#685634"),
]

def draw_base(draw, letter, dark):
    draw.text((256, 244), letter, font=BIG, fill=dark, anchor="mm", stroke_width=2)

def draw_fragment(draw, length, accent, dark):
    rung_count = length
    spacing = 44 if rung_count <= 4 else 22
    top = int(248 - (rung_count - 1) * spacing / 2)
    bottom = top + (rung_count - 1) * spacing
    draw.line([(179, top - 26), (179, bottom + 26)], fill=dark, width=17)
    draw.line([(333, top - 26), (333, bottom + 26)], fill=dark, width=17)
    for i in range(rung_count):
        y = top + i * spacing
        draw.rounded_rectangle((186, y-9, 326, y+9), radius=8, fill=accent)
        draw.ellipse((169, y-16, 191, y+16), fill=dark)
        draw.ellipse((321, y-16, 343, y+16), fill=dark)
    if length == 8:
        draw.ellipse((239, 116, 273, 150), fill="#ffffff", outline=dark, width=4)

for level, (light, accent, dark) in enumerate(PALETTES, 1):
    im = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    shadow = Image.new("RGBA", im.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.ellipse((66, 76, 458, 468), fill=(12, 31, 45, 96))
    im.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(19)))
    d = ImageDraw.Draw(im)
    d.ellipse((50, 48, 454, 452), fill=light, outline=accent, width=17)
    d.arc((74, 72, 430, 428), 210, 320, fill="#ffffff", width=11)
    d.ellipse((92, 90, 414, 412), outline="#ffffff", width=4)
    if level <= 4:
        draw_base(d, "ATCG"[level-1], dark)
        partner = "TAGC"[level-1]
        d.rounded_rectangle((180, 357, 332, 412), radius=24, fill=dark)
        d.text((256, 384), f"↔ {partner}", font=SMALL, fill="#ffffff", anchor="mm")
    else:
        length = 2 ** (level - 5)
        draw_fragment(d, length, accent, dark)
        d.rounded_rectangle((162, 356, 350, 414), radius=25, fill=dark)
        d.text((256, 384), f"{length} bp", font=MID, fill="#ffffff", anchor="mm")
    im.save(OUT / f"lv{level}.png", optimize=True)
print("Generated 8 DNA cards")
