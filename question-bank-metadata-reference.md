# Question Bank Metadata Reference

Referensi ini dipakai untuk penulisan file JSON import ke Question Bank dan untuk **konsistensi metadata pada analytic dashboard siswa**.

Gunakan **value persis** (huruf, spasi, tanda baca) seperti di bawah untuk field:
- `subject`
- `difficulty`
- `topic`
- `subtopic`
- `skill_type`
- `question_type`

---

## Kerangka kurikulum & internasional (ringkas)

Metadata dirancang agar:

1. **Selaras Kurikulum Merdeka (SD)** — isu IPA/IPS/Matematika/Bahasa pada fase C (kelas 4–6) dan fase B bila relevan, mengacu pada **capaian pembelajaran** dan **elemen** (numerasi, literasi, sains, dll.) tanpa menyalin teks capaian ke dalam JSON.
2. **Dapat dibandingkan secara internasional** melalui **pemetaan silang** (bukan field tambahan di JSON):
   - **TIMSS** — domain kognitif: *Knowing*, *Applying*, *Reasoning* (lihat pemetaan `skill_type` di bawah).
   - **Singapore Primary Science (MOE)** — tema: *Diversity, Cycles, Systems, Interactions, Energy* (lihat tabel pemetaan topik IPA).
3. **Stabil untuk dashboard** — satu subtopik = satu label canonical; hindari sinonim ganda untuk nilai yang sama.

### Pemetaan `skill_type` → domain kognitif (analitik)

| Nilai `skill_type` | Arah interpretasi dashboard | Analogi TIMSS (tingkat SD) |
|--------------------|-----------------------------|----------------------------|
| `recall` | Mengingat fakta, istilah, prosedur langsung | Knowing |
| `understanding` / `concept_understanding` | Menjelaskan, membedakan, mengaitkan ide | Knowing–Applying |
| `application` / `multi_step_problem` | Memakai konsep pada konteks/soal | Applying |
| `reasoning` | Inferensi, argumen, pembuktian sederhana, multi-langkah nalar | Reasoning |
| `experiment_interpretation` (IPA) | Membaca percobaan, variabel, kesimpulan | Applying–Reasoning |
| `literal` / `grammar` / `vocabulary` (bahasa) | Fokus teks/kaidah permukaan | Knowing–Applying |
| `inferential` / `evaluative` | Makna tersirat, penilaian | Reasoning |

**Catatan IPA:** `concept_understanding` dipakai bila soal menekankan **model konsep** (mis. hubungan sistem, siklus); `understanding` untuk pemahaman umum yang tidak perlu membedakan secara ketat di dashboard.

### Pemetaan topik IPA → tema MOE Primary Science

| Topik di referensi ini | Tema MOE (utama) |
|------------------------|------------------|
| Gerak, Gaya & Energi | Interactions, Energy |
| Listrik, Gelombang & Optik | Systems, Interactions, Energy |
| Materi & Perubahannya | Cycles, Systems |
| Sistem Kehidupan | Systems, Diversity |
| Ekologi & Pewarisan | Systems, Diversity, Cycles |
| Bumi & Alam Semesta | Cycles, Systems (Bumi sebagai sistem) |

---

## Aturan konsistensi untuk analytic dashboard

- **Exact match:** `topic` dan `subtopic` harus sama persis dengan daftar di file ini (termasuk `&`, koma, huruf kapital di awal kata).
- **Satu kategori utama per soal:** pilih **satu** pasangan `topic` + `subtopic` yang paling mewakili **inti** soal (bukan semua konsep yang tersentuh).
- **`skill_type` per mapel:** hanya gunakan nilai yang terdaftar untuk `subject` tersebut.
- **`question_type`:** gambarkan **bentuk soal**, bukan topik (mis. `data_interpretation` jika intinya membaca tabel/grafik).
- **Tags bebas** (`tags` array): boleh untuk kampanye, paket tryout, atau label internal; **jangan** menggantikan `topic`/`subtopic` untuk agregasi resmi.
- **Migrasi data lama:** jika menemukan label topik/subtopik di luar daftar ini, normalisasi ke entri terdekat di bawah dan catat di changelog internal proyek Anda.

---

## Subject

Valid values:
- `matematika`
- `ipa`
- `bahasa_indonesia`
- `bahasa_inggris`
- `ips`

## Difficulty

Valid values:
- `easy`
- `medium`
- `hard`

## Skill Type

### Matematika
- `recall`
- `understanding`
- `application`
- `reasoning`
- `multi_step_problem`

### IPA
- `recall`
- `understanding`
- `application`
- `reasoning`
- `concept_understanding`
- `experiment_interpretation`

### Bahasa Indonesia
- `literal`
- `inferential`
- `evaluative`
- `understanding`
- `reasoning`

### Bahasa Inggris
- `grammar`
- `comprehension`
- `vocabulary`
- `literal`
- `inferential`

### IPS
- `recall`
- `understanding`
- `application`
- `reasoning`
- `multi_step_problem`

## Question Type

### Matematika
- `direct`
- `story_problem`
- `multi_step`
- `visual_analysis`
- `concept_check`

### IPA
- `direct`
- `multi_step`
- `visual_analysis`
- `experiment_interpretation`
- `data_interpretation`

### Bahasa Indonesia
- `direct`
- `short_text`
- `dialogue`
- `functional_text`
- `concept_check`

### Bahasa Inggris
- `direct`
- `short_text`
- `dialogue`
- `functional_text`
- `concept_check`

### IPS
- `direct`
- `story_problem`
- `multi_step`
- `visual_analysis`
- `concept_check`

---

## Topic dan Subtopic

### Matematika

*Selaras kerangka bilangan, geometri, pengukuran, statistik, dan aljabar SD pada Kurikulum Merdeka (fase B–C).*

#### Bilangan & Operasi
- Operasi bilangan
- Bilangan bulat
- Pecahan
- Desimal & persen
- FPB & KPK
- Perbandingan & rasio
- Bilangan berpangkat sederhana

#### Aljabar
- Persamaan linear satu variabel
- Sistem persamaan linear dua variabel
- Operasi aljabar
- Pola bilangan
- Relasi & fungsi

#### Geometri
- Bangun datar
- Bangun ruang
- Pengukuran & satuan
- Sudut & garis
- Transformasi
- Teorema Pythagoras

#### Statistik & Peluang
- Mean, median, modus
- Penyajian & interpretasi data
- Peluang sederhana

#### Pemodelan Matematika
- Translasi verbal ke model matematika
- Aritmetika sosial
- Perbandingan dalam konteks
- Problem campuran multi-konsep

### IPA

*Mencakup fenomena IPA SD: materi, energi, makhluk hidup, bumi, dan teknologi sederhana. Subtopik melengkapi ranah yang umum di KM serta standar sains dasar internasional.*

#### Gerak, Gaya & Energi
- Gerak lurus
- Gaya & pengaruhnya terhadap benda
- Hukum Newton
- Usaha & energi
- Energi & transformasi energi
- Kalor & perpindahan panas
- Pesawat sederhana

#### Listrik, Gelombang & Optik
- Rangkaian listrik
- Keselamatan listrik
- Daya listrik
- Magnet sederhana
- Gelombang & bunyi
- Pemantulan cahaya
- Pembiasan cahaya

#### Materi & Perubahannya
- Struktur materi
- Unsur, senyawa, dan campuran
- Sifat fisika & kimia zat
- Perubahan fisika vs kimia
- Reaksi kimia
- Asam basa & pH
- Larutan & pemisahan campuran

#### Sistem Kehidupan
- Sel & jaringan
- Fotosintesis & respirasi tumbuhan
- Sistem pencernaan
- Sistem pernapasan
- Sistem peredaran darah
- Sistem organ manusia
- Pertumbuhan & perkembangan
- Kesehatan & gaya hidup sehat

#### Ekologi & Pewarisan
- Ekosistem
- Rantai makanan & jaring-jaring makanan
- Adaptasi & interaksi makhluk hidup
- Lingkungan & pencemaran
- Konservasi & pelestarian
- Genetika dasar

#### Bumi & Alam Semesta
- Rotasi & revolusi bumi
- Fenomena astronomi sederhana
- Cuaca & iklim
- Sumber daya alam & kelestarian

### Bahasa Indonesia

*Selaras literasi membaca–menulis dan unsur kebahasaan SD.*

#### Membaca Pemahaman
- Ide pokok
- Informasi tersurat
- Inferensi
- Tujuan penulis
- Gagasan pokok & pendukung

#### Kebahasaan
- Tata kalimat
- Ejaan
- Sinonim & antonim
- Makna kata dalam konteks

#### Struktur Teks
- Narasi
- Deskripsi
- Eksposisi
- Argumentasi
- Prosedur

#### Analisis Teks
- Kesimpulan
- Hubungan antar paragraf
- Sudut pandang & sikap penulis

### Bahasa Inggris

*Level SD: receptive skills & grammar dasar.*

#### Reading Comprehension
- Main idea
- Detail
- Inference
- Vocabulary in context

#### Grammar
- Tenses
- Subject-verb agreement
- Preposition
- Passive voice
- Comparative & superlative

#### Vocabulary
- Synonym & antonym
- Context meaning
- Word usage
- Word formation (dasar)

#### Functional Text
- Announcement
- Invitation & short message
- Dialogue
- Short text comprehension

### IPS

*Geografi, sejarah, ekonomi, dan sosial dasar SD; mendukung literasi data sosial.*

#### Geografi
- Peta & denah
- Wilayah & lokasi
- Kondisi geografis Indonesia
- Lingkungan hidup & sumber daya
- Interaksi ruang

#### Sejarah
- Sejarah Indonesia
- Kronologi peristiwa
- Tokoh & perubahan sosial
- Warisan budaya & nasionalisme

#### Ekonomi
- Ekonomi dasar
- Kegiatan ekonomi
- Permintaan & penawaran
- Peran konsumen & produsen

#### Sosiologi
- Interaksi sosial
- Lembaga sosial
- Norma & nilai sosial
- Mobilitas sosial

#### Interpretasi Data Sosial
- Grafik sosial ekonomi
- Kependudukan
- Studi kasus

---

## Template JSON (struktur flat TryoutJuara)

```json
[
  {
    "subject": "matematika",
    "difficulty": "easy",
    "topic": "Bilangan & Operasi",
    "subtopic": "Operasi bilangan",
    "skill_type": "application",
    "question_type": "direct",
    "tags": ["contoh"],
    "is_active": true,
    "question": "Hasil dari 12 + 8 adalah ...",
    "options": ["18", "19", "20", "21"],
    "answer": 2,
    "rationale": "12 + 8 = 20."
  }
]
```

---

## Template JSON — soal ber-tabel (dual-format: flat + Rich Content TipTap)

Gunakan pola ini **hanya** untuk soal yang menyajikan **data tabel** (grid baris/kolom) agar tabel dapat dirender di editor TryoutJuara. Field flat tetap wajib ada (untuk validasi); objek `content` menyediakan versi *rich* untuk renderer.

```json
[
  {
    "subject": "ips",
    "difficulty": "medium",
    "topic": "Interpretasi Data Sosial",
    "subtopic": "Grafik sosial ekonomi",
    "skill_type": "reasoning",
    "question_type": "visual_analysis",
    "tags": ["contoh-tabel", "table"],
    "is_active": true,
    "question": "Perhatikan tabel berikut.\n\nKota\tJumlah Penduduk\nJakarta\t10.500.000\nSurabaya\t2.900.000\n\nKota dengan jumlah penduduk terbesar adalah ...",
    "options": ["Surabaya", "Jakarta", "Bandung", "Medan"],
    "answer": 1,
    "rationale": "Langkah 1: Bandingkan angka — Jakarta 10.500.000 > Surabaya 2.900.000.\n\nInsight kunci: Jakarta adalah kota dengan penduduk terbanyak.",
    "content": {
      "question": "Perhatikan tabel berikut.\n\nKota\tJumlah Penduduk\nJakarta\t10.500.000\nSurabaya\t2.900.000\n\nKota dengan jumlah penduduk terbesar adalah ...",
      "questionRich": {
        "type": "doc",
        "content": [
          {
            "type": "paragraph",
            "content": [{ "type": "text", "text": "Perhatikan tabel berikut." }]
          },
          {
            "type": "table",
            "content": [
              {
                "type": "tableRow",
                "content": [
                  { "type": "tableHeader", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Kota" }] }] },
                  { "type": "tableHeader", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Jumlah Penduduk" }] }] }
                ]
              },
              {
                "type": "tableRow",
                "content": [
                  { "type": "tableCell", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Jakarta" }] }] },
                  { "type": "tableCell", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "10.500.000" }] }] }
                ]
              },
              {
                "type": "tableRow",
                "content": [
                  { "type": "tableCell", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Surabaya" }] }] },
                  { "type": "tableCell", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "2.900.000" }] }] }
                ]
              }
            ]
          },
          {
            "type": "paragraph",
            "content": [{ "type": "text", "text": "Kota dengan jumlah penduduk terbesar adalah ..." }]
          }
        ]
      },
      "options": ["Surabaya", "Jakarta", "Bandung", "Medan"],
      "optionsRich": [
        { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Surabaya" }] }] },
        { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Jakarta" }] }] },
        { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Bandung" }] }] },
        { "type": "doc", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Medan" }] }] }
      ],
      "answer": 1,
      "rationale": "Langkah 1: Bandingkan angka — Jakarta 10.500.000 > Surabaya 2.900.000.\n\nInsight kunci: Jakarta adalah kota dengan penduduk terbanyak.",
      "rationaleRich": {
        "type": "doc",
        "content": [
          { "type": "paragraph", "content": [{ "type": "text", "text": "Langkah 1: Bandingkan angka — Jakarta 10.500.000 > Surabaya 2.900.000." }] },
          { "type": "paragraph", "content": [{ "type": "text", "text": "Insight kunci: Jakarta adalah kota dengan penduduk terbanyak." }] }
        ]
      }
    }
  }
]
```

### Aturan format Rich Content TipTap

| Komponen | Struktur |
|----------|----------|
| Root dokumen | `{ "type": "doc", "content": [...] }` |
| Paragraf teks | `{ "type": "paragraph", "content": [{ "type": "text", "text": "..." }] }` |
| Baris header tabel | `{ "type": "tableRow", "content": [ { "type": "tableHeader", ... }, ... ] }` |
| Baris data tabel | `{ "type": "tableRow", "content": [ { "type": "tableCell", ... }, ... ] }` |
| Isi sel | `{ "type": "paragraph", "content": [{ "type": "text", "text": "..." }] }` |

**Catatan penting:**
- Nilai semua cell harus **string** (bukan number/boolean).
- Urutan konten `questionRich`: *intro paragraph* → *table* → *closing question paragraph*.
- `rationaleRich` berisi beberapa `paragraph` (satu per blok logis); tidak perlu bold/italic.
- Soal tanpa tabel tetap menggunakan **format flat biasa** tanpa objek `content`.

---

## Catatan untuk question creator

- `answer` memakai indeks basis **0** (`0` = opsi pertama).
- `options` minimal 2, biasanya 4.
- Isi `topic` dan `subtopic` dari daftar di atas agar **dashboard agregasi** (per topik, per subtopik, per skill) akurat.
- Jika belum yakin subtopik, pilih **subtopik paling spesifik yang masih benar**; jangan membuat string baru di luar daftar.
- Metadata lain (`topic_id`, `subtopic_id`) boleh dikosongkan untuk diisi sistem.

---

## Changelog referensi (internal)

| Versi | Perubahan ringkas |
|-------|-------------------|
| 3 | Penambahan template **dual-format tabel** (flat + Rich Content TipTap `questionRich`/`optionsRich`/`rationaleRich`); aturan kapan pakai `content` vs flat; tabel aturan TipTap node. |
| 2 | Penambahan kerangka KM/internasional, aturan dashboard, topik **Bumi & Alam Semesta**, perluasan subtopik IPA/Matematika/IPS/Bahasa, template JSON flat, pemetaan TIMSS/MOE. |
| 1 | Struktur awal subject, skill, question type, topic/subtopic inti. |
