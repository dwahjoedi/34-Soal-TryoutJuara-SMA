# Authoring procedures

Repository procedures, not installed agent skills. Read [agents.md](agents.md) first; facts and baselines are in [knowledge.md](knowledge.md). The subject instruction files remain authoritative for wording and detail; this file condenses what an agent must do and check.

## 0. Environment quick reference

- Windows 11, Git Bash and Windows PowerShell 5.1 available; Python 3.13 and Node available. Run commands from the repository root and quote paths (most contain spaces).
- Always run Python as `python -X utf8 ...` so UTF-8 prints correctly. Check encoding at byte level if unsure (`od -c` in Git Bash, or the validator).
- Put throwaway scripts in the session scratchpad, not in `scripts/`. Avoid `python -c "..."` with `$` in PowerShell.
- Write JSON with `json.dump(data, f, ensure_ascii=False, indent=2)` and `open(path, "w", encoding="utf-8", newline="\n")`, followed by a final newline.

## 1. Plan a question-bank set

1. Read the whole subject instruction in `00 Custom Instructions/`, the subject block of the taxonomy, the matching `03 Kurikulum/Study_Guide_Level_1_*.md`, `07 Materi Zenius/<subject> sma.txt` (math, ipa, bhsindo, english; IPS has none), and `07 Materi Zenius/riset-materi-psb-sma-labschool.md`.
2. Review reference papers in `08 Ref Soal/<Subject>/` and relevant `08 Ref Soal/Research/source-snapshots/` files: 5-8 items per relevant file, spread across the beginning, middle and end. Extract stem patterns, traps, step depth and difficulty; never copy text, numbers or logic order.
3. List topics covered by the subject's previous sets (`tags[0]` identifies the set; group by `topic`/`subtopic`). Start the new set from uncovered topics.
4. Build a blueprint table before writing: `#`, topic, subtopic (exact taxonomy pair), `skill_type`, `question_type`, difficulty, design category (twist/reasoning/trap), task type (direct/reverse/error-analysis/compare-justify/representation), target misconception, planned key index.
5. Check the blueprint against the quotas below and the answer pattern (section 2.3) before drafting any item.

### Per-subject quotas (20-item batches unless stated)

| Subject | Required mix |
|---|---|
| All | 20% twist, 50% long reasoning, 30% trap. Key distribution exactly 5/5/5/5 for 20 items; other sizes differ by at most 1; no index three times in a row. |
| Matematika | Multi-step (2-4 steps), >=2 concepts per item, no calculator, clean numbers. At least 4 reverse/working-backwards, 3 error-analysis, 3 compare-justify, 3 alternative-representation items (categories may overlap). Geometry >=6 items over >=5 of: lingkaran, trapesium, segitiga, curved solids, flat-faced solids, composite; >=2 3D; <=2 items with the same main shape. Non-20 batches: geometry >=30% and >=1 3D item per 10. Touch >=5 lower-secondary domains. At most 2 stems with near-identical sentence templates. State the value of pi used. Every rationale ends with `Jawaban akhir: **...**`. |
| IPA | >=6 short-reading items (paragraph, simple graph, table, or experiment scenario), >=2 data-interpretation items, >=3 inference items. |
| IPS | >=8 reading-based items, >=3 map/plan/schedule/table items, >=4 inference items. |
| Bahasa Indonesia | >=8 reading items covering >=5 of: ide pokok, inferensi/simpulan, makna kata dalam konteks, tujuan/amanat, struktur/ringkasan. >=2 kebahasaan items in context (ejaan, tanda baca, kalimat efektif). Minimums of 2 each: informasi tersurat, sinonim/antonim kontekstual, eksposisi/argumentasi, hubungan antarparagraf. <=3 items with an identical question pattern. Non-20: reading >=35%, and per 10 items >=1 kebahasaan plus >=1 of each required subtopic. |
| Bahasa Inggris | >=8 passage items covering >=5 subtopics. Minimums: explicit information 2, inference/implied meaning 3, vocabulary in context 2, text structure/writer's purpose 2, relationship between ideas 2; >=2 sentence-level grammar items. Non-20: passages >=35% and each required subtopic >=1 per 10 items. |

Use the existing naming family and a new letter or number (see "Next free names" in knowledge.md). Do not assume 20 items; exam and practice sets use 10, 15, 20, 21, 25 or 30.

## 2. Author a question-bank set

### 2.1 Items

1. Write the stem with every needed number, label, unit and assumption in text, even when a figure is planned.
2. Solve it independently, by a second method or check where possible, before writing options.
3. Write the key plus three distractors, each from a named error path (unit conversion missed, wrong base for percentage, area vs perimeter, inference beyond the text, too general, partially true, etc.). At least one must be a near-miss. Balance length and detail with relevant but wrong content, never stock filler clauses.
4. Assign metadata from the taxonomy; verify the topic/subtopic pair exists under that topic.

### 2.2 Rationale (question bank)

Use `\n` between lines (a real newline after parsing). Pattern used by all five subjects:

```text
Langkah 1: [what is done + why + small result]
Langkah 2: ...
Langkah 3: ...            (easy: 3-4 steps, medium: 4-5, hard: 5-6)
**Materi terkait:**
- [concept explained so the student can reuse it]
Insight kunci: [2-4 sentences on the transferable idea]
Kenapa opsi lain salah: [each distractor and its misconception; required for medium/hard]
Jawaban akhir: **[correct option text]**
```

Use 3-8 bold key terms, KaTeX for every expression (with words around it), and no HTML. English items keep the stem and options in English and write the rationale in Bahasa Indonesia, as the English instruction requires.

### 2.3 Balance answers and option lengths

After all items are final, rotate options to reach the target key distribution, then update everything that depends on order. Do it with a script, not by hand:

```python
def move_key(q, new_index):
    """Move the correct option to new_index; keep flat and rich copies in step."""
    old = q["answer"]
    order = list(range(len(q["options"])))
    order[old], order[new_index] = order[new_index], order[old]
    q["options"] = [q["options"][i] for i in order]
    q["answer"] = new_index
    if "content" in q:
        c = q["content"]
        c["options"] = q["options"]
        c["answer"] = new_index
        if "optionsRich" in c:
            c["optionsRich"] = [c["optionsRich"][i] for i in order]
```

Then fix any option letters (A-D) cited in `rationale`, `rationaleRich`, and `Kenapa opsi lain salah`. Check that the key is the longest option in at most ~30% of items and the unique longest in at most ~25%.

### 2.4 Tables

Use the dual format only for real tables or structured data: keep the flat fields (flat `question` may contain a pipe table as fallback) and add `content` with `question`, `questionRich`, `options`, `optionsRich`, `answer`, `rationale`, `rationaleRich`. `questionRich` = intro paragraph, `table` (`tableRow` > `tableHeader` first row / `tableCell` after > one `paragraph` > one `text` with a string), closing paragraph. `optionsRich` = one doc per option in the same order; `rationaleRich` = plain paragraphs without Markdown. The template is in any subject instruction under "FORMAT TABEL INTERAKTIF".

## 3. Validate

```powershell
python -X utf8 scripts/validate_content.py "03 Soal IPA/questions-ipa-level-2-speed-k.json"
python -X utf8 scripts/validate_content.py --novelty "03 Soal IPA/questions-ipa-level-2-speed-k.json"
python -X utf8 scripts/validate_content.py --summary          # whole repo, one line per file
```

`validate_content.py` is read-only and exits 1 on any ERROR. It detects set vs micro pack and checks: BOM, U+FFFD, invalid UTF-8/JSON; required flat fields; taxonomy subject/topic-subtopic pair/skill/question type; difficulty; tags array; boolean `is_active`; options/answer type and range; duplicate options and duplicate stems; broken or over-escaped LaTeX (`\x0c` from an unescaped `\f`, `\\frac` after parsing); HTML tags; rich `content` keys, flat/rich agreement, `optionsRich` order, rectangular tables; key distribution and runs; WARN for missing rationale markers, odd `$` counts, plain `content` copies, key-length cues, stock option clauses and copied rationale steps. `--novelty` compares normalized stems (numbers, KaTeX, capitalized names removed) against every other set in the same folder at similarity >= 0.80; it takes ~10 s per file.

It does not check: whether the key is right, distractor quality, quotas, topic coverage, difficulty calibration, factual accuracy, Indonesian/English language quality, figure-text agreement, or rendering. Those need the manual review in section 2 and agents.md section 8.

Legacy `scripts/validate-speed.js` checks IPS only, exits 0 even when it prints errors, and crashes on a BOM; prefer the new validator.

Many legacy files fail the validator; that is known debt (baseline in knowledge.md). Judge your work by your own files, and do not "fix" legacy files unless asked.

## 4. Cross-set novelty and coverage

1. Run `--novelty` on the new file. For each flagged pair, change the reasoning structure (direction, model, strategy, context or main trap), not just numbers or names.
2. Within the set: at most 2 near-identical stem templates for the same subtopic (math) or 3 identical question patterns (Bahasa Indonesia).
3. List topics/subtopics still uncovered across the subject's sets and mention them in your report so the next set can start there.

## 5. Build or revise a Foundation Micro pack

Read together: `03 Foundation Micro/foundation-micro-authoring-instructions.md`, `foundation-micro-authoring-template.json`, `foundation-micro-example-bilangan-bulat-garis-bilangan.json` (structure reference; its content predates current rules), and one pack in the target subject.

1. Set `authoring_request`: subject, an exact taxonomy topic/subtopic pair, honest `grade_band` (`smp_foundation` for PSB preparation; `sd_4_6_foundation` only for deliberate prerequisite remediation), counts, `language: "id"`.
2. Split the topic into narrow `micro_concepts` (stable snake_case `concept_id`, name, description, specific `target_error_tags`). Instructions ask 3-6 main and 5-10 drill items per concept; requested counts must equal actual counts.
3. Main items: one concept each, `microLoop.concept_id` declared, `distractor_rules` with exactly the wrong indexes as string keys (answer 0 -> keys "1","2","3"). Each rule: specific `error_tag`, `error_type` in concept/careless/strategy/representation, a diagnosis that explains that option's value, a 1-3 sentence `micro_lesson` that repairs the misconception, and a `retry_question` on the same misconception with smaller numbers and shorter text, four real options and a valid answer.
4. Drill items: same concept, varied surface, `microLoop.drill_focus.source_error_tags` drawn from the main items' tags.
5. Mathematics: inline `$...$` for every expression in every student-facing string; wrap a whole option in one `$...$` pair when it holds several fractions or a comparison.
6. Validate with `scripts/validate_content.py`, then read every diagnosis and retry yourself. Uniform or reused diagnoses are a failure even when structure passes.

Mathematics audit scripts (read-only, scan all 34 math packs, folder spelled `03 Foundation MIcro`, which only resolves on case-insensitive filesystems):

```powershell
python -X utf8 scripts/audit_katex_inline.py
python -X utf8 scripts/audit_microloop_distractors.py --rows --max-rows 12
```

Repair scripts: `wrap_katex_mass.py --dry-run` is safe to preview. Without `--dry-run` it rewrites packs and then runs `align_microloop_distractors.py`, whose hardcoded `BASE` points at the sibling repository `c:\UnCloud\34 Soal TryoutJuara`. Do not run align until `BASE` is changed to `Path(__file__).resolve().parents[1] / "03 Foundation Micro" / "math"` with the user's agreement; use `--no-align` meanwhile. Review `git diff` after any repair.

Packs are authoring files for the external Foundation Micro library, not exam-set payloads; import and exam-set generation happen in the application.

## 6. Create or revise a study guide

Follow `03 Kurikulum/custom_instruction_study_guide.md`; the mathematics guide is the structural reference.

- Required order: title, `### Key Concepts Summary for Kelas 7-9`, `## 1. Format Ujian PSB SMA Labschool`, topic sections, then `Quick-Reference Cheat Sheet` and `Final Exam Mindset` last. Insert new sections before the Cheat Sheet and renumber later headings; check in-text references to section numbers.
- Each major section: teaching prose for kelas 7-9 (about 20-30 minutes of engaged reading), concrete examples, elaborated question patterns, common traps, worked examples that explain why each step is chosen, strategies, and a closing `### Mini-Check`.
- Illustration prompts inline next to the concept they serve, never collected at the end: purpose, objects, labels/numbers, clean educational style on white. At least 2 per visual/abstract section, 3-5 for large sections, spread evenly.
- Exam-format facts need dated sources; recompute every worked example; stay inside SMP scope.

## 7. Sources, PDFs and images

- Start from `08 Ref Soal/Research/SOURCES.md` and `07 Materi Zenius/riset-materi-psb-sma-labschool.md`. Snapshots are partial public previews of third-party documents, not official papers.
- For PDFs, extract text and also render pages to images to check signs, fractions, option order and figures; extraction alone loses them. `08 Ref Soal/math_smp1_p*.png` are existing page renders of `math smp 1.pdf`.
- Figures: keep the companion `*-image-prompts.md` in step with the set (same item numbers, every measure the stem relies on). Item text must remain solvable from text alone, or the user must agree to an image asset.
- `generate_ips_set3_assets.py` needs Pillow and `_tmp_ips_smp3_pages/page_07.png`, which does not exist; it cannot reproduce the existing PNGs as-is.

## 8. Repair legacy data (only when asked)

- Taxonomy drift fixes are listed in knowledge.md ("Known data debt"). Re-validate after each file, and keep `content` copies in step.
- Re-balancing an existing set changes which letter students saw; ask before re-ordering sets that may already be in use.
- Converting content-only Bahasa Indonesia speed sets to the flat contract: copy `content.question/options/answer/rationale` to flat fields, drop `content` unless the item has a real table, and fix invalid `dialogue` question types.
- After any repair: run the validator on the touched files, inspect `git diff`, and update the baseline in knowledge.md.

## 9. Close the session

1. Validate every new or changed JSON file and run `--novelty` on new sets.
2. Inspect `git status --short` and `git diff --stat`; confirm no generator, repair or publishing script changed anything unintended.
3. Report files changed, checks run with their actual output, conflicts and resolutions, and remaining limits (import/render not verifiable here; live admissions facts unverified unless checked with dates).
4. Update knowledge.md: inventory, next free names, baseline changes, and any new durable finding with date and evidence. Publishing (`scripts/sync-github.ps1`) happens only on explicit request.
