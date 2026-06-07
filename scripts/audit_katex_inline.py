"""
Audit: ekspresi matematika seharusnya dibungkus inline KaTeX $ ... $.

Memeriksa string di foundation-micro-authoring-pack.json (math):
- Jumlah '$' harus genap (pasangan delimiter inline).
- Di luar segmen $...$, tidak boleh ada pola yang seperti notasi pangkat/LaTeX umum.

Jalankan:
  python scripts/audit_katex_inline.py
  python scripts/audit_katex_inline.py --json   # keluaran satu objek JSON
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Tuple

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "03 Foundation MIcro" / "math"

# Pola di *luar* $...$ yang dianggap perlu KaTeX (bisa ditambah jika perlu).
OUTSIDE_MATH_PATTERNS: List[Tuple[str, re.Pattern[str]]] = [
    ("digit_brace_power", re.compile(r"\d+\^\{")),  # 2^{4}, 5^{2}
    ("digit_caret_digit", re.compile(r"\d+\^\d")),  # 2^4 (tanpa kurung kurawal)
    ("paren_then_brace_pow", re.compile(r"\([^)]+\)\^\{")),  # (2+3)^{2}
    ("latex_command", re.compile(r"\\(frac|sqrt|cdot|times|pm|mp|leq|geq|neq)\b")),
    ("subscript_brace", re.compile(r"_\{")),  # x_{1}
    ("double_backslash_align", re.compile(r"\\\\")),  # baris align di luar $
]

SKIP_PATH_SUBSTRINGS = (
    "/node_modules/",
    ".git/",
)


def dollar_segments(s: str) -> Tuple[bool, List[str]]:
    """
    Return (balanced, outside_segments).
    outside_segments = teks di luar pasangan $...$ bergantian.
    """
    if not s:
        return True, [""]
    parts = s.split("$")
    if len(parts) % 2 == 0:
        return False, []
    outside = [parts[i] for i in range(0, len(parts), 2)]
    return True, outside


def find_issues_in_string(s: str) -> List[Tuple[str, str]]:
    """List of (code, snippet) for one string."""
    issues: List[Tuple[str, str]] = []
    if "$" not in s and not any(p.search(s) for _, p in OUTSIDE_MATH_PATTERNS):
        return issues

    ok, outside = dollar_segments(s)
    if not ok:
        issues.append(("unbalanced_dollar", s[:120]))
        return issues

    blob = "\n".join(outside)
    for name, pat in OUTSIDE_MATH_PATTERNS:
        m = pat.search(blob)
        if m:
            start = max(0, m.start() - 20)
            end = min(len(blob), m.end() + 40)
            issues.append((f"outside_math:{name}", blob[start:end].replace("\n", " | ")))
    return issues


def walk(value: Any, path: str, hits: List[Dict[str, Any]]) -> None:
    if isinstance(value, dict):
        for k, v in value.items():
            walk(v, f"{path}.{k}" if path else k, hits)
    elif isinstance(value, list):
        for i, v in enumerate(value):
            walk(v, f"{path}[{i}]", hits)
    elif isinstance(value, str):
        for code, snip in find_issues_in_string(value):
            hits.append({"path": path, "code": code, "snippet": snip, "full_len": len(value)})


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", action="store_true", help="Print JSON report to stdout")
    args = parser.parse_args()

    if not BASE.is_dir():
        print("BASE missing:", BASE, file=sys.stderr)
        return 2

    files = sorted(BASE.glob("**/foundation-micro-authoring-pack.json"))
    report: Dict[str, Any] = {
        "base": str(BASE),
        "files_checked": len(files),
        "files_with_issues": 0,
        "issue_count": 0,
        "items": [],
    }

    for path in files:
        rel = str(path.relative_to(ROOT))
        if any(skip in rel.replace("\\", "/") for skip in SKIP_PATH_SUBSTRINGS):
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        file_hits: List[Dict[str, Any]] = []
        walk(data, "", file_hits)
        if file_hits:
            report["files_with_issues"] += 1
            report["issue_count"] += len(file_hits)
            report["items"].append({"file": rel, "hits": file_hits})

    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print("files_checked", report["files_checked"])
        print("files_with_issues", report["files_with_issues"])
        print("issue_count", report["issue_count"])
        for block in report["items"]:
            print("\n##", block["file"])
            for h in block["hits"]:
                print(f"  - [{h['code']}] {h['path']}")
                print(f"    …{h['snippet']}…")

    return 1 if report["issue_count"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
