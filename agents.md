# Agent instructions: PSB SMA Labschool content repository

Last full review: 2026-10-10. Read this file first, then [skills.md](skills.md) for step-by-step procedures and [knowledge.md](knowledge.md) for verified repository facts, known data debt, and baselines. Keep these three files consistent when you change one.

## 1. What this repository is

Authoring repository for TryoutJuara learning content: question-bank JSON sets, Foundation Micro packs, and Level 1 study guides. The audience is Indonesian SMP students in kelas 7-9 preparing for PSB SMA Labschool. Difficulty comes from reasoning and interpretation, not heavy calculation. Student-facing text is clear, warm Bahasa Indonesia; English items and passages follow the English instructions.

The TryoutJuara application, importer, database, and renderer are not in this repository. Local checks can prove structure only; they cannot prove import, KaTeX/table rendering, image resolution, or micro-loop behaviour.

## 2. Hazards: read before running anything

| Hazard | Rule |
|---|---|
| `scripts/align_microloop_distractors.py` hardcodes `c:\UnCloud\34 Soal TryoutJuara\03 Foundation MIcro\math`, a **different sibling repository** (no ` SMA`). | Do not run it, or `wrap_katex_mass.py` without `--no-align` (it calls align), unless the user asks and `BASE` is first corrected to this repository. Align also rewrites diagnoses/retries heuristically and overwrites `micro_concepts[0].target_error_tags`. |
| Generators overwrite tracked content without prompting: `generate_ipa_foundation_micro_packs.py` (all six IPA packs), `build-ips-speed-g.js` and `build-ips-speed-h.js` (IPS speed-g / speed-h, discarding any later manual edits). | Never run them to "refresh" content. Read the source and confirm scope with the user first. |
| `scripts/sync-github.ps1` and `scripts/git-auto-push.ps1` stage everything (`git add -A`), commit, rebase, and push. | Run only when the user explicitly asks to publish, following the `sync-github` skill (`.claude/skills/sync-github/SKILL.md`). Do not commit unless asked. |
| `categorize_ipa_openai.py` sends content to an external API and needs `OPENAI_API_KEY`. | Use only when requested. Never print or store credentials. |
| The Windows console uses a legacy code page, so valid UTF-8 (em dash, `«»`, `→`) can print as `�`. | Run Python with `python -X utf8`. Judge encoding from bytes or the validator, never from terminal output. A previous review misreported valid em dashes as corruption this way. |
| PowerShell expands `$x` inside double-quoted strings, which corrupts KaTeX in `python -c "..."` one-liners. | Put test code in a script file in the scratchpad, or use single-quoted here-strings. |
| Windows PowerShell 5.1 file cmdlets (`Out-File`, `>`, `Set-Content -Encoding utf8`) write a UTF-8 BOM or a non-UTF-8 encoding. One English set already has a BOM. | Write JSON through Python `json.dump(..., ensure_ascii=False, indent=2)` with `encoding="utf-8"`. |
| Edits to shared files (taxonomy, subject instructions, templates) affect every future set. | Change them only when the task is about them, and record the change in `knowledge.md`. |

## 3. Start every task

1. Run `git status --short`; preserve user changes you did not make.
2. Classify the output with the routing table in section 4. Never mix the question-bank and micro schemas.
3. Read the authoritative instruction file for that artifact completely (they run 25-38 KB; quotas sit in the middle).
4. Read `question-bank-metadata-taxonomy.json` for the subject. Look up exact topic/subtopic pairs; do not rely on memory or older files (the taxonomy changed on 2026-05-30 and older sets drifted).
5. Read `knowledge.md` sections on known data debt and conflicts for that subject, then inspect one or two comparable recent files. Old files are evidence of history, not templates: check them against current instructions.
6. Confirm the count, topic coverage, difficulty, filename, and asset needs. Infer them from the request and the existing naming family; ask only when the answer would change what you produce.

## 4. Artifact routing

| Artifact | Location and name pattern | Authoritative instructions | Validate with |
|---|---|---|---|
| Level 2 speed set (original, 20 items, balanced key) | `0N Soal <Subj>/questions-<slug>-level-2-speed-<letter>.json`; first tag `<slug>-level-2-speed-<letter>` | `00 Custom Instructions/custom-instruction-<subject>-tryout-juara.md` | `scripts/validate_content.py` |
| PSB-style exam or practice set | `0N Soal <Subj>/questions-<slug>-psb-sma-{exam-set,practice-set,set}-<n>.json`; companion `...-image-prompts.md` when figures exist | same subject instructions | `scripts/validate_content.py` |
| Study-guide section practice set (questions on one guide section) | `0N Soal <Subj>/soal_latihan_section/questions-<slug>-level-1-<section-slug>.json`; first tag `<slug>-level-1-<section-slug>` | same subject instructions | `scripts/validate_content.py` |
| Foundation Micro pack | `03 Foundation Micro/<math|ipa|english>/section-<n>/<kebab-slug>/foundation-micro-authoring-pack.json` | `03 Foundation Micro/foundation-micro-authoring-instructions.md` + `foundation-micro-authoring-template.json` | `scripts/validate_content.py`; math packs also `audit_*.py` |
| Level 1 study guide | `03 Kurikulum/Study_Guide_Level_1_<Subject>.md` | `03 Kurikulum/custom_instruction_study_guide.md` | manual checklist in skills.md section 6 |

Subject slugs: `math`, `bhsind`, `ipa`, `ips`, `english` (folder and tag slugs, not `subject` values). Next free letters/numbers are listed in `knowledge.md`.

## 5. Precedence and known conflicts

Order: the user's explicit request > subject instruction (content, quotas, rationale style) > micro template (micro structure) > taxonomy (metadata values) > this file > older files. When sources disagree, state the conflict and its resolution in your report; do not silently invent metadata or change the curriculum target. These conflicts are already known and resolved as follows:

| Conflict | Resolution |
|---|---|
| Subject instructions list a short `skill_type`/`question_type` subset; the taxonomy allows more values. | A value is valid only if it is in the taxonomy for that subject. Prefer the subject's listed values; use taxonomy-only values (e.g. `data_interpretation`, `map_analysis`) when they describe the item better. |
| Bahasa Indonesia instructions allow `question_type: dialogue`, which is not in the `bahasa_indonesia` taxonomy. | Never use it; use `short_text`, `functional_text`, or `text_analysis`. |
| All five subject instructions say to review `02 Referensi Naskah/`, which is empty. | Use `08 Ref Soal/<Math|BhsInd|English|IPA|IPS>/` PDFs and `08 Ref Soal/Research/source-snapshots/` with the same review quota (5-8 items per relevant file, spread across the paper). |
| Instructions list five `subject` values; the taxonomy also has `survei_karakter`. | No question-bank authoring standard exists for Survei Karakter. Before producing such items, agree with the user on format and whether a single key is appropriate (situational-judgement items often rank responses). |
| Micro instructions and template are written for mathematics (subject, skill types, KaTeX, scripts). | For IPA/English packs keep the same structure but use that subject's taxonomy values. English packs keep the English stem/options and give diagnoses and lessons in Bahasa Indonesia (`language: id`), as the existing packs do. |
| IPA instructions show `\\\\frac` in a JSON string "so KaTeX reads `\\frac`". That yields two backslashes after parsing. | Parsed text must contain exactly one backslash (`\frac`); in serialized JSON that is `\\frac`. Let the serializer escape. |
| One math instruction example uses `Persamaan Linear Satu Variabel`. | The taxonomy value is `Persamaan linear satu variabel`; capitalization matters. |
| Instructions say ordinary prose items stay flat, but many older sets carry a plain `content` copy without rich nodes. | Do not imitate that. Add `content` only for structured tables or data, with all seven rich keys. |
| Answer balancing applies to every batch (20 items: exactly 5/5/5/5; other sizes: counts differ by at most 1; never 3 identical indexes in a row), but most exam/practice sets do not comply. | New or revised sets must comply. Re-balance legacy sets only when asked. |
| The study-guide instruction requires the guide to end with `Quick-Reference Cheat Sheet` then `Final Exam Mindset`, but four guides have sections appended after them (an older note said "append after the last section"). | Insert new sections before the Cheat Sheet and renumber the following `## n.` headings. Fix existing order only when the guide is in scope. |

## 6. Content rules

- Target SMP kelas 7-9 (Fase D) even where filenames say `sma` or older text says SD. Prerequisite remediation below SMP must be deliberate and labelled in `grade_band`.
- Write original items. Reference papers and snapshots are patterns, not authenticated exams and not text to copy. "Inspired by, not copied from."
- Solve every item independently before fixing the key. Exactly one defensible answer, complete information, correct units, distractors from concrete error paths, at least one near-miss.
- Vary reasoning structure (reverse, error analysis, compare-justify, representation change), not only names and numbers. Record uncovered topics for the next set.
- Do not pad distractors with stock clauses to equalize length (older IPS/IPA speed sets did this; see knowledge.md). Balance length with relevant but wrong detail.
- Question-bank rationales teach: `Langkah n:` steps, `**Materi terkait:**`, `Insight kunci:`, `Kenapa opsi lain salah:` (required for medium/hard), and `Jawaban akhir: **...**` matching `options[answer]`. Micro items stay short: one concept, 1-3 sentence lessons, simpler retries.
- The 20/50/30 split in subject instructions is twist/long-reasoning/trap, not easy/medium/hard.

## 7. Output contracts

- Question bank: UTF-8 JSON without BOM, comments, trailing commas, or fences. Root is an array, or `{"format": "tryoutjuara.question-bank", "version": 1, "questions": [...]}` when requested.
- Flat fields on every item: `subject`, `difficulty`, `topic`, `subtopic`, `skill_type`, `question_type`, `tags` (array of strings, first tag = set tag), `is_active` (boolean), `question`, `options` (four strings), `answer` (zero-based int), `rationale`. Do not add or copy `id` values. `image` (repo-relative path, e.g. `ips-psb-sm-exam-set-3/question-64.png`) exists in one legacy set; confirm with the user before using it.
- Tables: keep the flat fields and add `content` with exactly `question`, `questionRich`, `options`, `optionsRich`, `answer`, `rationale`, `rationaleRich`. `content.options`/`answer` must equal the flat copies; `optionsRich` text must match option order; tables are rectangular with a `tableHeader` first row and string cells.
- Micro packs: follow the template exactly (`authoring_request`, `micro_concepts`, `main_questions`, `drill_questions`; camelCase item keys; `microLoop.concept_id` declared in `micro_concepts`; `distractor_rules` keyed by every wrong index as a string and nothing else). Leave `topicId`/`subtopicId` null unless real UUIDs are supplied.
- Text: TryoutJuara Markdown subset (bold, italic, headings, `-` and `1.` lists, `>` quotes, inline code), no HTML. KaTeX with `$...$`/`$$...$$`; micro math uses inline `$...$` everywhere, including options, diagnoses, lessons, and retries.

## 8. Definition of done

1. `python -X utf8 scripts/validate_content.py <your files>` reports no ERROR for new or edited files; every remaining WARN is resolved or explained.
2. Subject quotas, answer balance, option-length cues, and cross-set novelty are checked (skills.md sections 1-4).
3. A separate pedagogical read: every key re-solved, every distractor's error path named, every micro diagnosis matches its specific wrong option and every retry is simpler.
4. `git diff --stat` shows only intended files; no generator or publishing script ran.
5. Report to the user: files changed, checks actually run with results, conflicts resolved, and what was not verifiable (import/render, live admissions facts).
6. Add durable, dated, evidenced findings to `knowledge.md`; update inventory and next-free names when you add sets.

## 9. Research and admissions facts

Repository research is historical. Verify exam instruments, durations, routes, dates, or campus rules against current official sources before presenting them as current, and record URL, check date, campus/cycle, and uncertainty. Do not imply all Labschool campuses or future cycles share one format.

## 10. File naming

This file is `agents.md` (lowercase, by user request). Windows resolves `AGENTS.md` to it. `CLAUDE.md` contains only `@agents.md`, so Claude Code loads these rules on every version and filesystem; keep all content here, never duplicate it into `CLAUDE.md`. On case-sensitive systems other tools should read `agents.md` explicitly; if a tool requires `AGENTS.md`, rename deliberately instead of keeping two copies.
