from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "ips-psb-sm-exam-set-3"
OUT.mkdir(exist_ok=True)


def font(size: int, bold: bool = False):
    names = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibrib.ttf" if bold else "C:/Windows/Fonts/calibri.ttf",
    ]
    for name in names:
        if Path(name).exists():
            return ImageFont.truetype(name, size)
    return ImageFont.load_default()


def number(draw, xy, value):
    x, y = xy
    draw.ellipse((x - 24, y - 24, x + 24, y + 24), fill="white", outline="black", width=3)
    text = str(value)
    box = draw.textbbox((0, 0), text, font=font(25, True))
    draw.text((x - (box[2] - box[0]) / 2, y - (box[3] - box[1]) / 2 - 2), text, fill="black", font=font(25, True))


def draw_se_asia():
    im = Image.new("RGB", (1200, 850), "white")
    d = ImageDraw.Draw(im)
    d.text((40, 25), "Peta Asia Tenggara", fill="black", font=font(38, True))

    mainland = [(230, 120), (350, 90), (450, 160), (470, 260), (540, 310), (510, 410),
                (440, 390), (390, 470), (330, 420), (300, 320), (240, 260)]
    d.polygon(mainland, fill="#eeeeee", outline="black", width=4)
    d.line([(330, 120), (340, 390)], fill="black", width=2)
    d.line([(390, 150), (390, 390)], fill="black", width=2)
    d.line([(340, 270), (505, 270)], fill="black", width=2)
    d.line([(390, 330), (500, 350)], fill="black", width=2)
    d.polygon([(270, 455), (390, 470), (480, 510), (420, 540), (300, 510)], fill="#eeeeee", outline="black", width=4)
    d.polygon([(250, 550), (470, 590), (600, 650), (430, 680), (260, 625)], fill="#eeeeee", outline="black", width=4)
    d.polygon([(520, 500), (730, 460), (830, 560), (720, 650), (540, 620)], fill="#eeeeee", outline="black", width=4)
    d.polygon([(850, 390), (890, 360), (920, 450), (900, 540), (860, 500)], fill="#eeeeee", outline="black", width=4)
    for x, y in [(820, 420), (950, 500), (930, 570), (880, 590), (1000, 530), (980, 620)]:
        d.ellipse((x - 12, y - 18, x + 12, y + 18), fill="#eeeeee", outline="black", width=2)
    for x in range(610, 930, 55):
        d.ellipse((x, 700 + (x % 3) * 5, x + 38, 718 + (x % 3) * 5), fill="#eeeeee", outline="black", width=2)

    positions = {1: (280, 190), 2: (360, 300), 3: (420, 210), 4: (455, 335), 5: (500, 395),
                 6: (370, 500), 7: (520, 660), 8: (915, 510), 9: (735, 490), 10: (850, 735)}
    for n, xy in positions.items():
        number(d, xy, n)
    d.text((40, 795), "Nomor menunjukkan wilayah negara-negara Asia Tenggara.", fill="black", font=font(25))
    im.save(OUT / "question-64.png")


def draw_asia():
    im = Image.new("RGB", (1200, 800), "white")
    d = ImageDraw.Draw(im)
    d.text((40, 25), "Peta Benua Asia", fill="black", font=font(38, True))
    asia = [(120, 360), (180, 250), (300, 180), (430, 120), (650, 100), (900, 130),
            (1080, 240), (1000, 390), (900, 430), (840, 570), (710, 630), (600, 540),
            (520, 650), (430, 520), (330, 590), (260, 460)]
    d.polygon(asia, fill="#eeeeee", outline="black", width=5)
    d.line([(350, 210), (420, 520)], fill="#bbbbbb", width=2)
    d.line([(530, 130), (560, 540)], fill="#bbbbbb", width=2)
    d.line([(730, 120), (710, 530)], fill="#bbbbbb", width=2)
    d.line([(880, 160), (850, 430)], fill="#bbbbbb", width=2)
    d.polygon([(410, 520), (500, 700), (560, 620), (520, 500)], fill="#eeeeee", outline="black", width=3)
    d.polygon([(690, 520), (760, 680), (830, 590), (790, 480)], fill="#eeeeee", outline="black", width=3)
    d.polygon([(990, 360), (1040, 390), (1020, 500), (975, 460)], fill="#eeeeee", outline="black", width=3)

    positions = {1: (225, 405), 2: (390, 345), 3: (500, 545), 4: (690, 315), 5: (1010, 420)}
    for n, xy in positions.items():
        number(d, xy, n)
    d.text((40, 745), "Penanda 1-5 menunjukkan wilayah yang dibandingkan pada soal.", fill="black", font=font(25))
    im.save(OUT / "question-68.png")


def draw_megaliths():
    im = Image.new("RGB", (1200, 900), "white")
    d = ImageDraw.Draw(im)
    d.text((40, 25), "Peninggalan Megalitikum", fill="black", font=font(38, True))

    # Menhir
    d.polygon([(90, 330), (145, 125), (205, 115), (240, 330)], fill="#cccccc", outline="black", width=4)
    d.text((115, 350), "Menhir", fill="black", font=font(25, True))
    # Dolmen
    d.rectangle((330, 200, 540, 250), fill="#bbbbbb", outline="black", width=4)
    d.polygon([(350, 250), (400, 250), (390, 335), (345, 335)], fill="#cccccc", outline="black", width=4)
    d.polygon([(470, 250), (520, 250), (530, 335), (480, 335)], fill="#cccccc", outline="black", width=4)
    d.text((390, 350), "Dolmen", fill="black", font=font(25, True))
    # Waruga
    d.rectangle((680, 205, 850, 335), fill="#cccccc", outline="black", width=4)
    d.polygon([(665, 205), (765, 140), (865, 205)], fill="#bbbbbb", outline="black", width=4)
    d.text((720, 350), "Waruga", fill="black", font=font(25, True))
    # Sarkofagus
    d.rounded_rectangle((160, 545, 490, 680), radius=60, fill="#cccccc", outline="black", width=4)
    d.arc((165, 500, 485, 640), 180, 360, fill="black", width=5)
    d.text((250, 700), "Sarkofagus", fill="black", font=font(25, True))
    # Punden berundak
    for i, box in enumerate([(680, 620, 1050, 700), (730, 540, 1000, 620), (790, 470, 940, 540)]):
        d.rectangle(box, fill=["#dddddd", "#cccccc", "#bbbbbb"][i], outline="black", width=4)
    d.text((755, 720), "Punden Berundak", fill="black", font=font(25, True))
    im.save(OUT / "question-72.png")


def draw_portrait():
    source = Image.open(ROOT / "_tmp_ips_smp3_pages" / "page_07.png").convert("L")
    # Crop only the portrait from the scanned reference, then reconstruct it as clean line art.
    crop = source.crop((720, 570, 1230, 1110))
    crop = ImageOps.autocontrast(crop)
    crop = crop.filter(ImageFilter.MedianFilter(3))
    crop = ImageEnhance.Contrast(crop).enhance(1.8)
    crop = crop.point(lambda p: 255 if p > 150 else 20)
    crop = ImageOps.fit(crop, (650, 650), method=Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (900, 820), "white")
    canvas.paste(crop.convert("RGB"), (125, 80))
    d = ImageDraw.Draw(canvas)
    d.rectangle((120, 75, 780, 735), outline="black", width=4)
    d.text((245, 755), "Sugondo Djojopuspito", fill="black", font=font(29, True))
    canvas.save(OUT / "question-74.png")


if __name__ == "__main__":
    draw_se_asia()
    draw_asia()
    draw_megaliths()
    draw_portrait()
    print(f"Generated assets in {OUT}")
