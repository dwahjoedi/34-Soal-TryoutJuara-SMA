"""
Perbaikan massal KaTeX inline ($...$) di foundation-micro-authoring-pack.json (math).

Konvensi:
- Teks biasa (question, rationale, diagnosis, micro_lesson, ...): bungkus tiap
  \\frac{a}{b}, (..)^{n}, dan N^{k} yang belum berada di dalam $...$.
- Opsi (array options): jika mengandung \\frac, seluruh string opsi dibungkus
  tepat satu pasang $...$ (termasuk rantai perbandingan pecahan).

Setelah ini, jalankan ulang:
  python scripts/align_microloop_distractors.py
agar diagnosis yang menyalin cuplikan soal ikut konsisten.

Usage:
  python scripts/wrap_katex_mass.py        # tulis perubahan
  python scripts/wrap_katex_mass.py --dry-run
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any, List, Tuple

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "03 Foundation MIcro" / "math"
ALIGN = ROOT / "scripts" / "align_microloop_distractors.py"

FRAC = re.compile(r"\\frac\{[^{}]+\}\{[^{}]+\}")
PAREN_POW = re.compile(r"\([^)]*\)\^\{[^}]+\}")
DIGIT_POW = re.compile(r"\d+\^\{[^}]+\}")


def balanced_dollars(s: str) -> bool:
    return s.count("$") % 2 == 0


def transform_outside_math(s: str, fn) -> str:
    """Panggil fn hanya pada segmen di luar pasangan $...$."""
    if "$" not in s:
        return fn(s)
    parts = s.split("$")
    if len(parts) % 2 == 0:
        return s
    for i in range(0, len(parts), 2):
        parts[i] = fn(parts[i])
    return "$".join(parts)


def wrap_math_fragments_segment(seg: str) -> str:
    """Bungkus pola LaTeX umum di satu segmen 'luar math'."""
    if not seg:
        return seg

    def wrap(pat: re.Pattern[str], text: str) -> str:
        out = []
        pos = 0
        for m in pat.finditer(text):
            out.append(text[pos : m.start()])
            inner = m.group(0)
            if inner.startswith("$") and inner.endswith("$"):
                out.append(inner)
            else:
                out.append(f"${inner}$")
            pos = m.end()
        out.append(text[pos:])
        return "".join(out)

    # Urutan: pecahan -> kuadrat bentuk (..)^{n} -> N^{n}
    seg = wrap(FRAC, seg)
    seg = wrap(PAREN_POW, seg)
    seg = wrap(DIGIT_POW, seg)
    return seg


def fix_text_field(s: str) -> str:
    if not isinstance(s, str) or not s.strip():
        return s
    if not balanced_dollars(s):
        return s
    return transform_outside_math(s, wrap_math_fragments_segment)


def fix_option_string(s: str) -> str:
    if not isinstance(s, str):
        return s
    t = s.strip()
    if not t:
        return s
    if not balanced_dollars(s):
        return s
    if "\\frac" in t:
        if t.startswith("$") and t.endswith("$"):
            return s
        return f"${t}$"
    if DIGIT_POW.search(t) or PAREN_POW.search(t):
        return fix_text_field(s)
    return s


TEXT_KEYS = frozenset(
    {"question", "rationale", "diagnosis", "micro_lesson", "explanation"}
)


def visit(obj: Any, stats: List[int]) -> None:
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k == "options" and isinstance(v, list):
                for i, item in enumerate(v):
                    if isinstance(item, str):
                        newv = fix_option_string(item)
                        if newv != item:
                            stats[0] += 1
                            v[i] = newv
            elif isinstance(v, str) and k in TEXT_KEYS:
                newv = fix_text_field(v)
                if newv != v:
                    stats[0] += 1
                    obj[k] = newv
            else:
                visit(v, stats)
    elif isinstance(obj, list):
        for el in obj:
            visit(el, stats)


def process_file(path: Path, dry: bool) -> Tuple[bool, int]:
    data = json.loads(path.read_text(encoding="utf-8"))
    stats = [0]
    visit(data, stats)
    n = stats[0]
    if n == 0:
        return False, 0
    if not dry:
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return True, n


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--no-align", action="store_true", help="Jangan panggil align_microloop_distractors.py")
    args = ap.parse_args()

    if not BASE.is_dir():
        print("BASE missing:", BASE, file=sys.stderr)
        return 2

    files = sorted(BASE.glob("**/foundation-micro-authoring-pack.json"))
    changed_files = 0
    edits = 0
    for path in files:
        ch, n = process_file(path, args.dry_run)
        if ch:
            changed_files += 1
            edits += n
            print(("would change " if args.dry_run else "changed "), n, "strings\t", path.relative_to(ROOT))

    print("summary files", len(files), "changed", changed_files, "string_edits", edits)

    if not args.dry_run and not args.no_align and edits and ALIGN.is_file():
        print("running", ALIGN.name)
        subprocess.run([sys.executable, str(ALIGN)], check=False)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
