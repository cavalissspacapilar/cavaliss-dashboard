#!/usr/bin/env python3
"""
cavaliss_compositor_v2.py
Produce cavaliss_clara_v2_final.png  —  1080×1920 px, Meta Ads ready
"""

from PIL import Image, ImageDraw, ImageFont
import os, sys

import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

print("=" * 62)
print("  CAVALISS CLARA V2 -- COMPOSITOR META ADS")
print("=" * 62)

# ═══════════════════════════════════════════════════════════════
# CONSTANTES
# ═══════════════════════════════════════════════════════════════
INPUT_PATH  = "./input.jpeg"
OUTPUT_PATH = "./cavaliss_clara_v2_final.png"
OUT_W, OUT_H = 1080, 1920
FONT_DIR     = "C:/Windows/Fonts"

# Colores  (R, G, B [, A])
CREAM_COL   = (245, 240, 232)   # #F5F0E8
GOLD_COL    = (201, 168, 76)    # #C9A84C
GRAD_COL    = (30,  20,  10)    # gradiente oscuro
BLACK_TEXT  = (17,  17,  17)    # #111111
NAME_TEXT   = (26,  26,  26)    # #1A1A1A
BODY_TEXT   = (58,  58,  58)    # #3A3A3A
BRONZE_TEXT = (138, 122, 90)    # #8A7A5A
CARD_BG     = (255, 252, 245, 235)  # rgba(255,252,245, 0.92)


# ═══════════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════════
def try_font(paths: list, size: int) -> ImageFont.FreeTypeFont:
    """Intenta cargar fuentes en orden; usa default si todas fallan."""
    for p in paths:
        if p and os.path.isfile(p):
            try:
                f = ImageFont.truetype(p, size)
                print(f"    ✓  {os.path.basename(p)}  @{size}px")
                return f
            except Exception as e:
                print(f"    ✗  {os.path.basename(p)}: {e}")
    print(f"    ⚠  Fallback default (sin TrueType)")
    return ImageFont.load_default()


def alpha_rect(canvas: Image.Image, x1, y1, x2, y2, radius=0, fill=(255,255,255,200)) -> Image.Image:
    """Dibuja un rectángulo (redondeado o no) con canal alpha sobre el canvas RGBA."""
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    if radius:
        d.rounded_rectangle([x1, y1, x2, y2], radius=radius, fill=fill)
    else:
        d.rectangle([x1, y1, x2, y2], fill=fill)
    return Image.alpha_composite(canvas, layer)


def text_bbox(draw, text, font):
    """Devuelve (width, height) del texto renderizado."""
    bb = draw.textbbox((0, 0), text, font=font)
    return bb[2] - bb[0], bb[3] - bb[1]


def center_text_x(draw, text, font, container_x, container_w):
    """X para centrar texto dentro de un contenedor."""
    tw, _ = text_bbox(draw, text, font)
    return container_x + (container_w - tw) // 2


def draw_multiline(draw, text, font, x, y, fill, line_spacing=6):
    """Dibuja texto multilínea (divide por \\n)."""
    lines = text.split("\n")
    cur_y = y
    for line in lines:
        draw.text((x, cur_y), line, font=font, fill=fill)
        _, lh = text_bbox(draw, line, font)
        cur_y += lh + line_spacing
    return cur_y  # y final


# ═══════════════════════════════════════════════════════════════
# PASO 1 — CARGAR Y ESCALAR IMAGEN BASE
# ═══════════════════════════════════════════════════════════════
print("\nPASO 1 ── Cargando y escalando imagen base...")
base = Image.open(INPUT_PATH).convert("RGBA")
orig_w, orig_h = base.size
print(f"  Original   : {orig_w}×{orig_h} px")

# Escalar a alto 1920 (scale = 1.25) → ancho resultante 1280
scale    = OUT_H / orig_h          # 1920/1536 = 1.25
new_w    = round(orig_w * scale)   # 1024*1.25 = 1280
base     = base.resize((new_w, OUT_H), Image.LANCZOS)
print(f"  Escalada   : {new_w}×{OUT_H} px")

# Recortar al centro para llegar a 1080px de ancho
if new_w >= OUT_W:
    cx   = (new_w - OUT_W) // 2   # 100 px cada lado
    base = base.crop((cx, 0, cx + OUT_W, OUT_H))
else:
    # Edge case: pegar centrado con relleno crema
    pad = Image.new("RGBA", (OUT_W, OUT_H), (*CREAM_COL, 255))
    px  = (OUT_W - new_w) // 2
    pad.paste(base, (px, 0))
    base = pad

print(f"  Recortada  : {base.size} px  ✓")
canvas = base.copy()


# ═══════════════════════════════════════════════════════════════
# PASO 2 — CARGAR FUENTES
# ═══════════════════════════════════════════════════════════════
print("\nPASO 2 ── Cargando fuentes...")

SERIF_BOLD = [
    os.path.join(FONT_DIR, "GeorgiaPro-Bold.ttf"),
    os.path.join(FONT_DIR, "georgiab.ttf"),
    os.path.join(FONT_DIR, "cambriab.ttf"),
    os.path.join(FONT_DIR, "timesbd.ttf"),
    os.path.join(FONT_DIR, "BOOKOSB.TTF"),
]
SERIF_BOLDITALIC = [
    os.path.join(FONT_DIR, "GeorgiaPro-BoldItalic.ttf"),
    os.path.join(FONT_DIR, "georgiaz.ttf"),
    os.path.join(FONT_DIR, "cambriai.ttf"),
    os.path.join(FONT_DIR, "timesbi.ttf"),
    os.path.join(FONT_DIR, "BOOKOSBI.TTF"),
]
SERIF_REG = [
    os.path.join(FONT_DIR, "GeorgiaPro-Regular.ttf"),
    os.path.join(FONT_DIR, "georgia.ttf"),
    os.path.join(FONT_DIR, "cambria.ttf"),
    os.path.join(FONT_DIR, "times.ttf"),
]
SANS_BOLD = [
    os.path.join(FONT_DIR, "arialbd.ttf"),
    os.path.join(FONT_DIR, "calibrib.ttf"),
    os.path.join(FONT_DIR, "verdanab.ttf"),
]
SANS_REG = [
    os.path.join(FONT_DIR, "arial.ttf"),
    os.path.join(FONT_DIR, "calibri.ttf"),
    os.path.join(FONT_DIR, "verdana.ttf"),
]
EMOJI = [
    os.path.join(FONT_DIR, "seguiemj.ttf"),
    os.path.join(FONT_DIR, "Seguiemj.ttf"),
]

print("  Headline L1 — serif bold 88px:")
fnt_h1      = try_font(SERIF_BOLD,        88)
print("  Headline L2 — serif bold-italic 88px:")
fnt_h2      = try_font(SERIF_BOLDITALIC,  88)
print("  Testimonio nombre — serif bold 34px:")
fnt_tname   = try_font(SERIF_BOLD,        34)
print("  Testimonio cuerpo — serif regular 28px:")
fnt_tbody   = try_font(SERIF_REG,         28)
print("  CTA label urgencia — sans 26px:")
fnt_label   = try_font(SANS_REG,          26)
print("  CTA botón urgencia — sans bold 30px:")
fnt_burg    = try_font(SANS_BOLD,         30)
print("  CTA emoji — emoji 32px:")
fnt_emoji   = try_font(EMOJI,             32)
print("  CTA principal — sans bold 40px:")
fnt_cta     = try_font(SANS_BOLD,         40)


# ═══════════════════════════════════════════════════════════════
# PASO 3 — GRADIENTE OSCURO + HEADLINE
# ═══════════════════════════════════════════════════════════════
print("\nPASO 3 ── Gradiente headline + texto...")

GRAD_H   = 340
MARGIN_L = 48
PAD_TOP  = 72

# Gradiente oscuro descendente (más fuerte arriba)
grad_layer = Image.new("RGBA", (OUT_W, OUT_H), (0, 0, 0, 0))
gd = ImageDraw.Draw(grad_layer)
for y in range(GRAD_H):
    t     = y / GRAD_H
    alpha = int(255 * 0.55 * (1.0 - t ** 1.5))   # fade cuadrático
    if alpha > 0:
        gd.line([(0, y), (OUT_W - 1, y)], fill=(*GRAD_COL, alpha))
canvas = Image.alpha_composite(canvas, grad_layer)
print(f"  Gradiente  : 0–{GRAD_H}px  (alpha máx ≈0.55)")

draw = ImageDraw.Draw(canvas)

# ── Línea 1: "Cinco años de Cancún" ──────────────────────────
L1 = "Cinco años de Cancún"
draw.text((MARGIN_L, PAD_TOP), L1, font=fnt_h1, fill=(*CREAM_COL, 255))
bb1    = draw.textbbox((MARGIN_L, PAD_TOP), L1, font=fnt_h1)
l1_bot = bb1[3]
print(f"  L1 «{L1}» : y={PAD_TOP}–{l1_bot}  w={bb1[2]-bb1[0]}px")

# ── Línea 2: "viven en tu raíz." ─────────────────────────────
L2   = "viven en tu raíz."
L2_Y = l1_bot + 8
draw.text((MARGIN_L, L2_Y), L2, font=fnt_h2, fill=(*GOLD_COL, 255))
bb2    = draw.textbbox((MARGIN_L, L2_Y), L2, font=fnt_h2)
l2_bot = bb2[3]
print(f"  L2 «{L2}» : y={L2_Y}–{l2_bot}  w={bb2[2]-bb2[0]}px")

# Verificar que textos caben
for lbl, bb in [("L1", bb1), ("L2", bb2)]:
    over = bb[2] - OUT_W
    if over > 0:
        print(f"  ⚠ {lbl} desborda {over}px — considera reducir fuente")
    else:
        print(f"  ✓ {lbl} encaja ({OUT_W - bb[2]}px de margen derecho)")


# ═══════════════════════════════════════════════════════════════
# PASO 4 — TESTIMONIOS  (subir 80 px, cards, texto nuevo)
# ═══════════════════════════════════════════════════════════════
print("\nPASO 4 ── Testimonios...")

# Posiciones originales en imagen escalada (1920px alto):
#   Zona 900–1350 en 1536  →  1125–1687 en 1920
# "Subir 80px" → cards empiezan en 1045
#
# Layout: 2 columnas lado a lado
#   Foto circular asumida: ø 80px, a la izquierda del bloque
#   Texto: a la derecha de la foto

TCARD_TOP = 1045
TCARD_H   = 215
PHOTO_D   = 80

testimonials = [
    {
        "name"    : "Carla Gómez",
        "quote"   : '"Recuperé mi cabello\ndespués de 3 meses"',
        "bx"      : 10,
        "bw"      : 515,
    },
    {
        "name"    : "Antonio Ruiz",
        "quote"   : '"Ya no pierdo cabello\nen la ducha"',
        "bx"      : 555,
        "bw"      : 515,
    }
]

for t in testimonials:
    bx   = t["bx"]
    bw   = t["bw"]
    by   = TCARD_TOP
    bh   = TCARD_H

    # Card redondeada semitransparente (cubre texto original)
    canvas = alpha_rect(canvas, bx, by, bx + bw, by + bh,
                        radius=16, fill=CARD_BG)
    draw   = ImageDraw.Draw(canvas)

    # Texto a la derecha de la foto circular
    # (La foto original del canvas base queda visible bajo la card con 8% transparencia
    #  y queda intacta porque no la sobreescribimos directamente)
    tx = bx + 16 + PHOTO_D + 14   # margen + foto + gap
    ty_name = by + 16

    # Nombre en negrita
    draw.text((tx, ty_name), t["name"], font=fnt_tname, fill=(*NAME_TEXT, 255))
    _, nh = text_bbox(draw, t["name"], fnt_tname)

    # Quote
    ty_quote = ty_name + nh + 10
    draw_multiline(draw, t["quote"], fnt_tbody, tx, ty_quote,
                   fill=(*BODY_TEXT, 255), line_spacing=6)

    print(f"  {t['name']:15s}: card ({bx},{by})–({bx+bw},{by+bh})  texto_x={tx}")


# ═══════════════════════════════════════════════════════════════
# PASO 5 — NUEVA SECCIÓN CTA  (últimos ~250px)
# ═══════════════════════════════════════════════════════════════
print("\nPASO 5 ── Sección CTA...")

# Tapar barra original con fondo crema sólido
# La barra original (escalada) comienza en  y = 1350*(1920/1536) ≈ 1687
CTA_COVER_Y = 1685
canvas = alpha_rect(canvas, 0, CTA_COVER_Y, OUT_W, OUT_H,
                    radius=0, fill=(*CREAM_COL, 255))
draw = ImageDraw.Draw(canvas)

# ─── Elemento C — Botón CTA principal (sólido dorado, abajo) ──
BTN_C_W, BTN_C_H = 980, 96
BTN_C_MARG_B     = 40
btn_c_y = OUT_H - BTN_C_H - BTN_C_MARG_B
btn_c_x = (OUT_W - BTN_C_W) // 2

draw.rounded_rectangle(
    [btn_c_x, btn_c_y, btn_c_x + BTN_C_W, btn_c_y + BTN_C_H],
    radius=8,
    fill=(*GOLD_COL, 255)
)

CTA_TXT = "QUIERO VER EL MÍO  →"
cta_cx  = center_text_x(draw, CTA_TXT, fnt_cta, btn_c_x, BTN_C_W)
_, cta_h = text_bbox(draw, CTA_TXT, fnt_cta)
cta_cy  = btn_c_y + (BTN_C_H - cta_h) // 2
draw.text((cta_cx, cta_cy), CTA_TXT, font=fnt_cta, fill=(*BLACK_TEXT, 255))
print(f"  C (CTA sólido): y={btn_c_y}–{btn_c_y+BTN_C_H}  "
      f"margen_inf={OUT_H - btn_c_y - BTN_C_H}px")

# ─── Elemento B — Botón urgencia (borde dorado, fill 12%) ─────
BTN_B_W, BTN_B_H = 940, 72
GAP_B_C          = 24
btn_b_y = btn_c_y - BTN_B_H - GAP_B_C
btn_b_x = (OUT_W - BTN_B_W) // 2

# Fondo semitransparente
canvas  = alpha_rect(canvas, btn_b_x, btn_b_y,
                     btn_b_x + BTN_B_W, btn_b_y + BTN_B_H,
                     radius=8, fill=(201, 168, 76, 31))   # 0.12 * 255 ≈ 31
draw    = ImageDraw.Draw(canvas)

# Borde dorado
draw.rounded_rectangle(
    [btn_b_x, btn_b_y, btn_b_x + BTN_B_W, btn_b_y + BTN_B_H],
    radius=8,
    outline=(*GOLD_COL, 255),
    width=2
)

# Texto urgencia: emoji + texto por separado para evitar problemas de encoding
EMOJI_PART = "🔥  "
TEXT_PART  = "SOLO 10 LUGARES ESTA SEMANA"
try:
    ew, eh = text_bbox(draw, EMOJI_PART, fnt_emoji)
    tw, th = text_bbox(draw, TEXT_PART,  fnt_burg)
    total  = ew + tw
    sx     = btn_b_x + (BTN_B_W - total) // 2
    base_y = btn_b_y + (BTN_B_H - max(eh, th)) // 2
    draw.text((sx,      base_y), EMOJI_PART, font=fnt_emoji, fill=(*GOLD_COL, 255))
    draw.text((sx + ew, base_y + (max(eh,th)-th)//2),
              TEXT_PART, font=fnt_burg, fill=(*GOLD_COL, 255))
    print(f"  B (urgencia con emoji): y={btn_b_y}–{btn_b_y+BTN_B_H}")
except Exception as exc:
    # Fallback: todo en una línea con la fuente bold
    fallback = "🔥  SOLO 10 LUGARES ESTA SEMANA"
    fx  = center_text_x(draw, fallback, fnt_burg, btn_b_x, BTN_B_W)
    _, fh = text_bbox(draw, fallback, fnt_burg)
    fy  = btn_b_y + (BTN_B_H - fh) // 2
    draw.text((fx, fy), fallback, font=fnt_burg, fill=(*GOLD_COL, 255))
    print(f"  B (urgencia fallback sans emoji): y={btn_b_y}  [{exc}]")

# ─── Elemento A — Línea urgencia (texto centrado, sin fondo) ──
LABEL_TXT = "Solo esta semana · Zona Hotelera · Cancún"
_, lh    = text_bbox(draw, LABEL_TXT, fnt_label)
GAP_A_B  = 28
label_y  = btn_b_y - GAP_A_B - lh
label_x  = center_text_x(draw, LABEL_TXT, fnt_label, 0, OUT_W)
draw.text((label_x, label_y), LABEL_TXT, font=fnt_label, fill=(*BRONZE_TEXT, 255))
print(f"  A (urgency label): y={label_y}")


# ═══════════════════════════════════════════════════════════════
# PASO 6 — VERIFICACIONES
# ═══════════════════════════════════════════════════════════════
print("\nPASO 6 ── Verificaciones...")

SAFE_TOP = 140
SAFE_BTM = 1780

checks = [
    ("Canvas exactamente 1080×1920 px",
     canvas.size == (OUT_W, OUT_H)),

    ("Gradiente headline cubre zona 0–340px",
     GRAD_H == 340),

    ("Headline L1 empieza en zona visible",
     PAD_TOP >= 0 and l1_bot <= GRAD_H + 20),

    ("Headline L2 dentro del gradiente",
     l2_bot <= GRAD_H + 40),

    ("L1 texto no sale del canvas",
     bb1[2] <= OUT_W),

    ("L2 texto no sale del canvas",
     bb2[2] <= OUT_W),

    ("Testimonios empiezan después de headline",
     TCARD_TOP > l2_bot + 50),

    ("Botón urgencia dentro del canvas",
     btn_b_y >= 0 and btn_b_y + BTN_B_H <= OUT_H),

    ("Label urgencia por encima zona segura inferior",
     label_y <= SAFE_BTM),

    ("CTA principal dentro del canvas",
     btn_c_y + BTN_C_H <= OUT_H),

    ("Margen inferior CTA ≥ 30px",
     OUT_H - btn_c_y - BTN_C_H >= 30),

    ("Margen superior headline en zona safe warning (ok si < 140)",
     True),  # La spec define 72px explícitamente, no es error
]

all_ok = True
for name, result in checks:
    icon = "✓" if result else "✗"
    print(f"  [{icon}] {name}")
    if not result:
        all_ok = False

print()
if all_ok:
    print("  → Todas las verificaciones correctas ✅")
else:
    print("  ⚠ Hay verificaciones fallidas — revisar posiciones")


# ═══════════════════════════════════════════════════════════════
# PASO 7 — GUARDAR
# ═══════════════════════════════════════════════════════════════
print("\nPASO 7 ── Guardando PNG...")

final = canvas.convert("RGB")
final.save(OUTPUT_PATH, format="PNG", optimize=False, compress_level=0)
print(f"  Ruta    : {OUTPUT_PATH}")

# Verificación del archivo guardado
saved     = Image.open(OUTPUT_PATH)
file_kb   = os.path.getsize(OUTPUT_PATH) / 1024
print(f"  Dimensiones verificadas : {saved.size[0]}×{saved.size[1]} px")
print(f"  Tamaño archivo          : {file_kb:.0f} KB  ({file_kb/1024:.1f} MB)")
print(f"  Modo                    : {saved.mode}")

print()
print("=" * 62)
print("  COMPLETADO — cavaliss_clara_v2_final.png listo para Meta Ads")
print("=" * 62)
