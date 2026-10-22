"""Write the editable birthday card with local artwork and an embedded font."""
from pathlib import Path
from base64 import b64encode

root = Path(__file__).resolve().parents[1]
font = b64encode((root / 'assets/display.ttf').read_bytes()).decode()
parts = [f'''<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440" viewBox="0 0 1080 1440" role="img" aria-labelledby="title desc">
<title id="title">Happy birthday ma</title>
<desc id="desc">A birthday card with a floral wreath, a bouquet tied with a pink ribbon, and a short message of love.</desc>
<defs><style>@font-face{{font-family:Birthday;src:url(data:font/ttf;base64,{font})}}text{{font-family:Birthday,Georgia,serif;text-anchor:middle}}</style></defs>
<rect width="1080" height="1440" fill="#241525"/>
<rect x="30" y="30" width="1020" height="1380" rx="10" fill="none" stroke="#b78c9f"/>
<rect x="44" y="44" width="992" height="1352" rx="5" fill="none" stroke="#b78c9f" stroke-opacity=".35"/>
<path d="M166 1200Q-40 700 190 170M914 1200Q1120 700 890 170" fill="none" stroke="#8d9e7c" stroke-width="3"/>
''']
for side in (-1, 1):
    for i in range(15):
        y = 220 + i * 65
        x = 105 + ((y - 720) / 650) ** 2 * 90
        if side == 1:
            x = 1080 - x
        parts.append(f'<ellipse cx="{x}" cy="{y}" rx="11" ry="28" fill="{["#8b9a7c", "#b3b996"][i % 2]}" transform="rotate({side * (35 if i % 2 else -40)} {x} {y})"/>')
        if i % 3 == 0:
            parts.append(f'<circle cx="{x + side * 22}" cy="{y - 24}" r="5" fill="#dcaac0"/>')
for x, y, size in [(540, 150, 16), (240, 470, 10), (840, 470, 10), (290, 760, 8), (800, 770, 8), (540, 1340, 10)]:
    parts.append(f'<path d="M{x} {y-size}Q{x+3} {y-3} {x+size} {y}Q{x+3} {y+3} {x} {y+size}Q{x-3} {y+3} {x-size} {y}Q{x-3} {y-3} {x} {y-size}Z" fill="#ead6ae"/>')
parts.append('''<text x="540" y="290" font-size="108" fill="#f6edf7">Happy</text>
<text x="540" y="420" font-size="108" fill="#f6edf7">birthday ma,</text>
<path d="M390 470Q540 505 690 470" fill="none" stroke="#b47c98" stroke-width="2"/>
<text x="540" y="560" font-size="35" fill="#ead6ae">Thank you for all the love you give.</text>
<text x="540" y="615" font-size="35" fill="#ead6ae">Today, we celebrate you.</text>
<text x="540" y="680" font-size="29" fill="#e0b5c9">We love you and miss you, always.</text>
''')
for x, y, color, petals in [(330, 865, '#d898b4', 8), (430, 775, '#e6c183', 9), (560, 830, '#bd7199', 7), (690, 790, '#b7a0ce', 8), (770, 935, '#edc6d6', 6)]:
    parts.append(f'<path d="M540 1175Q{x} 1020 {x} {y}" fill="none" stroke="#93a48b" stroke-width="4"/>')
    for i in range(petals):
        angle = i * 360 / petals
        parts.append(f'<ellipse cx="{x}" cy="{y-35}" rx="21" ry="39" fill="{color}" transform="rotate({angle} {x} {y})"/>')
    parts.append(f'<circle cx="{x}" cy="{y}" r="20" fill="#ead6ae"/><circle cx="{x}" cy="{y}" r="12" fill="none" stroke="#93704f" stroke-width="2" stroke-dasharray="2 5"/>')
parts.append('''<g fill="#7e9476"><path d="M500 1080Q400 1070 400 1000Q480 1010 500 1080ZM570 1100Q590 1000 650 1010Q660 1070 570 1100ZM520 1130Q435 1140 430 1085Q490 1080 520 1130Z"/></g>
<path d="M540 1160Q435 1080 435 1140Q435 1190 540 1160Q650 1085 647 1145Q640 1200 540 1160M540 1160l-52 65m52-65 50 65" fill="none" stroke="#edc6d6" stroke-width="9" stroke-linecap="round"/>

<text x="540" y="1380" font-family="Arial,sans-serif" font-size="22" letter-spacing="3" fill="#ead6ae">OCTOBER 22</text>
</svg>''')
(root / 'assets/birthday-card.svg').write_text('\n'.join(parts), encoding='utf-8')
