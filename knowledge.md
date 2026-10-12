# Repository knowledge: PSB SMA Labschool preparation

Last full review: 2026-10-10 (inventory, taxonomy, encoding, and validation baseline measured from the checkout that day). Operating rules are in [agents.md](agents.md); procedures in [skills.md](skills.md). This file records local evidence, known debt, and limits. It is not a verified current admissions guide.

## 1. Project and learning model

TryoutJuara content for SMP kelas 7-9 students preparing for SMA Labschool entry ("PSB SMA" names the destination, not the audience). Four artifact families:

| Family | Purpose | Observed traits |
|---|---|---|
| Level 2 speed sets (`*-level-2-speed-<letter>`) | Original advanced practice, 20 items | Keys balanced 5/5/5/5 in every math, IPA, IPS and English speed set; long teaching rationales |
| PSB-style exam/practice sets (`*-psb-sma-*`) | Exam-style sets built from reference-paper patterns; some items closely follow historical papers (e.g. a 2015 news excerpt; IPS set 3 numbered from the source paper, `question-64.png`) | 10-30 items; mostly short rationales without `Insight kunci`; keys mostly unbalanced |
| Foundation Micro packs | Adaptive diagnosis-lesson-retry loops for an external library | Mostly generator-made; see section 6 |
| Level 1 study guides (`03 Kurikulum/`) | Teaching prose per subject plus Survei Karakter | Enriched 2026-05-16/17 |

Local research (2026-05) records the selection instruments as Kuantitatif, Pemahaman Baca, Kemampuan Verbal, Akademik and Survei Karakter, delivered by CAT. These are dated findings, not re-verified on 2026-10-10. Do not infer counts, timings, scoring, or identical formats across campuses or cycles.

## 2. Repository map (2026-10-10)

| Path | Contents |
|---|---|
| `00 Custom Instructions/` | Five subject authoring standards (matematika 38 KB, bahasa indonesia 32 KB, ipa 30 KB, bahasa inggris 29 KB, ips 25 KB), all dated 2026-05-15 |
| `01 Soal Math/` | 22 JSON sets: 10 speed a-j (20), `Math-Speed-C.json` (5, early pilot), practice-set-1..6 (30/25/21/20/20/20), psb-sma-set-1, 2, 2-smp3, 4, 5 (15 each); five `*-image-prompts.md`; empty `output/` |
| `02 Soal BhsInd/` | 12 sets: speed c, d, e (20, files named `question-bank-bahasa-indonesia-level-2-speed-<x>-20-soal.json`; no speed a/b), exam-set-1..5 (10), and study-guide section practice in `soal_latihan_section/`: `...-level-1-format-ujian.json` (section 1, added 2026-10-10), `...-level-1-cara-membaca-bukti.json` (section 2), `...-level-1-ide-pokok-simpulan.json` (section 3) and `...-level-1-kosakata-verbal.json` (section 4; sections 2-4 added 2026-10-11), 10 items each |
| `03 Soal IPA/` | 21 sets: speed a-j (20), exam-set-1..5 (20), practice-set-1..6 (15); five image-prompt files |
| `04 Soal IPS/` | 15 sets: speed a-j (20), exam-set-1..5 (20); image prompts for exam sets 1, 2, 4, 5 |
| `05 Soal English/` | 15 sets: speed a-j (20), exam-set-1..5 (10) |
| `03 Foundation Micro/` | Instructions, template, worked example; 45 packs (34 math, 6 IPA, 5 English); `bhsind/` exists but is empty |
| `03 Kurikulum/` | Six `Study_Guide_Level_1_*.md` (Matematika, Bahasa_Indonesia, Bahasa_Inggris, IPA, IPS, Survei_Karakter) and `custom_instruction_study_guide.md` |
| `07 Materi Zenius/` | Topic lists `math sma.txt`, `ipa sma.txt`, `bhsindo sma.txt`, `english sma.txt` (SMP content despite the names; none for IPS) and `riset-materi-psb-sma-labschool.md` |
| `08 Ref Soal/` | Reference PDFs per subject (`Math/`, `BhsInd/`, `English/`, `IPA/`, `IPS/`, plus `math smp 1-5.pdf` at top level and practice subfolders), nine page renders `math_smp1_p1-9.png`, and `Research/` (SOURCES.md + 14 snapshots) |
| `02 Referensi Naskah/` | Empty. Every subject instruction still points here; use `08 Ref Soal/` instead |
| `ips-psb-sm-exam-set-3/` | Four PNGs referenced by the `image` field of IPS exam-set-3 (keep the `sm` spelling) |
| `question-bank-metadata-taxonomy.json` | Machine taxonomy for six subjects; last modified 2026-05-30 |
| `question-bank-metadata-reference.md` | Human reference and table examples; its descriptions still say SD/Fase B-C |
| `scripts/` | Validator, micro audit/repair, generators, asset and classification helpers, Git publishing scripts (section 7) |
| `Chapter_05_Summary.md` | Unrelated leadership-course summary |
| `GITHUB_SYNC_COMMANDS.md` | How to run the publishing script |

Not present: application source, importer, package manifest, `.gitignore` (so `scripts/__pycache__/*.pyc` is tracked). Remote: `github.com/dwahjoedi/34-Soal-TryoutJuara-SMA`.

Sibling folders under `C:\UnCloud\` include `34 Soal TryoutJuara` (an older or parallel copy with `03 Foundation MIcro/math`), `34 SMP Labs Study Guide`, and `34 TryoutJuara_Fundamentals`. They are separate repositories; do not read or write them unless asked.

### Next free names

| Subject | Speed | Exam | Practice / other |
|---|---|---|---|
| Matematika | `questions-math-level-2-speed-k.json` | - | `questions-math-psb-sma-practice-set-7.json`; `psb-sma-set-6` (set-3 is missing; `set-2-smp3` carries the tag `math-psb-sma-set-3`) |
| Bahasa Indonesia | `-speed-f` (a/b never existed; prefer the `questions-bahasa-indonesia-level-2-speed-f.json` pattern used by other subjects) | `exam-set-6` | Study-guide section practice: `soal_latihan_section/questions-bahasa-indonesia-level-1-<section-slug>.json` |
| IPA | `speed-k` | `exam-set-6` | `practice-set-7` |
| IPS | `speed-k` | `exam-set-6` | - |
| English | `speed-k` | `exam-set-6` | - |

Tag convention: `tags[0]` is the set tag, e.g. `ipa-level-2-speed-k`, `bhsind-psb-sma-exam-set-6`. Some older sets carry `id` values (`math-l2-speed-a-001`, `english-psb-sma-exam-set-1-011`; numbering continues across sets); new sets omit `id`.

## 3. Canonical metadata

- Subjects in the taxonomy: `matematika`, `ipa`, `ips`, `bahasa_indonesia`, `bahasa_inggris`, `survei_karakter`. The subject instructions list only the first five; there is no question-bank authoring standard for `survei_karakter`, only its taxonomy block and study guide.
- Difficulty: `easy`, `medium`, `hard`. Answers are zero-based everywhere.
- Question-bank keys are snake_case (`skill_type`, `question_type`, `is_active`); micro item keys are camelCase (`questionId`, `skillType`, `questionType`, `microLoop`).
- Topic/subtopic labels keep exact capitalization and punctuation (e.g. `Persamaan linear satu variabel`, `Asam, basa & garam`).
- Subject instructions list subsets of the taxonomy's skill and question types (e.g. math lists 5 of 7 skill types). The Bahasa Indonesia instruction also lists `dialogue`, which the `bahasa_indonesia` taxonomy lacks. Resolution is in agents.md section 5.

## 4. Validation baseline (2026-10-10)

`python -X utf8 scripts/validate_content.py --summary`: 126 files, 163 errors.

| Group | Failing files | Error types |
|---|---|---|
| Math sets | 10/22 | unbalanced keys in all practice and psb-sma sets except set-2-smp3; runs of 3; `\x0crac` (unescaped `\frac`) in practice-set-3 Q17 rationale; duplicate options in practice-set-6 Q19 |
| Bahasa Indonesia | 8/8 | speed c/d/e are content-only (no flat `question/options/answer/rationale`) with 9 `question_type: dialogue` and 5 `Kebahasaan / Sinonim & antonim`, `Kebahasaan / Makna kata dalam konteks` pairs; exam sets unbalanced |
| IPA | 17/21 | `Materi & Perubahannya / Asam basa & pH` and `/ Reaksi kimia` pairs in speed a, c, e, f, h, j; speed-e Q11 `optionsRich` lost subscripts (`$O2$`); exam-set-5 Q10 duplicate options; exam and practice keys unbalanced |
| IPS | 5/15 | exam sets 1-5 unbalanced or with runs; speed sets clean |
| English | 14/15 | `Vocabulary / Context meaning` pair in every speed set; speed-a Q15 repeats Q13's stem; speed-c has a UTF-8 BOM; exam sets 1-4 unbalanced or with runs |
| Micro packs | 3/45 | English vocabulary pack uses `Vocabulary / Context meaning`; math packs `bilangan-berpangkat-sederhana` (main-02) and `persamaan-linear-satu-variabel` (main-03) have a retry with duplicate options |

Taxonomy drift fixes when a repair is requested: `Asam basa & pH` -> `Asam, basa & garam` (or `Indikator asam-basa` for indicator items); `Reaksi kimia` -> `Reaksi kimia sederhana`; English `Vocabulary / Context meaning` -> `Vocabulary / Vocabulary in context`; Bahasa Indonesia `Kebahasaan / Sinonim & antonim` and `/ Makna kata dalam konteks` -> topic `Kemampuan Verbal` with `Sinonim kontekstual`, `Antonim kontekstual` or `Makna kata dalam konteks`; `dialogue` -> `short_text` or `functional_text`. Re-solve each item before choosing.

Other measured patterns (warnings, not errors):

- Key-length cue: the key is the longest option (excluding items whose options have near-equal length) in more than 30% of items in English speed-g (9/20), IPS speed-i, IPA speed-d, and several exam/practice sets.
- Stock filler clauses padded onto distractors recur across IPS and IPA speed sets, e.g. "sehingga perubahan permintaan atau penawaran dianggap tidak berdampak pada harga dan pilihan masyarakat" (12 times in 6 IPS files) and "karena perubahan organ dilihat terpisah dari kebutuhan oksigen dan zat makanan" (10 times in 7 files). IPA speed-e Q11/Q15 distractors end with clauses unrelated to the item.
- Templated rationale steps repeat within IPS speed f/g/h and math practice sets 1-6 (e.g. "Cek kembali apakah satuan, urutan operasi, dan syarat pada soal sudah ..."). IPS speed-f rationales use a generic step template and lack `Insight kunci`.
- 326 items in math practice sets 1-6, Bahasa Indonesia exam sets, English exam sets and IPA practice sets carry a plain `content` copy without rich nodes; 101 items carry real rich tables.
- IPA speed sets store the table only in `content.questionRich` and omit it from `content.question` while the flat `question` keeps a pipe-table fallback. This is consistent across those sets and is tolerated by the validator.
- Near-duplicate across sets: math psb-sma-set-2-smp3 Q1 and psb-sma-set-4 Q9 are the same ATM item.

## 5. Encoding facts

All 182 JSON, Markdown and TXT files in the checkout decode as UTF-8 and contain no U+FFFD replacement characters. The only encoding defect is the BOM in `05 Soal English/questions-english-level-2-speed-c.json`. The earlier (2026-10-10 morning) note claiming a replacement character in the mathematics guide title and in the IPA science-process pack was wrong: the title contains a valid em dash (`E2 80 94`) that the Windows console displayed as `�`.

## 6. Foundation Micro packs

| Group | Packs | Shape | Grade band | Quality signal |
|---|---|---|---|---|
| Math section 1-2 | 19 | 1 concept, 5 main, 12 drill | `sd_4_6_foundation` | Concept descriptions say "level SD kelas 4-6"; generator-built |
| Math section 3-5 | 15 | 1 concept, 5 main, 12 drill | `smp_foundation` | Generator-built |
| IPA section 1-6 | 6 | 3 concepts, 9 main, 15 drill | `sd_4_6_foundation` | Built by `generate_ipa_foundation_micro_packs.py`; only ~17% of diagnoses and retries are unique within a pack (generic triples reused) |
| English section 1-5 | 5 | 1 concept, 3 main, 5 drill | `sd_4_6_foundation` | Hand-written; all diagnoses and retries unique; English stems, Indonesian diagnoses |

Math packs: every concept link resolves, but only ~13% of retries and error tags are unique per pack, and 12 drills per concept exceed the instructions' 5-10. All 34 math packs and the IPA packs are below the "one narrow concept, specific misconception" bar; treat them as drafts, not models. Section numbers under `math/` and `ipa/` mirror older app sections; check the current guide before placing a new pack.

The authoring instructions and template are mathematics-specific; IPA and English packs reuse the structure with their own taxonomy values.

## 7. Scripts

| Script | Writes? | Notes |
|---|---|---|
| `validate_content.py` | No | All-subject set and micro validator, added 2026-10-10. Exit 1 on errors. `--novelty` cross-set stem check, `--summary` |
| `validate-speed.js` | No | IPS only; exit 0 even with errors; crashes on BOM |
| `audit_katex_inline.py`, `audit_microloop_distractors.py` | No | Math packs only; base folder spelled `03 Foundation MIcro` |
| `wrap_katex_mass.py` | Yes (all math packs) | `--dry-run`, `--no-align`; otherwise calls align afterwards |
| `align_microloop_distractors.py` | Yes | `BASE` hardcoded to `c:\UnCloud\34 Soal TryoutJuara\03 Foundation MIcro\math` (sibling repository); rewrites rules heuristically and `target_error_tags` |
| `generate_ipa_foundation_micro_packs.py` | Yes (six IPA packs) | Source of the generic IPA diagnoses |
| `build-ips-speed-g.js`, `build-ips-speed-h.js` | Yes (one IPS set each) | Overwrite later manual edits |
| `generate_ips_set3_assets.py` | Yes (PNGs) | Needs Pillow and missing `_tmp_ips_smp3_pages/page_07.png` |
| `categorize_ipa_openai.py` | No (prints) | Calls OpenAI with `OPENAI_API_KEY` |
| `sync-github.ps1`, `git-auto-push.ps1` | Git | Stage all, commit, rebase, push. Publishing only |

Tooling available on the review date: Python 3.13.2, Node 22.21.0. `.claude/settings.local.json` pre-allows WebFetch for `psb.labschool-unj.sch.id`, `utbk.or.id`, `www.bintangpelajar.com` and some read commands.

## 8. Study guides

Section counts on 2026-10-10: Matematika 13, IPA 11, IPS 11, Bahasa Inggris 11, Bahasa Indonesia 10, Survei Karakter 8. Matematika and Survei Karakter end with Cheat Sheet and Final Exam Mindset as required. Bahasa Indonesia (sections 9-10), Bahasa Inggris (10-11), IPA (11) and IPS (11) have sections placed after Final Exam Mindset, added on 2026-05-16 under an "append after the last section" practice that conflicts with the study-guide instruction.

## 9. Research provenance

- `07 Materi Zenius/riset-materi-psb-sma-labschool.md`: audit and deep-research update dated 2026-05-16, character-guide update 2026-05-17; links official PSB guidance and CP Fase D references.
- `08 Ref Soal/Research/SOURCES.md`: checks dated 2026-06-16. Snapshots are public previews (Scribd/PDFCoffee) because originals were blocked or login-gated; they may be partial and are not authenticated papers. The register separates official pedoman/SOP documents from question documents and lists failed downloads.
- 2026-10-10 check of the official Pedoman PSB Jalur Tes 2026 PDF (`psb.labschool-unj.sch.id/wp-content/uploads/2025/12/Pedoman-PSB-Jalur-Tes-2026.pdf`, 33 MB, 18 pages; too large for WebFetch, download and use `pdftotext`) and FAQ: TP 2026/2027; computer-based test at the chosen Labschool; CAT with questions at different difficulty levels; mandatory online simulation (SMA 24 Jan 2026); SMA test Sunday 1 Feb 2026, 08.00-12.00 WIB; own laptop/tablet, phones not recommended, scrap paper provided; one sitting, no make-up test; auto-save when time ends; results by ranking. Official instrument wording: Pemahaman Bacaan = "memahami, menginterpretasikan, dan menganalisa teks atau bacaan mengenai berbagai macam topik"; Kemampuan Verbal = kata beda, kosakata, sinonim, analogi verbal, klasifikasi kata, wacana (logika verbal), missing word. No question counts, per-section durations or weights are published. The PSB site still showed TP 2026/2027 on that date; no 2027 guideline yet.
- Official references recorded locally: PSB Jalur Tes 2026 guidance, PSB FAQ, Labschool Jakarta admissions page, 2024 SOP (Tahap 1 Kuantitatif, 45 minutes). Recheck for the requested campus and cycle before giving current advice.
- `question-bank-metadata-reference.md` describes SD/Fase B-C frameworks; its labels remain canonical, but the SMP/Fase D target from the subject instructions governs scope.

## 10. Change log

- 2026-10-10: Full review. Added `scripts/validate_content.py`; rewrote agents.md, skills.md and this file; recorded the validation baseline, taxonomy drift, the sibling-path hazard in `align_microloop_distractors.py`, the empty `02 Referensi Naskah`, the `survei_karakter` subject, micro pack quality measurements, and study-guide order drift; corrected the earlier false replacement-character claim.

- 2026-10-10: Added `CLAUDE.md` (imports `@agents.md`) and the project skill `.claude/skills/sync-github/SKILL.md`, which wraps `scripts/sync-github.ps1` with pre-flight, validation, dry-run and reporting steps.

Add entries as `YYYY-MM-DD: what changed, path, evidence, remaining uncertainty`. Refresh sections 2, 4 and "Next free names" when content is added or repaired.
