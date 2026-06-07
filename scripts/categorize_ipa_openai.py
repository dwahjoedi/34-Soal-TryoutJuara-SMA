"""
Kategorisasi metadata IPA untuk Question Bank menggunakan OpenAI gpt-4.1-mini.

Persyaratan:
  pip install openai
  set OPENAI_API_KEY (atau di PowerShell: $env:OPENAI_API_KEY="sk-...")

Contoh:
  python scripts/categorize_ipa_openai.py
  python scripts/categorize_ipa_openai.py --question "Teks soal ..."
"""
from __future__ import annotations

import argparse
import json
import os
import sys

MODEL = "gpt-4.1-mini"

ALLOWED = {
    "skill_type": [
        "recall",
        "understanding",
        "application",
        "reasoning",
        "concept_understanding",
        "experiment_interpretation",
    ],
    "question_type": [
        "direct",
        "multi_step",
        "visual_analysis",
        "experiment_interpretation",
        "data_interpretation",
    ],
    "topic_subtopic": {
        "Gerak, Gaya & Energi": [
            "Gerak lurus",
            "Gaya & pengaruhnya terhadap benda",
            "Hukum Newton",
            "Usaha & energi",
            "Energi & transformasi energi",
            "Kalor & perpindahan panas",
            "Pesawat sederhana",
        ],
        "Listrik, Gelombang & Optik": [
            "Rangkaian listrik",
            "Keselamatan listrik",
            "Daya listrik",
            "Magnet sederhana",
            "Gelombang & bunyi",
            "Pemantulan cahaya",
            "Pembiasan cahaya",
        ],
        "Materi & Perubahannya": [
            "Struktur materi",
            "Unsur, senyawa, dan campuran",
            "Sifat fisika & kimia zat",
            "Perubahan fisika vs kimia",
            "Reaksi kimia",
            "Asam basa & pH",
            "Larutan & pemisahan campuran",
        ],
        "Sistem Kehidupan": [
            "Sel & jaringan",
            "Fotosintesis & respirasi tumbuhan",
            "Sistem pencernaan",
            "Sistem pernapasan",
            "Sistem peredaran darah",
            "Sistem organ manusia",
            "Pertumbuhan & perkembangan",
            "Kesehatan & gaya hidup sehat",
        ],
        "Ekologi & Pewarisan": [
            "Ekosistem",
            "Rantai makanan & jaring-jaring makanan",
            "Adaptasi & interaksi makhluk hidup",
            "Lingkungan & pencemaran",
            "Konservasi & pelestarian",
            "Genetika dasar",
        ],
        "Bumi & Alam Semesta": [
            "Rotasi & revolusi bumi",
            "Fenomena astronomi sederhana",
            "Cuaca & iklim",
            "Sumber daya alam & kelestarian",
        ],
    },
}

DEFAULT_QUESTION = """Bacaan untuk soal 16–17:

Danau kecil di taman kota mengalami penurunan debit air masuk selama musim kemarau panjang. Air menjadi lebih keruh dan suhu permukaan naik di siang hari. Banyak ikan kecil terlihat kehilangan semangat dan mengapung di permukaan di sore hari.

Inferensi paling tepat tentang kondisi air bagi ikan adalah ..."""

SYSTEM = """Anda mengklasifikasikan soal IPA SD untuk Question Bank TryoutJuara.
subject selalu: ipa

Aturan WAJIB:
1) topic dan subtopic HARUS pasangan EXACT dari daftar yang diberikan (huruf, spasi, tanda baca sama persis).
2) skill_type HARUS salah satu dari daftar IPA.
3) question_type HARUS salah satu dari daftar IPA.
4) Pilih SATU pasangan topic+subtopic yang paling mewakili inti soal.
5) Keluaran HANYA JSON valid satu objek, tanpa markdown fence.

Schema JSON:
{
  "topic": string,
  "subtopic": string,
  "skill_type": string,
  "question_type": string,
  "brief_rationale_id": string (1-3 kalimat Bahasa Indonesia, mengapa metadata ini dipilih)
}

DAFTAR topic -> subtopic (gunakan persis):
""" + json.dumps(
    ALLOWED["topic_subtopic"], ensure_ascii=False, indent=2
) + """

skill_type (IPA): """ + json.dumps(ALLOWED["skill_type"]) + """

question_type (IPA): """ + json.dumps(ALLOWED["question_type"]) + """
"""


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--question", default=None, help="Teks stem + pertanyaan")
    args = p.parse_args()
    question = (args.question or DEFAULT_QUESTION).strip()

    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        print(
            "Error: OPENAI_API_KEY tidak di-set. Contoh PowerShell:\n"
            '  $env:OPENAI_API_KEY="sk-..."\n'
            "  python scripts/categorize_ipa_openai.py",
            file=sys.stderr,
        )
        sys.exit(1)

    try:
        from openai import OpenAI
    except ImportError:
        print("Error: pip install openai", file=sys.stderr)
        sys.exit(1)

    client = OpenAI(api_key=key)
    resp = client.chat.completions.create(
        model=MODEL,
        temperature=0.2,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM},
            {
                "role": "user",
                "content": "Klasifikasikan soal berikut:\n\n" + question,
            },
        ],
    )
    raw = resp.choices[0].message.content or "{}"
    data = json.loads(raw)
    print(json.dumps(data, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
