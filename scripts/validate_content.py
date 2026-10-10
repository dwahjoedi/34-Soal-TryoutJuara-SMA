"""Read-only structural validator for question-bank sets and Foundation Micro packs.

Usage (from the repository root):
    python -X utf8 scripts/validate_content.py <file-or-folder> [...]
    python -X utf8 scripts/validate_content.py            # every set and pack in the repo
    python -X utf8 scripts/validate_content.py --summary  # one line per file

Detects the artifact type per file: a question-bank array or `tryoutjuara.question-bank`
envelope, or a Foundation Micro pack (object with `main_questions`). Never writes files.
Exit code 1 when any ERROR is found, 0 otherwise. WARN lines flag likely problems or legacy
patterns that need human judgement. Passing this script does not prove answers are correct,
pedagogy is sound, or the TryoutJuara importer will render the item.
"""
from __future__ import annotations

import argparse
import collections
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TAXONOMY = ROOT / "question-bank-metadata-taxonomy.json"
DEFAULT_DIRS = ["01 Soal Math", "02 Soal BhsInd", "03 Soal IPA", "04 Soal IPS", "05 Soal English"]
MICRO_DIR = "03 Foundation Micro"
FLAT_FIELDS = ["subject", "difficulty", "topic", "subtopic", "skill_type", "question_type",
               "tags", "is_active", "question", "options", "answer", "rationale"]
KNOWN_EXTRA = {"content", "id", "image"}
RICH_KEYS = {"question", "questionRich", "options", "optionsRich", "answer", "rationale", "rationaleRich"}
DIFFICULTIES = {"easy", "medium", "hard"}
ERROR_TYPES = {"concept", "careless", "strategy", "representation"}
RULE_FIELDS = ["error_tag", "error_type", "diagnosis", "micro_lesson", "retry_question"]

# Characters produced when a KaTeX backslash was not escaped (\f, \b, \v, \a, \t, \r).
BROKEN_ESCAPE = re.compile(r"[\x07\x08\x0b\x0c]|\t(?:imes|ext\{|heta|frac)|\r(?:ightarrow|ho\b)")
OVER_ESCAPED = re.compile(r"\\\\(?:frac|sqrt|times|cdot|div|pi|text|le|ge|neq|circ)\b")
HTML_TAG = re.compile(r"</?(?:b|i|u|br|p|div|span|sup|sub|strong|em|table|tr|td)\b[^>]*>", re.I)


def load_taxonomy() -> dict:
    subjects = json.loads(TAXONOMY.read_text(encoding="utf-8"))["subjects"]
    out = {}
    for name, spec in subjects.items():
        out[name] = {
            "pairs": {(t["name"], s) for t in spec["topics"] for s in t["subtopics"]},
            "topics": {t["name"] for t in spec["topics"]},
            "skill": {x["value"] for x in spec["skill_types"]},
            "qtype": {x["value"] for x in spec["question_types"]},
        }
    return out


class Report:
    def __init__(self, path: Path):
        self.path = path
        self.errors: list[str] = []
        self.warns: list[str] = []

    def err(self, where: str, msg: str) -> None:
        self.errors.append(f"{where}: {msg}")

    def warn(self, where: str, msg: str) -> None:
        self.warns.append(f"{where}: {msg}")


def iter_strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for v in value:
            yield from iter_strings(v)
    elif isinstance(value, dict):
        for v in value.values():
            yield from iter_strings(v)


def check_text(rep: Report, where: str, value, is_math: bool) -> None:
    for s in iter_strings(value):
        if BROKEN_ESCAPE.search(s):
            rep.err(where, f"broken LaTeX escape / control char near {BROKEN_ESCAPE.search(s).group()!r}")
        if OVER_ESCAPED.search(s):
            rep.err(where, f"over-escaped LaTeX {OVER_ESCAPED.search(s).group()!r} (parsed text must have one backslash)")
        if HTML_TAG.search(s):
            rep.err(where, f"HTML tag {HTML_TAG.search(s).group()!r}")
        if is_math and s.replace("\\$", "").count("$") % 2:
            rep.warn(where, "odd number of '$' delimiters")


def check_options_answer(rep: Report, where: str, options, answer) -> None:
    if not isinstance(options, list) or len(options) < 2 or not all(isinstance(o, str) and o.strip() for o in options):
        rep.err(where, "options must be a list of >=2 non-empty strings")
        return
    if len(options) != 4:
        rep.warn(where, f"{len(options)} options (four is the norm)")
    if len({o.strip() for o in options}) != len(options):
        rep.err(where, "duplicate options")
    if type(answer) is not int or not 0 <= answer < len(options):
        rep.err(where, f"answer {answer!r} is not a zero-based index into options")


def check_metadata(rep: Report, where: str, q: dict, tax: dict, skill_key: str, qtype_key: str) -> str | None:
    subject = q.get("subject")
    spec = tax.get(subject)
    if not spec:
        rep.err(where, f"unknown subject {subject!r}")
        return None
    if q.get("difficulty") not in DIFFICULTIES:
        rep.err(where, f"difficulty {q.get('difficulty')!r}")
    pair = (q.get("topic"), q.get("subtopic"))
    if pair not in spec["pairs"]:
        kind = "subtopic not under topic" if pair[0] in spec["topics"] else "unknown topic"
        rep.err(where, f"{kind}: {pair[0]!r} / {pair[1]!r}")
    if q.get(skill_key) not in spec["skill"]:
        rep.err(where, f"{skill_key} {q.get(skill_key)!r} not in taxonomy for {subject}")
    if q.get(qtype_key) not in spec["qtype"]:
        rep.err(where, f"{qtype_key} {q.get(qtype_key)!r} not in taxonomy for {subject}")
    tags = q.get("tags")
    if not isinstance(tags, list) or not all(isinstance(t, str) for t in tags):
        rep.err(where, "tags must be an array of strings")
    return subject


def check_rich_table(rep: Report, where: str, doc) -> bool:
    has_table = False
    for node in (doc or {}).get("content", []) if isinstance(doc, dict) else []:
        if node.get("type") != "table":
            continue
        has_table = True
        widths = set()
        for r_i, row in enumerate(node.get("content", [])):
            cells = row.get("content", [])
            widths.add(len(cells))
            want = "tableHeader" if r_i == 0 else "tableCell"
            for cell in cells:
                if cell.get("type") != want:
                    rep.warn(where, f"table row {r_i} uses {cell.get('type')} (expected {want})")
                    break
            for t in iter_text_nodes(row):
                if not isinstance(t, str):
                    rep.err(where, "table cell text must be a string")
        if len(widths) > 1:
            rep.err(where, f"table is not rectangular (row widths {sorted(widths)})")
    return has_table


def iter_text_nodes(node):
    if isinstance(node, dict):
        if node.get("type") == "text":
            yield node.get("text")
        for child in node.get("content", []) or []:
            yield from iter_text_nodes(child)


def check_answer_balance(rep: Report, answers: list) -> None:
    answers = [a for a in answers if type(a) is int]
    if not answers:
        return
    counts = collections.Counter(answers)
    dist = [counts.get(i, 0) for i in range(4)]
    if len(answers) == 20 and dist != [5, 5, 5, 5]:
        rep.err("set", f"20-item answer distribution {dist}, required [5, 5, 5, 5]")
    elif len(answers) != 20 and max(dist) - min(dist) > 1:
        rep.err("set", f"answer distribution {dist} (spread > 1 for a {len(answers)}-item set)")
    run, longest = 1, 1
    for prev, cur in zip(answers, answers[1:]):
        run = run + 1 if cur == prev else 1
        longest = max(longest, run)
    if longest > 2:
        rep.err("set", f"same answer index {longest} times in a row (max 2)")


def validate_question_bank(rep: Report, data, tax: dict) -> None:
    if isinstance(data, dict):
        if data.get("format") != "tryoutjuara.question-bank" or data.get("version") != 1:
            rep.err("root", "object root must be the tryoutjuara.question-bank version-1 envelope")
        data = data.get("questions", [])
    if not isinstance(data, list) or not data:
        rep.err("root", "expected a non-empty array of questions")
        return
    seen_stems = {}
    for i, q in enumerate(data, 1):
        w = f"Q{i}"
        if not isinstance(q, dict):
            rep.err(w, "question is not an object")
            continue
        missing = [f for f in FLAT_FIELDS if f not in q]
        if missing:
            legacy = "content" in q and {"question", "options"} <= set(q["content"])
            rep.err(w, f"missing flat fields {missing}" + (" (legacy content-only item)" if legacy else ""))
        extra = set(q) - set(FLAT_FIELDS) - KNOWN_EXTRA
        if extra:
            rep.warn(w, f"undocumented fields {sorted(extra)}")
        subject = check_metadata(rep, w, q, tax, "skill_type", "question_type")
        if "is_active" in q and not isinstance(q["is_active"], bool):
            rep.err(w, "is_active must be boolean")
        content = q.get("content") if isinstance(q.get("content"), dict) else None
        options = q.get("options", content.get("options") if content else None)
        answer = q.get("answer", content.get("answer") if content else None)
        check_options_answer(rep, w, options, answer)
        is_math = subject in {"matematika", "ipa"}
        check_text(rep, w, [q.get("question"), q.get("options"), q.get("rationale")], is_math)

        stem = re.sub(r"\s+", " ", str(q.get("question", content.get("question") if content else ""))).strip().lower()
        if stem in seen_stems:
            rep.err(w, f"duplicate question text (same as Q{seen_stems[stem]})")
        seen_stems.setdefault(stem, i)

        rationale = str(q.get("rationale", content.get("rationale") if content else ""))
        if "Insight kunci" not in rationale:
            rep.warn(w, "rationale lacks 'Insight kunci:'")
        if q.get("difficulty") in {"medium", "hard"} and "opsi lain salah" not in rationale.lower():
            rep.warn(w, "medium/hard rationale lacks 'Kenapa opsi lain salah'")
        if "Jawaban akhir" not in rationale:
            rep.warn(w, "rationale lacks 'Jawaban akhir: **...**'")

        if content:
            has_table = check_rich_table(rep, w, content.get("questionRich"))
            if "questionRich" in content and not has_table:
                rep.warn(w, "content.questionRich has no table node")
            if "questionRich" in content and set(content) != RICH_KEYS:
                rep.err(w, f"rich content keys {sorted(content)} must be {sorted(RICH_KEYS)}")
            if "questionRich" not in content and "question" in q:
                rep.warn(w, "plain `content` copy without rich nodes; new prose items stay flat")
            if "question" in q:
                if content.get("options") != q.get("options"):
                    rep.err(w, "content.options differs from flat options")
                if content.get("answer") != q.get("answer"):
                    rep.err(w, "content.answer differs from flat answer")
                if content.get("question") != q.get("question") and not has_table:
                    rep.warn(w, "content.question differs from flat question")
            opts_rich = content.get("optionsRich")
            if opts_rich is not None and isinstance(options, list):
                rich_text = ["".join(t or "" for t in iter_text_nodes(d)) for d in opts_rich]
                plain = [re.sub(r"\*\*|__", "", str(o)) for o in options]
                if len(opts_rich) != len(options) or [re.sub(r"\*\*|__", "", t) for t in rich_text] != plain:
                    rep.err(w, "optionsRich text/order does not match options")
        elif re.search(r"^\|.*\|\s*$", str(q.get("question", "")), re.M):
            rep.err(w, "pipe table in question without content.questionRich")
    check_answer_balance(rep, [q.get("answer", (q.get("content") or {}).get("answer")) for q in data if isinstance(q, dict)])
    check_boilerplate(rep, [q for q in data if isinstance(q, dict)])
    check_length_cue(rep, [q for q in data if isinstance(q, dict)])


def check_length_cue(rep: Report, items: list) -> None:
    """Subject rule: key is the longest option in <=30% of items, uniquely longest in <=25%."""
    longest = unique = counted = 0
    for q in items:
        options, answer = q.get("options"), q.get("answer")
        if not isinstance(options, list) or type(answer) is not int or not 0 <= answer < len(options):
            continue
        lengths = [len(str(o)) for o in options]
        if max(lengths) - min(lengths) <= 2:
            continue  # near-equal options (e.g. numbers) carry no length cue
        counted += 1
        if lengths[answer] == max(lengths):
            longest += 1
            unique += lengths.count(max(lengths)) == 1
    if counted >= 10:
        if longest / counted > 0.30:
            rep.warn("set", f"key is the longest option in {longest}/{counted} items (target <=30%)")
        if unique / counted > 0.25:
            rep.warn("set", f"key is the unique longest option in {unique}/{counted} items (target <=25%)")


def normalize_stem(text: str) -> str:
    text = re.sub(r"\$\$?[^$]*\$\$?", " ", str(text))
    text = re.sub(r"\b[A-Z][a-z]+\b", " ", text)
    text = re.sub(r"\d+([.,]\d+)?", " ", text)
    return re.sub(r"\W+", " ", text).lower().strip()


def stems(path: Path) -> list[str]:
    try:
        data = json.loads(path.read_text(encoding="utf-8-sig"))
    except (OSError, ValueError):
        return []
    if isinstance(data, dict):
        data = data.get("questions", data.get("main_questions", []))
    return [normalize_stem(q.get("question", (q.get("content") or {}).get("question", ""))) for q in data if isinstance(q, dict)]


def check_novelty(rep: Report, path: Path, threshold: float) -> None:
    """Compare normalized stems with every other set in the same folder (cross-set audit)."""
    def informative(stem: str) -> bool:
        return len(stem.split()) >= 8  # short computational stems collapse after normalization

    mine = stems(path)
    for other in sorted(path.parent.glob("*.json")):
        if other.resolve() == path.resolve():
            continue
        for j, theirs in enumerate(stems(other), 1):
            for i, stem in enumerate(mine, 1):
                if informative(stem) and informative(theirs) and difflib.SequenceMatcher(None, stem, theirs).ratio() >= threshold:
                    rep.warn(f"Q{i}", f"stem similarity >= {threshold} with {other.name} Q{j}; change the reasoning structure")


FILLER_TAIL = re.compile(r"[,;]\s+((?:sehingga|karena|padahal|meskipun|tanpa)\b[^.;]{25,})\.?$")


def check_boilerplate(rep: Report, items: list) -> None:
    """Flag stock clauses padded onto options and rationale steps copied across items."""
    tails, steps = collections.Counter(), collections.Counter()
    for q in items:
        for o in q.get("options") or (q.get("content") or {}).get("options") or []:
            m = FILLER_TAIL.search(str(o))
            if m:
                tails[m.group(1).strip()] += 1
        for step in re.findall(r"Langkah \d+:([^\n]{40,})", str(q.get("rationale", ""))):
            steps[step.strip()] += 1
    for text, n in tails.items():
        if n >= 3:
            rep.warn("set", f"option clause repeated {n}x (length padding?): {text[:70]!r}")
    for text, n in steps.items():
        if n >= 3:
            rep.warn("set", f"identical rationale step in {n} items: {text[:70]!r}")


def validate_micro(rep: Report, data: dict, tax: dict) -> None:
    for key in ["authoring_request", "micro_concepts", "main_questions", "drill_questions"]:
        if key not in data:
            rep.err("root", f"missing {key}")
    req = data.get("authoring_request", {})
    spec = tax.get(req.get("subject"), {})
    if (req.get("topic"), req.get("subtopic")) not in spec.get("pairs", set()):
        rep.err("authoring_request", f"topic/subtopic {req.get('topic')!r} / {req.get('subtopic')!r} not in taxonomy")
    if str(req.get("grade_band", "")).startswith("sd_"):
        rep.warn("authoring_request", f"grade_band {req.get('grade_band')!r}; PSB target is SMP kelas 7-9 unless deliberate remediation")
    concepts = data.get("micro_concepts", [])
    cids = {c.get("concept_id") for c in concepts}
    n_c = len(concepts) or 1
    mains, drills = data.get("main_questions", []), data.get("drill_questions", [])
    want = (req.get("requested_micro_concept_count"),
            n_c * (req.get("requested_main_questions_per_concept") or 0),
            n_c * (req.get("requested_drill_questions_per_concept") or 0))
    if want != (len(concepts), len(mains), len(drills)):
        rep.err("counts", f"requested (concepts, main, drill) {want} but found {(len(concepts), len(mains), len(drills))}")
    if not 3 <= len(mains) / n_c <= 6 or not 5 <= len(drills) / n_c <= 10:
        rep.warn("counts", "instructions ask 3-6 main and 5-10 drill items per concept")

    ids = collections.Counter(q.get("questionId") for q in mains + drills)
    for qid, n in ids.items():
        if n > 1:
            rep.err(str(qid), "duplicate questionId")
    is_math = req.get("subject") == "matematika"
    texts = collections.Counter()
    for kind, items in (("main", mains), ("drill", drills)):
        for i, q in enumerate(items, 1):
            w = f"{kind}{i}:{q.get('questionId')}"
            check_metadata(rep, w, q, tax, "skillType", "questionType")
            check_options_answer(rep, w, q.get("options"), q.get("answer"))
            check_text(rep, w, [q.get("question"), q.get("options"), q.get("rationale"), q.get("microLoop")], is_math)
            loop = q.get("microLoop") or {}
            if loop.get("concept_id") not in cids:
                rep.err(w, f"microLoop.concept_id {loop.get('concept_id')!r} not declared in micro_concepts")
            if kind == "drill":
                focus = loop.get("drill_focus") or {}
                if not isinstance(focus.get("source_error_tags"), list) or not focus.get("source_error_tags"):
                    rep.err(w, "drill_focus.source_error_tags must be a non-empty list")
                continue
            answer, options = q.get("answer"), q.get("options") or []
            rules = loop.get("distractor_rules") or {}
            expected = {str(k) for k in range(len(options)) if k != answer}
            if set(rules) != expected:
                rep.err(w, f"distractor_rules keys {sorted(rules)} must be exactly the wrong indexes {sorted(expected)}")
            for key, rule in rules.items():
                rw = f"{w}/rule{key}"
                for field in RULE_FIELDS:
                    if not rule.get(field):
                        rep.err(rw, f"missing {field}")
                if rule.get("error_type") and rule["error_type"] not in ERROR_TYPES:
                    rep.err(rw, f"error_type {rule['error_type']!r}")
                retry = rule.get("retry_question") or {}
                check_options_answer(rep, rw + "/retry", retry.get("options"), retry.get("answer"))
                texts["diagnosis:" + str(rule.get("diagnosis"))] += 1
                texts["retry:" + json.dumps(retry, ensure_ascii=False, sort_keys=True)] += 1
    for kind in ("diagnosis", "retry"):
        reused = sum(n for t, n in texts.items() if t.startswith(kind + ":") and n > 1)
        if reused:
            rep.warn("pack", f"{reused} rules reuse an identical {kind}; check it explains each specific wrong option")


def validate_file(path: Path, tax: dict) -> Report:
    rep = Report(path)
    raw = path.read_bytes()
    if raw.startswith(b"\xef\xbb\xbf"):
        rep.err("file", "UTF-8 BOM present (save as UTF-8 without BOM)")
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        rep.err("file", f"not valid UTF-8 at byte {exc.start}")
        return rep
    if "�" in text:
        rep.err("file", f"{text.count(chr(0xFFFD))} U+FFFD replacement characters")
    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        rep.err("file", f"invalid JSON: {exc}")
        return rep
    if isinstance(data, dict) and "main_questions" in data:
        validate_micro(rep, data, tax)
    else:
        validate_question_bank(rep, data, tax)
    return rep


def collect(paths: list[str]) -> list[Path]:
    if not paths:
        files = [p for d in DEFAULT_DIRS for p in sorted((ROOT / d).glob("*.json"))]
        return files + sorted((ROOT / MICRO_DIR).glob("*/section-*/*/foundation-micro-authoring-pack.json"))
    files = []
    for raw in paths:
        p = Path(raw)
        if p.is_dir():
            files += sorted(x for x in p.rglob("*.json") if "template" not in x.name and "example" not in x.name)
        else:
            files.append(p)
    return files


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("paths", nargs="*", help="JSON files or folders (default: all sets and packs)")
    ap.add_argument("--summary", action="store_true", help="print one line per file")
    ap.add_argument("--no-warn", action="store_true", help="hide WARN lines")
    ap.add_argument("--novelty", action="store_true",
                    help="also compare question stems with other sets in the same folder (slower)")
    ap.add_argument("--threshold", type=float, default=0.80, help="novelty similarity threshold")
    args = ap.parse_args()
    tax = load_taxonomy()
    files = collect(args.paths)
    total_err = 0
    for path in files:
        rep = validate_file(path, tax)
        if args.novelty:
            check_novelty(rep, path, args.threshold)
        total_err += len(rep.errors)
        try:
            name = path.resolve().relative_to(ROOT).as_posix()
        except ValueError:
            name = str(path)
        status = "FAIL" if rep.errors else "OK"
        print(f"{status} {name}  errors={len(rep.errors)} warnings={len(rep.warns)}")
        if args.summary:
            continue
        for line in rep.errors:
            print(f"  ERROR {line}")
        if not args.no_warn:
            for line in rep.warns:
                print(f"  WARN  {line}")
    print(f"\n{len(files)} files, {total_err} errors")
    return 1 if total_err else 0


if __name__ == "__main__":
    sys.exit(main())
