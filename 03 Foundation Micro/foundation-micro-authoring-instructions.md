# Foundation Micro Authoring Instructions

Dokumen ini dipakai sebagai `custom instructions` untuk AI authoring soal `foundation_micro`.

Tujuan:
- menghasilkan soal micro loop per topik yang membantu siswa memahami konsep lewat diagnosis kesalahan, micro lesson, retry, dan drill terarah
- menjaga format output tetap konsisten dengan codebase saat ini
- menghindari soal yang hanya menguji hafalan tanpa mengungkap miskonsepsi

Status repo saat ini:
- output AI diimport ke `foundation_micro_*` library, bukan ke `question_bank_questions`
- editor lalu mereview set di `Foundation Micro Library`
- `main_questions` bisa digenerate menjadi `exam_set` untuk section terkait
- `drill_questions` disimpan di library untuk penguatan terarah berikutnya

## Cara Pakai

Pakai instruksi ini saat meminta AI seperti Cursor, Codex, atau model lain untuk membuat:
- `main micro-loop questions`
- `targeted drill questions`
- `concept map`
- `error tags`

Jika ingin hasil langsung bisa diolah, minta AI untuk:
- mengembalikan `JSON only`
- mengikuti template di [`foundation-micro-authoring-template.json`](foundation-micro-authoring-template.json) (satu folder dengan dokumen ini)
- tidak menambahkan penjelasan di luar JSON

## Prompt Siap Pakai

```md
You are authoring `foundation_micro` questions for an adaptive micro-learning loop.

Your job is to create high-quality multiple-choice items for Indonesian middle-school students.

You must optimize for:
- concept mastery
- misconception diagnosis
- short retry learning loops
- targeted follow-up drill generation

Output requirements:
- Return valid JSON only
- Follow the exact structure from `foundation-micro-authoring-template.json`
- Use Bahasa Indonesia for all student-facing text
- Keep metadata values lowercase where applicable
- Use `answer` as zero-based index
- Every main question must include `microLoop`
- Every distractor rule must map to a **specific wrong option index** (backend memetakan `microLoop.distractor_rules[str(selected_index)]` untuk opsi yang **salah**; diagnosis harus menjelaskan **mengapa opsi pada indeks itu** salah, bukan narasi yang lebih cocok ke opsi lain)
- Every distractor rule must contain:
  - `error_tag`
  - `error_type`
  - `diagnosis`
  - `micro_lesson`
  - `retry_question`
- `retry_question` must test the same underlying misconception with a simpler or cleaner number pattern

Pedagogical rules:
- One question should test one micro concept only
- Wrong answers must represent plausible student misconceptions, not random noise
- The correct answer must be unambiguously correct
- Options should be balanced in length and style
- Rationale must explain the correct method clearly and briefly
- `micro_lesson` must correct the misconception directly in 1-3 short sentences
- Avoid trick wording
- Avoid culturally specific context unless requested
- Prefer clean numbers for foundation level
- **KaTeX inline**: semua ekspresi matematika siswa-facing (soal, opsi bila berisi notasi, rationale, diagnosis, micro_lesson) memakai delimiter **`$ ... $`** untuk satu blok inline. Contoh pangkat: `$2^{4}$`, bukan `2^{4}` mentah. Pecahan: `$\frac{1}{2}$`. Jika satu opsi berisi beberapa `\frac` atau perbandingan (`<`, `=`), bungkus **seluruh** teks opsi dalam **satu** pasang `$...$`.
- Hindari `python -c "…$x…"` di **PowerShell** untuk uji string (variabel `$` di-expand shell); uji lewat file/skrip atau `json.loads`.

Difficulty rules:
- `easy`: direct concept application with low arithmetic load
- `medium`: still one concept, but slightly more transfer or representation shift
- `hard`: only use if explicitly requested

Question writing rules:
- Usually provide 4 options
- Do not make the correct option too visually obvious
- Avoid repeating identical number patterns across all items
- Retry questions should be easier than the original item
- Drill items may vary surface form, but must stay inside the same `concept_id`

Metadata rules:
- Use taxonomy names from `question-bank-metadata-taxonomy.json`:
  - subject: `matematika`
  - topic examples: `Bilangan & Operasi`
  - subtopic examples: `Bilangan bulat`, `Pecahan`, `FPB & KPK`, `Perbandingan & rasio`
- For mathematics, use only taxonomy values:
  - `skillType`: `recall`, `understanding`, `application`, `reasoning`, or `multi_step_problem`
  - `questionType`: `direct`, `story_problem`, `multi_step`, `visual_analysis`, or `concept_check`
- All items in this pack are still multiple-choice structurally, but `questionType` must follow the taxonomy above
- Do not use legacy pilot labels such as `concept_application`, `procedural_fluency`, or `multiple_choice` in `skillType` / `questionType`

Micro-loop design rules:
- Create 3-6 `main_questions` for each requested micro concept
- Create 5-10 `drill_questions` for each requested micro concept
- `concept_id` must be stable, snake_case, and concept-specific
- `error_tag` must be stable, snake_case, and misconception-specific
- `error_type` must be one of:
  - `concept`
  - `careless`
  - `strategy`
  - `representation`

Quality bar:
- If a distractor cannot be explained as a real student mistake, rewrite it
- If a retry question does not isolate the same misconception, rewrite it
- If a concept is too broad, split it into smaller concepts before writing items

When the user gives a topic like `bilangan bulat dan garis bilangan`, first infer a micro-concept breakdown, then author the items.
```

## Struktur Output yang Disarankan

AI sebaiknya menghasilkan 3 lapisan:

1. `authoring_request`
- mendeskripsikan topik, level, target jumlah concept, dan target jumlah soal

2. `micro_concepts`
- daftar concept yang dipecah dari topik besar
- masing-masing concept punya `concept_id`, deskripsi, dan daftar `target_error_tags`

3. Konten soal
- `main_questions`
- `drill_questions`

## Prinsip Authoring

### 1. Konsep harus kecil

Jangan author 1 concept sebesar:
- `bilangan bulat`
- `garis bilangan`

Lebih baik pecah menjadi:
- membandingkan bilangan bulat
- posisi pada garis bilangan
- gerak tambah/kurang di garis bilangan
- jarak antar titik pada garis bilangan

### 2. Distraktor harus diagnostik

Distraktor bagus:
- salah karena miskonsepsi yang jelas
- bisa diberi `diagnosis`
- bisa diberi `micro_lesson`
- bisa diberi `retry_question`

Distraktor jelek:
- asal beda angka
- tidak mewakili cara pikir siswa
- tidak bisa dijelaskan kenapa siswa memilihnya

### 3. Retry harus lebih sederhana

Retry bukan variasi acak.

Retry harus:
- tetap menguji miskonsepsi yang sama
- lebih bersih angkanya
- lebih pendek kalimatnya
- lebih sedikit beban kerja

### 4. Drill harus tetap sempit

`drill_questions` bukan set campuran.

Untuk satu `concept_id`, drill hanya boleh:
- mengulang konsep yang sama
- memakai representasi sedikit bervariasi
- meningkatkan kelancaran dan ketepatan

## Rubrik Cek Kualitas Sebelum Menerima Hasil AI

Cek setiap item:
- Apakah hanya menguji satu concept?
- Apakah semua opsi salah punya alasan yang masuk akal **untuk opsi itu** (bukan diagnosis yang “hampir benar” tapi menjelaskan pola kesalahan lain)?
- Apakah notasi matematika sudah KaTeX inline (`$...$`) di soal, rationale, diagnosis, micro_lesson, dan opsi bila berisi `\frac`/pangkat?
- Apakah `error_tag` cukup spesifik?
- Apakah `micro_lesson` memperbaiki miskonsepsi, bukan sekadar memberi tahu jawaban?
- Apakah `retry_question` lebih mudah dari soal utama?
- Apakah `concept_id` terlalu lebar?
- Apakah metadata topic/subtopic cocok dengan taxonomy repo ini?

## Pack matematika di repo ini (`math/`)

Untuk set authoring yang di-version sebagai JSON di **`03 Foundation MIcro/math/**/foundation-micro-authoring-pack.json`**:

| Skrip (folder `scripts/`) | Kapan dipakai |
|---------------------------|----------------|
| `align_microloop_distractors.py` | Setelah mengubah `question` / `options` / `answer`: bangun ulang `microLoop.distractor_rules` agar tiap indeks opsi salah punya aturan yang konsisten dengan generator (diagnosis, micro_lesson, retry). |
| `wrap_katex_mass.py` | Perbaikan massal pembungkus `$...$` untuk pola `N^{n}` dan `\frac{·}{·}` di field teks; opsi pecahan = satu blok `$...$` per opsi. Opsi `--dry-run`. Secara default memanggil align setelahnya. |
| `audit_microloop_distractors.py` | Cek struktur aturan, diagnosis menyebut nilai opsi salah, dan **parity** dengan `build_rule_for_wrong` di align. |
| `audit_katex_inline.py` | Cek delimiter `$` genap dan tidak ada pola math “mentah” di luar pasangan `$...$`. |

Urutan disarankan setelah edit isi: **`wrap_katex_mass.py`** (jika perlu) → **`align_microloop_distractors.py`** → **`audit_katex_inline.py`** + **`audit_microloop_distractors.py`**.

**Batas otomatisasi:** skrip align memakai heuristik; narasi diagnosis bisa konsisten secara indeks tetapi tetap perlu **review manusia** bila angka salah bisa muncul dari lebih dari satu miskonsepsi atau jika nada/kelas tidak pas.

## Saran Workflow Nyata

Urutan kerja yang saya sarankan:

1. Minta AI pecah topik menjadi `micro_concepts`
2. Review manusia: apakah concept map sudah cukup sempit
3. Minta AI generate `main_questions`
4. Review manusia: cek kualitas distractor dan diagnosis
5. Minta AI generate `drill_questions`
6. Untuk pack di `math/**/foundation-micro-authoring-pack.json`: jalankan **`audit_katex_inline.py`** dan **`audit_microloop_distractors.py`**; bila perlu **`wrap_katex_mass.py`** lalu **`align_microloop_distractors.py`** (lihat tabel di bagian *Pack matematika*)
7. Review hasil import di panel library
8. Generate `exam_set` dari `main_questions` bila set sudah siap

## Prompt Contoh

```md
Buatkan foundation micro authoring pack untuk topik `Bilangan bulat dan garis bilangan`.

Kebutuhan:
- subject: matematika
- topic: Bilangan & Operasi
- target subtopic utama: Bilangan bulat
- grade band: SMP foundation
- hasilkan 4 micro concepts
- setiap concept punya 3 main_questions
- setiap concept punya 5 drill_questions

Ikuti persis template JSON `foundation-micro-authoring-template.json`.
Return JSON only.
```

## Catatan Implementasi ke Codebase Ini

Codebase saat ini menerima JSON authoring lalu mengubahnya menjadi:
- `foundation_micro_sets`
- `foundation_micro_concepts`
- `foundation_micro_items`
- `foundation_micro_section_links`

Artinya source of truth sekarang adalah library `foundation_micro_*`, bukan seed SQL manual dan bukan `question_bank_questions`.

Implikasi praktis:
- `main_questions` tetap penting karena dipakai untuk generate `exam_set`
- `drill_questions` juga penting karena disimpan di library sebagai stok penguatan terarah
- format JSON harus dipikirkan sebagai `authoring pack`, bukan sebagai payload `exam_sets.questions` langsung

Opsional metadata yang juga didukung importer:
- `topicId`
- `subtopicId`

Gunakan dua field itu hanya jika Anda memang sudah tahu UUID taxonomy yang benar. Jika tidak, isi `topic` dan `subtopic` string saja sudah cukup.

## Output Discipline

Kalau meminta AI menulis JSON:
- minta `JSON only`
- jangan minta markdown
- jangan minta penjelasan tambahan
- kalau perlu, minta setiap string memakai ASCII biasa kecuali simbol matematika dalam **KaTeX inline** `$...$` (lihat aturan KaTeX di blok *Output requirements* di atas)
