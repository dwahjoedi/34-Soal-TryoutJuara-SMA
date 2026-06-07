"""
Audit setiap opsi salah: diagnosis vs opsi, struktur microLoop, dan sinkron dengan
generator di align_microloop_distractors.build_rule_for_wrong.

Jalankan dari root proyek:
  python scripts/audit_microloop_distractors.py
  python scripts/audit_microloop_distractors.py --rows   # satu baris per opsi salah
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Tuple

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "03 Foundation MIcro" / "math"
ALIGN_SCRIPT = Path(__file__).resolve().parent / "align_microloop_distractors.py"


def load_align_module():
    spec = importlib.util.spec_from_file_location("align_microloop_distractors", ALIGN_SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError("Cannot load align_microloop_distractors.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def diagnosis_mentions_wrong_option(diagnosis: str, wrong_label: str) -> bool:
    """Diagnosis harus merujuk teks opsi yang salah (angka/teks)."""
    if not diagnosis or not wrong_label:
        return False
    w = wrong_label.strip()
    if w in diagnosis:
        return True
    # Angka mungkin muncul sebagai "Memilih 8" vs "Jawaban 8" — pastikan token angka ada
    if re.fullmatch(r"-?\d+", w):
        return bool(re.search(rf"\b{re.escape(w)}\b", diagnosis))
    # Pecahan / LaTeX ringkas
    digits = re.sub(r"\D+", "", w)
    if len(digits) >= 2 and digits in re.sub(r"\D+", "", diagnosis):
        return True
    return False


def audit_question(
    align: Any,
    rel_path: str,
    q: dict,
) -> List[Tuple[str, str, str, str]]:
    """
    Return list of (severity, code, question_id, detail).
    severity: ERROR | WARN
    """
    issues: List[Tuple[str, str, str, str]] = []
    qid = q.get("questionId", "?")
    opts = q.get("options") or []
    ans = q.get("answer")
    question = q.get("question", "")
    ml = q.get("microLoop") or {}
    rules: Dict[str, Any] = ml.get("distractor_rules") or {}

    if ans is None or not isinstance(ans, int) or not (0 <= ans < len(opts)):
        issues.append(("ERROR", "bad_answer_index", qid, f"answer={ans!r} len_options={len(opts)}"))
        return issues

    wrong_idxs = [i for i in range(len(opts)) if i != ans]
    for wi in wrong_idxs:
        key = str(wi)
        wrong_label = opts[wi].strip()
        correct_label = opts[ans].strip()
        stored = rules.get(key)

        if not isinstance(stored, dict):
            issues.append(
                ("ERROR", "missing_distractor_rule", qid, f"wrong_index={wi} key={key!r}")
            )
            continue

        for field in ("error_tag", "error_type", "diagnosis", "micro_lesson", "retry_question"):
            if field not in stored:
                issues.append(
                    ("ERROR", "incomplete_rule", qid, f"wrong_index={wi} missing_field={field}")
                )

        rq = stored.get("retry_question")
        if isinstance(rq, dict):
            if "question" not in rq or "options" not in rq or "answer" not in rq:
                issues.append(
                    ("ERROR", "bad_retry_question", qid, f"wrong_index={wi} retry_keys={list(rq)}")
                )
            else:
                ropts = rq.get("options") or []
                rans = rq.get("answer")
                if not isinstance(rans, int) or not (0 <= rans < len(ropts)):
                    issues.append(
                        ("ERROR", "bad_retry_answer", qid, f"wrong_index={wi} answer={rans!r}")
                    )

        diag = stored.get("diagnosis") or ""
        if isinstance(diag, str) and not diagnosis_mentions_wrong_option(diag, wrong_label):
            issues.append(
                (
                    "WARN",
                    "diagnosis_missing_wrong_label",
                    qid,
                    f"wrong_index={wi} wrong={wrong_label!r} diagnosis_snip={diag[:100]!r}",
                )
            )

        try:
            expected = align.build_rule_for_wrong(question, opts, ans, wi)
        except Exception as e:
            issues.append(("ERROR", "rebuild_failed", qid, f"wrong_index={wi} err={e!r}"))
            continue

        if stored != expected:
            issues.append(
                (
                    "WARN",
                    "drift_from_generator",
                    qid,
                    f"wrong_index={wi} stored_tag={stored.get('error_tag')!r} "
                    f"expected_tag={expected.get('error_tag')!r}",
                )
            )

    # Aturan indeks yang tidak seharusnya ada
    for k in rules:
        if not k.isdigit():
            continue
        if int(k) == ans:
            issues.append(("WARN", "rule_on_correct_index", qid, f"index={k} is correct answer"))
        elif int(k) < 0 or int(k) >= len(opts):
            issues.append(("ERROR", "rule_index_out_of_range", qid, f"index={k}"))

    return issues


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--rows",
        action="store_true",
        help="Cetak satu baris ringkas per opsi salah (untuk skim manual).",
    )
    parser.add_argument(
        "--max-rows",
        type=int,
        default=0,
        help="Dengan --rows: batasi jumlah baris (0 = tanpa batas).",
    )
    args = parser.parse_args()

    if not BASE.is_dir():
        print("BASE missing:", BASE, file=sys.stderr)
        return 2

    align = load_align_module()
    files = sorted(BASE.glob("**/foundation-micro-authoring-pack.json"))

    all_issues: List[Tuple[str, str, str, str, str]] = []
    row_lines: List[str] = []

    stop_rows = False
    for path in files:
        if stop_rows:
            break
        rel = str(path.relative_to(ROOT))
        data = json.loads(path.read_text(encoding="utf-8"))
        for q in data.get("main_questions", []):
            if stop_rows:
                break
            qid = q.get("questionId", "?")
            opts = q.get("options") or []
            ans = q.get("answer")
            if ans is None or not isinstance(ans, int) or not (0 <= ans < len(opts)):
                continue

            for sev, code, qid2, detail in audit_question(align, rel, q):
                all_issues.append((sev, rel, qid2, code, detail))

            rules = (q.get("microLoop") or {}).get("distractor_rules") or {}
            for wi in range(len(opts)):
                if wi == ans:
                    continue
                key = str(wi)
                st = rules.get(key, {})
                tag = st.get("error_tag", "?")
                diag = (st.get("diagnosis") or "").replace("\n", " ")
                if len(diag) > 100:
                    diag = diag[:97] + "..."
                wrong = opts[wi].strip()
                correct = opts[ans].strip()
                ok_label = (
                    diagnosis_mentions_wrong_option(st.get("diagnosis") or "", wrong)
                    if isinstance(st.get("diagnosis"), str)
                    else False
                )
                try:
                    exp = align.build_rule_for_wrong(
                        q.get("question", ""), opts, ans, wi
                    )
                    sync = st == exp
                except Exception:
                    sync = False
                if args.rows:
                    row_lines.append(
                        f"{qid}\twrong[{wi}]={wrong}\tright={correct}\t"
                        f"tag={tag}\tmentions_wrong={ok_label}\t"
                        f"sync_with_script={sync}\t{diag}"
                    )
                    if args.max_rows and len(row_lines) >= args.max_rows:
                        stop_rows = True
                        break

    err = sum(1 for s, *_ in all_issues if s == "ERROR")
    warn = sum(1 for s, *_ in all_issues if s == "WARN")
    print("files", len(files))
    print("issues_total", len(all_issues), "errors", err, "warnings", warn)

    if args.rows:
        print("\n# questionId\twrong\tright\ttag\tmentions_wrong\tsync_with_script\tdiagnosis...")
        for line in row_lines:
            print(line)

    if all_issues:
        print("\n# detail (severity path questionId code — detail)")
        for sev, rel, qid, code, detail in all_issues:
            print(f"{sev}\t{rel}\t{qid}\t{code}\t{detail}")

    return 1 if err else 0


if __name__ == "__main__":
    raise SystemExit(main())
