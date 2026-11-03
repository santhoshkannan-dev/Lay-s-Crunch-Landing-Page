"""
tools/prep_packs.py
Pillow pipeline to prepare textures and transparent cutouts for all 9 Lay's flavors.
"""

import os
from PIL import Image, ImageDraw, ImageFilter

FLAVORS = [
    {
        "id": "classic",
        "name": "Classic",
        "tagline": "Pure Golden Perfection",
        "color": (245, 184, 0),
        "deep": (140, 106, 0),
        "source": "screen-3",
        "crop": (105, 450, 355, 765),
        "bg_sample": (80, 480) # position on card to sample background color
    },
    {
        "id": "sour-cream",
        "name": "Sour Cream & Onion",
        "tagline": "Zesty & Creamy Crunch",
        "color": (30, 130, 76),
        "deep": (11, 71, 38),
        "source": "screen-3",
        "crop": (460, 450, 710, 765),
        "bg_sample": (430, 480)
    },
    {
        "id": "barbecue",
        "name": "Barbecue",
        "tagline": "Smoky Sweet Heat",
        "color": (36, 30, 28),
        "deep": (158, 56, 17),
        "source": "screen-3",
        "crop": (815, 450, 1065, 765),
        "bg_sample": (790, 480)
    },
    {
        "id": "salt-vinegar",
        "name": "Salt & Vinegar",
        "tagline": "Pucker-Up Crunch",
        "color": (0, 124, 185),
        "deep": (0, 71, 112),
        "source": "screen-3",
        "crop": (1170, 450, 1420, 765),
        "bg_sample": (1145, 480)
    },
    {
        "id": "flamin-hot",
        "name": "Flamin' Hot",
        "tagline": "Intense Spicy Kick",
        "color": (158, 27, 34),
        "deep": (82, 10, 14),
        "source": "screen-3",
        "crop": (1525, 450, 1775, 765),
        "bg_sample": (1500, 480)
    },
    {
        "id": "cheddar-sour-cream",
        "name": "Cheddar & Sour Cream",
        "tagline": "Velvety Sharp Cheese",
        "color": (230, 115, 0),
        "deep": (135, 62, 0),
        "source": "screen-1",
        "crop": (1100, 280, 1305, 600),
        "bg_sample": (1110, 290)
    },
    {
        "id": "all-dressed",
        "name": "All Dressed",
        "tagline": "Legendary Medley",
        "color": (78, 33, 97),
        "deep": (41, 13, 54),
        "source": "screen-1",
        "crop": (1355, 330, 1555, 640),
        "bg_sample": (1360, 340)
    },
    {
        "id": "sweet-southern-heat",
        "name": "Sweet Southern Heat Barbecue",
        "tagline": "Slow-Burn Southern Soul",
        "color": (122, 28, 43),
        "deep": (66, 10, 19),
        "source": "screen-1",
        "crop": (1635, 420, 1795, 680),
        "bg_sample": (1640, 430)
    },
    {
        "id": "bacon-grilled-cheese",
        "name": "Bacon Grilled Cheese",
        "tagline": "Comfort Food Reimagined",
        "color": (175, 133, 82),
        "deep": (105, 73, 36),
        "source": "screen-4",
        "crop": (655, 775, 755, 935),
        "bg_sample": (660, 780)
    }
]

def make_ribbon(width, height=75):
    ribbon = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(ribbon)
    pitch = 8
    for x in range(0, width, pitch):
        for i in range(pitch // 2):
            v = int(140 + 75 * (i / (pitch / 2)))
            draw.line([(x + i, 0), (x + i, height)], fill=(v, v, v, 255))
        for i in range(pitch // 2, pitch):
            v = int(215 - 75 * ((i - pitch / 2) / (pitch / 2)))
            draw.line([(x + i, 0), (x + i, height)], fill=(v, v, v, 255))
    return ribbon

def clean_cutout(img, crop_box, sample_pt):
    cropped = img.crop(crop_box).convert("RGBA")
    w, h = cropped.size
    
    # bg color sample
    bg_col = img.getpixel(sample_pt)[:3]
    pixels = cropped.load()
    mask = Image.new("L", (w, h), 255)
    mp = mask.load()
    
    # Simple edge-aware color keying
    for y in range(h):
        for x in range(w):
            r, g, b, _ = pixels[x, y]
            diff = abs(r - bg_col[0]) + abs(g - bg_col[1]) + abs(b - bg_col[2])
            # also check if bottom shadow or card border
            if diff < 42:
                mp[x, y] = 0
            elif diff < 70:
                mp[x, y] = int(255 * (diff - 42) / (70 - 42))
                
    # Smooth alpha mask
    mask = mask.filter(ImageFilter.GaussianBlur(1.0))
    cropped.putalpha(mask)
    return cropped

def build_bag_texture(flavor, cutout, out_path):
    W, H = 1024, 1536
    art = Image.new("RGB", (W, H), flavor["color"])
    draw = ImageDraw.Draw(art)
    
    # Background radial sheen
    c_base = flavor["color"]
    c_deep = flavor["deep"]
    for y in range(H):
        t = y / H
        r = int(c_base[0] * (1 - t * 0.35) + c_deep[0] * (t * 0.35))
        g = int(c_base[1] * (1 - t * 0.35) + c_deep[1] * (t * 0.35))
        b = int(c_base[2] * (1 - t * 0.35) + c_deep[2] * (t * 0.35))
        draw.line([(0, y), (W, y)], fill=(r, g, b))
        
    # Center glow
    cx, cy = W // 2, int(H * 0.48)
    for rad in range(int(W * 0.65), 0, -8):
        factor = (1.0 - rad / (W * 0.65)) ** 1.5
        gr = min(255, int(c_base[0] + (255 - c_base[0]) * factor * 0.7))
        gg = min(255, int(c_base[1] + (255 - c_base[1]) * factor * 0.7))
        gb = min(255, int(c_base[2] + (255 - c_base[2]) * factor * 0.7))
        draw.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], fill=(gr, gg, gb))

    # Paste resized cutout to cover 92% of bag face
    target_h = int(H * 0.88)
    aspect = cutout.width / cutout.height
    target_w = int(target_h * aspect)
    if target_w < W * 0.9:
        target_w = int(W * 0.95)
        target_h = int(target_w / aspect)
        
    resized = cutout.resize((target_w, target_h), Image.Resampling.LANCZOS)
    bx = (W - target_w) // 2
    by = (H - target_h) // 2
    art.paste(resized, (bx, by), resized)

    # Top & bottom metallic heat seals
    crimp = make_ribbon(W, height=80)
    art.paste(crimp, (0, 0), crimp)
    art.paste(crimp, (0, H - 80), crimp)
    
    draw.line([(0, 80), (W, 80)], fill=(30, 30, 30), width=3)
    draw.line([(0, H - 80), (W, H - 80)], fill=(30, 30, 30), width=3)

    art.save(out_path, quality=95)

def main():
    out_dir = "public/packs"
    os.makedirs(out_dir, exist_ok=True)
    
    screens = {
        "screen-1": Image.open("screenshots/screen-1.png"),
        "screen-3": Image.open("screenshots/screen-3.png"),
        "screen-4": Image.open("screenshots/screen-4.png"),
        "screen-6": Image.open("screenshots/screen-6.png"),
    }
    
    for f in FLAVORS:
        src = screens[f["source"]]
        cutout = clean_cutout(src, f["crop"], f["bg_sample"])
        cut_path = os.path.join(out_dir, f"{f['id']}.png")
        cutout.save(cut_path)
        
        art_path = os.path.join(out_dir, f"{f['id']}_art.jpg")
        build_bag_texture(f, cutout, art_path)
        print(f"Processed {f['name']} -> {cut_path} & {art_path}")

if __name__ == "__main__":
    main()
