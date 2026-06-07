"""
Rebuild microLoop.distractor_rules so diagnosis/micro_lesson/retry_question
match the *specific wrong option index* (player payload uses selected index).

Run: python scripts/align_microloop_distractors.py
"""
from __future__ import annotations

import json
import re
from fractions import Fraction
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

BASE = Path(r"c:\UnCloud\34 Soal TryoutJuara\03 Foundation MIcro\math")


def strip_md_katex(s: str) -> str:
    s = re.sub(r"\$\$([^$]+)\$\$", r"\1", s)
    s = re.sub(r"\$([^$]+)\$", r"\1", s)
    s = s.replace("**", "")
    return s


_FRAC_SNIP = re.compile(r"\\frac\{[^{}]+\}\{[^{}]+\}")
_PAREN_POW_SNIP = re.compile(r"\([^)]*\)\^\{[^}]+\}")
_DIGIT_POW_SNIP = re.compile(r"\d+\^\{[^}]+\}")


def katex_inline_snippet(plain: str, max_len: int = 200) -> str:
    """Bungkus \\frac, (..)^{n}, dan N^{n} untuk teks biasa (mis. cuplikan diagnosis)."""
    if not plain:
        return ""

    def wrap(pat: re.Pattern[str], text: str) -> str:
        parts: List[str] = []
        pos = 0
        for m in pat.finditer(text):
            parts.append(text[pos : m.start()])
            inner = m.group(0)
            if inner.startswith("$") and inner.endswith("$"):
                parts.append(inner)
            else:
                parts.append(f"${inner}$")
            pos = m.end()
        parts.append(text[pos:])
        return "".join(parts)

    s = plain.strip()
    s = wrap(_FRAC_SNIP, s)
    s = wrap(_PAREN_POW_SNIP, s)
    s = wrap(_DIGIT_POW_SNIP, s)
    if len(s) > max_len:
        s = s[: max_len - 3] + "..."
    return s


def is_placeholder_pack(options: List[str]) -> bool:
    if not options:
        return True
    first = options[0].strip()
    if first.startswith("Opsi ") or first.startswith("Pilihan "):
        return True
    if first.startswith("Konsep "):
        return True
    return False


def parse_int_option(s: str) -> Optional[int]:
    t = s.strip()
    if re.fullmatch(r"-?\d+", t):
        return int(t)
    # Rp12.000 style (Indonesian thousands)
    if re.match(r"^rp", t, re.I):
        t2 = re.sub(r"[^\d]", "", t)
        if t2.isdigit():
            return int(t2)
    return None


def parse_fraction_option(s: str) -> Optional[Fraction]:
    t = s.strip()
    m = re.fullmatch(r"(\d+)\s*/\s*(\d+)", t)
    if m:
        return Fraction(int(m.group(1)), int(m.group(2)))
    m2 = re.fullmatch(r"(\d+)\s*:\s*(\d+)", t)
    if m2:
        return Fraction(int(m2.group(1)), int(m2.group(2)))
    return None


def sum_of_squares_bases(q: str) -> Optional[Tuple[int, int]]:
    """Match 5^{2} + 4^{2} or 5^2 + 4^2 style (with optional spaces)."""
    plain = strip_md_katex(q)
    m = re.search(
        r"(\d+)\s*\^\{\s*2\s*\}\s*\+\s*(\d+)\s*\^\{\s*2\s*\}",
        plain,
    ) or re.search(r"(\d+)\s*\^2\s*\+\s*(\d+)\s*\^2", plain)
    if m:
        return int(m.group(1)), int(m.group(2))
    return None


def single_power(q: str) -> Optional[Tuple[int, int]]:
    plain = strip_md_katex(q).replace(" ", "")
    m = re.search(r"(\d+)\^\{(\d+)\}", plain)
    if m:
        return int(m.group(1)), int(m.group(2))
    m2 = re.search(r"(\d+)\^(\d+)", plain)
    if m2:
        return int(m2.group(1)), int(m2.group(2))
    return None


def sqrt_target(q: str) -> Optional[int]:
    plain = strip_md_katex(q)
    m = re.search(r"Akar\s+kuadrat\s+dari\s+(\d+)", plain, re.I)
    if m:
        return int(m.group(1))
    return None


def cbrt_target(q: str) -> Optional[int]:
    plain = strip_md_katex(q)
    m = re.search(r"Akar\s+pangkat\s+tiga\s+dari\s+(\d+)", plain, re.I)
    if m:
        return int(m.group(1))
    return None


def parse_simple_plsv(q: str) -> Optional[Tuple[str, int, int, int]]:
    """
    Return (kind, param1, param2, correct_x) for very common SD forms.
    kind: 'x_plus', 'x_minus', 'ax'
    """
    plain = strip_md_katex(q).replace(" ", "")
    m = re.search(r"x\+(\d+)=(\d+)", plain)
    if m:
        c, rhs = int(m.group(1)), int(m.group(2))
        return "x_plus", c, rhs, rhs - c
    m = re.search(r"x-(\d+)=(\d+)", plain)
    if m:
        c, rhs = int(m.group(1)), int(m.group(2))
        return "x_minus", c, rhs, rhs + c
    m = re.search(r"(\d+)x=(\d+)", plain)
    if m:
        a, rhs = int(m.group(1)), int(m.group(2))
        if rhs % a == 0:
            return "ax", a, rhs, rhs // a
    return None


def rule(
    error_tag: str,
    error_type: str,
    diagnosis: str,
    micro_lesson: str,
    rq_q: str,
    rq_opts: List[str],
    rq_ans: int,
) -> Dict[str, Any]:
    return {
        "error_tag": error_tag,
        "error_type": error_type,
        "diagnosis": diagnosis,
        "micro_lesson": micro_lesson,
        "retry_question": {
            "question": rq_q,
            "options": rq_opts,
            "answer": rq_ans,
        },
    }


def generic_numeric_rule(
    wrong_val: int,
    correct_val: int,
    wrong_label: str,
    correct_label: str,
    question_plain: str = "",
) -> Dict[str, Any]:
    diff = abs(wrong_val - correct_val)
    qref = (question_plain or "").strip()
    q_show = katex_inline_snippet(qref, 200)
    qbit = f" Ulangi pembacaan soal: «{q_show}»." if q_show else ""

    if diff <= 2:
        diag = (
            f"Memilih {wrong_label} hampir sama dengan jawaban benar ({correct_label}), "
            f"artinya hampir semua langkah sudah benar tetapi hasil akhir masih meleset sedikit.{qbit}"
        )
    elif wrong_val < correct_val:
        diag = (
            f"Memilih {wrong_label} menghasilkan bilangan yang lebih kecil dari jawaban benar ({correct_label}). "
            f"Itu berarti masih ada bagian operasi atau suku dari soal yang belum kamu hitung penuh, "
            f"atau ada langkah yang terlalu banyak dikurangi.{qbit}"
        )
    elif wrong_val > correct_val:
        diag = (
            f"Memilih {wrong_label} menghasilkan bilangan yang lebih besar dari jawaban benar ({correct_label}). "
            f"Itu berarti kemungkinan ada suku yang terhitung dua kali, operasi penggandaan/pangkat yang tidak "
            f"diminta soal, atau langkah yang seharusnya mengurangi malah menjumlahkan.{qbit}"
        )
    else:
        diag = (
            f"Memilih {wrong_label} tidak menghasilkan nilai yang sama dengan penyelesaian utuh soal "
            f"(jawaban benar: {correct_label}). "
            f"Tulis ulang model satu baris dari soal, lalu hitung perlahan sampai hasil akhir.{qbit}"
        )

    return rule(
        "numeric_mismatch",
        "careless" if diff <= 3 else "strategy",
        diag,
        "Tulis ulang langkah hitung dari awal, lalu cocokkan hasil akhir dengan opsi.",
        "**Hitung** 10 + 7 = ...",
        ["15", "16", "17", "18"],
        2,
    )


def plsv_residual_rule(
    kind: str,
    p1: int,
    p2: int,
    x_ok: int,
    wv: int,
    wrong_label: str,
    correct_label: str,
) -> Optional[Dict[str, Any]]:
    """
    Wrong integer on a parsed PLSV item, after the main conceptual distractors.
    p1,p2 are (c,rhs) for x±c=rhs or (a,rhs) for ax=rhs.
    """
    if kind == "x_plus":
        c, rhs = p1, p2
        if wv == x_ok - 1:
            return rule(
                "plsv_off_by_one_kecil",
                "careless",
                f"Jawaban {wrong_label} satu kurang dari nilai $x$ yang benar ({correct_label}). "
                f"Untuk $x+{c}={rhs}$, seharusnya $x={rhs}-{c}$; cek lagi pengurangan terakhir.",
                "Setelah memindahkan konstanta, pastikan operasi terakhir di ruas $x$ benar-benar kebalikan dari yang di kiri.",
                f"**Nilai** $x$ jika $x+{c}={rhs}$ adalah...",
                [str(x_ok - 2), str(x_ok - 1), str(x_ok), str(x_ok + 1)],
                2,
            )
        if wv == x_ok + 1:
            return rule(
                "plsv_off_by_one_besar",
                "careless",
                f"Jawaban {wrong_label} satu lebih dari nilai $x$ yang benar ({correct_label}). "
                f"Untuk $x+{c}={rhs}$, hitung lagi $x={rhs}-{c}$.",
                "Kurangkan konstanta dari ruas kanan sekali saja; hindari mengurangi atau menjumlahkan ganda.",
                f"**Nilai** $x$ jika $x+{c}={rhs}$ adalah...",
                [str(x_ok - 1), str(x_ok), str(x_ok + 1), str(x_ok + 2)],
                1,
            )
        if wv == rhs + c:
            return rule(
                "plsv_jumlahkan_ruang_kanan_dan_konstanta",
                "concept",
                f"Jawaban {wrong_label} sama dengan ${rhs}+{c}$, seolah $x$ dijumlahkan dengan konstanta di kiri. "
                f"Padahal yang benar adalah mengurangkan: $x={rhs}-{c}$.",
                "Di persamaan $x+k=...$, untuk mencari $x$ gunakan ruas kanan dikurangi $k$, bukan ditambah.",
                f"**Nilai** $x$ jika $x+{c}={rhs}$ adalah...",
                [str(rhs + c), str(rhs - c), str(c), str(rhs)],
                1,
            )
    if kind == "x_minus":
        c, rhs = p1, p2
        if wv == x_ok - 1:
            return rule(
                "plsv_off_by_one_kecil",
                "careless",
                f"Jawaban {wrong_label} satu kurang dari $x$ yang benar ({correct_label}). "
                f"Untuk $x-{c}={rhs}$, seharusnya $x={rhs}+{c}$.",
                "Setelah memindahkan $-{c}$, ruas kanan harus ditambah $c$, bukan dikurangi.",
                f"**Nilai** $x$ jika $x-{c}={rhs}$ adalah...",
                [str(x_ok - 1), str(x_ok), str(x_ok + 1), str(rhs)],
                1,
            )
        if wv == x_ok + 1:
            return rule(
                "plsv_off_by_one_besar",
                "careless",
                f"Jawaban {wrong_label} satu lebih dari $x$ yang benar ({correct_label}). "
                f"Cek penjumlahan $ {rhs}+{c}$.",
                "Untuk $x-k=...$, nilai $x$ adalah ruas kanan ditambah $k$.",
                f"**Nilai** $x$ jika $x-{c}={rhs}$ adalah...",
                [str(x_ok - 1), str(x_ok), str(x_ok + 1), str(rhs + c)],
                1,
            )
        if wv == rhs - c:
            return rule(
                "plsv_kurang_bukan_tambah",
                "concept",
                f"Jawaban {wrong_label} sama dengan ${rhs}-{c}$, seolah konstanta dikurangkan dari ruas kanan. "
                f"Untuk $x-{c}={rhs}$, yang benar $x={rhs}+{c}={correct_label}$.",
                "Tanda minus di kiri berarti di ruas lain kita tambahkan bilangan yang sama.",
                f"**Nilai** $x$ jika $x-{c}={rhs}$ adalah...",
                [str(rhs - c), str(x_ok), str(rhs + c), str(rhs)],
                1,
            )
    if kind == "ax":
        a, rhs = p1, p2
        if wv == rhs + a or wv == rhs - a:
            return rule(
                "plsv_ax_tambah_kurang_koefisien",
                "strategy",
                f"Jawaban {wrong_label} terlihat seperti $ {rhs}\\pm{a}$; untuk $ {a}x={rhs}$ langkahnya membagi: "
                f"$x={rhs}/{a}$, bukan menambah atau mengurangi $a$ pada ruas kanan.",
                "Koefisien di depan $x$ dihilangkan dengan membagi kedua ruas dengan bilangan itu.",
                f"**Nilai** $x$ jika ${a}x={rhs}$ adalah...",
                [str(rhs // a - 1), str(rhs // a), str(rhs + a), str(rhs - a)],
                1,
            )
        if wv == x_ok - 1 or wv == x_ok + 1:
            return rule(
                "plsv_pembagian_hampir",
                "careless",
                f"Jawaban {wrong_label} dekat hasil bagi ${rhs}/{a}$ yang benar ({correct_label}); "
                f"kemungkinan sisa pembagian atau hitung cepat yang kurang teliti.",
                "Ulangi pembagian $b/a$ dengan tulis tengah: berapa kali $a$ masuk ke $b$ tepat?",
                f"**Nilai** $x$ jika ${a}x={rhs}$ adalah...",
                [str(x_ok - 1), str(x_ok), str(x_ok + 1), str(a)],
                1,
            )
    return None


def build_rule_for_wrong(
    question: str,
    options: List[str],
    answer_idx: int,
    wrong_idx: int,
) -> Dict[str, Any]:
    wrong_label = options[wrong_idx].strip()
    correct_label = options[answer_idx].strip()
    wv = parse_int_option(wrong_label)
    cv = parse_int_option(correct_label)
    q_plain = strip_md_katex(question)

    # --- Persamaan linear sangat sederhana (x+k=..., x-k=..., ax=...) ---
    pl = parse_simple_plsv(question)
    if pl and wv is not None and cv is not None:
        kind, p1, p2, x_ok = pl
        if x_ok == cv:
            if kind == "x_plus" and wv == p1:
                return rule(
                    "konstanta_bukan_nilai_x",
                    "concept",
                    f"Jawaban {wrong_label} sama dengan angka yang ditambahkan ke $x$ di soal, "
                    "bukan nilai $x$ setelah diselesaikan.",
                    "Untuk $x+k=...$, hitung $x$ dengan mengurangkan $k$ dari ruas kanan.",
                    "**Nilai** $x$ jika $x+5=12$ adalah...",
                    ["5", "7", "12", "17"],
                    1,
                )
            if kind == "x_plus" and wv == p2:
                return rule(
                    "ruas_kanan_bukan_nilai_x",
                    "concept",
                    f"Jawaban {wrong_label} memakai nilai ruas kanan persamaan tanpa menyelesaikan $x$.",
                    "Selesaikan dulu: kurangkan konstanta di kiri dari ruas kanan untuk mendapatkan $x$.",
                    "**Nilai** $x$ jika $x+4=10$ adalah...",
                    ["4", "6", "10", "14"],
                    1,
                )
            if kind == "x_minus" and wv == p1:
                return rule(
                    "konstanta_bukan_nilai_x",
                    "concept",
                    f"Jawaban {wrong_label} memakai angka yang dikurangkan dari $x$, bukan nilai $x$.",
                    "Untuk $x-k=...$, nilai $x$ adalah penjumlahan: ruas kanan + $k$.",
                    "**Nilai** $x$ jika $x-3=8$ adalah...",
                    ["3", "8", "11", "5"],
                    2,
                )
            if kind == "ax" and wv in (p1, p2):
                return rule(
                    "koefisien_atau_ruang_kanan_terpilih",
                    "strategy",
                    f"Jawaban {wrong_label} terlihat seperti memilih koefisien $x$ atau ruas kanan, bukan nilai $x$.",
                    "Untuk $ax=b$, bagi kedua ruas dengan $a$: $x=b/a$.",
                    "**Nilai** $x$ jika $4x=20$ adalah...",
                    ["4", "5", "16", "24"],
                    1,
                )
            residual = plsv_residual_rule(
                kind, p1, p2, x_ok, wv, wrong_label, correct_label
            )
            if residual:
                return residual

    # --- Sum of two squares ---
    ss = sum_of_squares_bases(question)
    if ss and wv is not None and cv is not None:
        a, b = ss
        a2, b2 = a * a, b * b
        correct_sum = a2 + b2
        if wrong_label == str(a2):
            return rule(
                "hanya_suku_pertama_pangkat",
                "concept",
                f"Jawaban {wrong_label} muncul jika kamu baru menghitung suku pertama "
                f"${a}^{{2}}={a2}$ tetapi belum menambahkan suku kedua ${b}^{{2}}$.",
                "Selesaikan tiap pangkat dulu, lalu jumlahkan semua suku sebelum memilih jawaban.",
                f"**Nilai** ${3}^{{2}}+{2}^{{2}}$ adalah...",
                [str(3 * 3), str(3 * 3 + 2 * 2), str((3 + 2) ** 2), str(3 * 3 * 2 * 2)],
                1,
            )
        if wrong_label == str(b2):
            return rule(
                "hanya_suku_kedua_pangkat",
                "concept",
                f"Jawaban {wrong_label} muncul jika kamu hanya menghitung ${b}^{{2}}$ "
                f"tanpa menambahkan ${a}^{{2}}$.",
                "Hitung semua suku berpangkat, lalu jumlahkan sesuai tanda di soal.",
                f"**Nilai** ${2}^{{2}}+{4}^{{2}}$ adalah...",
                [str(2 * 2 + 4 * 4), str(4 * 4), str(2 * 2), str((2 + 4) ** 2)],
                0,
            )
        if wrong_label == str((a + b) ** 2):
            return rule(
                "kuadrat_jumlah_salah",
                "concept",
                f"Jawaban {wrong_label} sama dengan $( {a}+{b} )^2$ (dikuadratkan setelah dijumlah), "
                f"bukan ${a}^{{2}}+{b}^{{2}}$ (jumlah dari masing-masing kuadrat).",
                "Jangan kuadratkan penjumlahan basis dulu kecuali memang ditulis dalam kurung.",
                "**Nilai** $(2+3)^2$ adalah...",
                ["10", "25", "13", "5"],
                1,
            )
        if wrong_label == str(a2 * b2):
            return rule(
                "mengalikan_bukan_menjumlahkan",
                "strategy",
                f"Jawaban {wrong_label} seperti mengalikan ${a}^{{2}}$ dengan ${b}^{{2}}$, "
                "padahal di soal operasinya penjumlahan.",
                "Perhatikan simbol di antara suku: `+` berarti jumlahkan hasil pangkat.",
                f"**Nilai** ${2}^{{2}}+{3}^{{2}}$ adalah...",
                ["13", "36", "25", "6"],
                0,
            )
        if wv == a2 + b2 + a:
            return rule(
                "jumlah_kuadrat_plus_basis_pertama",
                "strategy",
                f"Jawaban {wrong_label} sama dengan hasil ${a}^{{2}}+{b}^{{2}}={a2 + b2}$ lalu ditambah ${a}$ lagi "
                f"tanpa dasar dari soal asli (soal hanya meminta jumlah kuadrat).",
                f"Setelah dapat ${a}^{{2}}$ dan ${b}^{{2}}$, cukup jumlahkan kedua bilangan itu sesuai tanda $+$ di soal.",
                f"**Nilai** ${a}^{{2}}+{b}^{{2}}$ adalah...",
                [str(a2 + b2 + a), str(a2 + b2), str((a + b) ** 2), str(a2 * b2)],
                1,
            )
        if wv == a2 + b2 + b:
            return rule(
                "jumlah_kuadrat_plus_basis_kedua",
                "strategy",
                f"Jawaban {wrong_label} sama dengan hasil ${a}^{{2}}+{b}^{{2}}={a2 + b2}$ lalu ditambah ${b}$ lagi, "
                f"seolah basis suku kedua dijumlahkan sekali lagi di luar kuadrat.",
                f"Jangan menambahkan basis mentah setelah kuadrat; yang dijumlahkan hanyalah nilai ${a}^{{2}}$ dan ${b}^{{2}}$.",
                f"**Nilai** ${a}^{{2}}+{b}^{{2}}$ adalah...",
                [str(a2 + b2), str(a2 + b2 + b), str(b2 + a), str((a + b) ** 2)],
                0,
            )
        if wv == a2 + b:
            return rule(
                "kuadrat_lalu_tambah_basis_tanpa_kuadrat",
                "concept",
                f"Jawaban {wrong_label} terlihat seperti ${a}^{{2}}+{b}$ (basis kedua tidak dikuadratkan), "
                f"bukan ${a}^{{2}}+{b}^{{2}}$.",
                "Hitung setiap suku berpangkat sampai selesai dulu, baru jumlahkan.",
                f"**Nilai** ${a}^{{2}}+{b}^{{2}}$ adalah...",
                [str(a2 + b), str(a2 + b2), str(b2), str(b)],
                1,
            )
        if wv == b2 + a:
            return rule(
                "kuadrat_lalu_tambah_basis_tanpa_kuadrat",
                "concept",
                f"Jawaban {wrong_label} terlihat seperti ${b}^{{2}}+{a}$ (basis pertama tidak dikuadratkan penuh), "
                f"bukan ${a}^{{2}}+{b}^{{2}}$.",
                "Pastikan kedua basis benar-benar dipangkatkan sebelum dijumlahkan.",
                f"**Nilai** ${a}^{{2}}+{b}^{{2}}$ adalah...",
                [str(b2 + a), str(a2 + b2), str(a2), str(a)],
                1,
            )
        if wv == a * (a + b):
            return rule(
                "basis_kali_jumlah_basis",
                "concept",
                f"Jawaban {wrong_label} sama dengan ${a}\\times({a}+{b})$; itu pola perkalian, "
                f"bukan ${a}^{{2}}+{b}^{{2}}$.",
                "Kuadratkan tiap basis sesuai pangkat di soal, lalu jumlahkan hasil kuadratnya.",
                f"**Nilai** ${a}^{{2}}+{b}^{{2}}$ adalah...",
                [str(a * (a + b)), str(a2 + b2), str((a + b) ** 2), str(a + b)],
                1,
            )
        if wv == b * (a + b):
            return rule(
                "basis_kali_jumlah_basis",
                "concept",
                f"Jawaban {wrong_label} sama dengan ${b}\\times({a}+{b})$; itu pola perkalian, "
                f"bukan ${a}^{{2}}+{b}^{{2}}$.",
                "Jangan mengganti penjumlahan kuadrat dengan perkalian basis terhadap jumlah basis.",
                f"**Nilai** ${a}^{{2}}+{b}^{{2}}$ adalah...",
                [str(b * (a + b)), str(a2 + b2), str((a + b) ** 2), str(a * b)],
                1,
            )
        if wv == 2 * a * b:
            return rule(
                "suku_tengah_binomial_teracuh",
                "concept",
                f"Jawaban {wrong_label} sama dengan 2×{a}×{b} (suku tengah dari kuadrat jumlah ({a}+{b})²), "
                f"bukan jumlah kuadrat {a}²+{b}².",
                "Bedakan (a+b)²=a²+2ab+b² dengan a²+b²: soalmu meminta yang kedua jika tertulis a²+b².",
                f"**Nilai** ${a}^{{2}}+{b}^{{2}}$ adalah...",
                [str(2 * a * b), str(a2 + b2), str((a + b) ** 2), str(a + b)],
                1,
            )
        if wv != cv:
            return generic_numeric_rule(wv, cv, wrong_label, correct_label, q_plain)

    # --- Single a^n ---
    sp = single_power(question)
    if sp and wv is not None and cv is not None:
        base, exp = sp
        if wrong_label == str(base * exp):
            return rule(
                "pangkat_dianggap_kali",
                "concept",
                f"Jawaban {wrong_label} muncul jika kamu mengalikan {base}×{exp} "
                "seolah pangkat sama dengan perkalian sekali.",
                f"${base}^{{{exp}}}$ artinya {base} dikalikan berulang sebanyak {exp} kali.",
                f"**Nilai** ${base}^{{{exp}}}$ adalah...",
                [str(base * exp), str(base**exp), str(base + exp), str(base**2)],
                1,
            )
        if exp == 3 and wrong_label == str(base * base):
            return rule(
                "pangkat_tiga_kurang_sekali",
                "strategy",
                f"Jawaban {wrong_label} seperti menghitung {base}×{base} saja, "
                "kurang satu perkalian untuk pangkat tiga.",
                f"Untuk pangkat tiga, kalikan basis tiga kali: {base}×{base}×{base}.",
                f"**Nilai** ${base}^{{3}}$ adalah...",
                [str(base * base), str(base**3), str(base + 3), str(base * 3)],
                1,
            )
        if wrong_label == str(base + exp):
            return rule(
                "pangkat_dianggap_jumlah",
                "concept",
                f"Jawaban {wrong_label} sama dengan {base}+{exp}, seolah pangkat diartikan sebagai penjumlahan "
                f"dengan eksponen, bukan perkalian berulang.",
                f"Pangkat {exp} pada basis {base} artinya {base} dikalikan dengan dirinya sendiri sebanyak {exp} kali.",
                f"**Nilai** ${base}^{{{exp}}}$ adalah...",
                [str(base + exp), str(base**exp), str(base * exp), str(base)],
                1,
            )
        if exp > 1 and wrong_label == str(base ** (exp - 1)):
            return rule(
                "pangkat_kurang_sekali_perkalian",
                "strategy",
                f"Jawaban {wrong_label} sama dengan {base} pangkat {exp - 1}; "
                f"untuk ${base}^{{{exp}}}$ masih kurang satu perkalian basis.",
                f"Tambahkan satu kali perkalian {base} lagi agar jumlah faktor sama dengan eksponen.",
                f"**Nilai** ${base}^{{{exp}}}$ adalah...",
                [str(base ** (exp - 1)), str(base**exp), str(base * exp), str(base + exp)],
                1,
            )
        if wv != cv:
            return generic_numeric_rule(wv, cv, wrong_label, correct_label, q_plain)

    # --- Square root ---
    n = sqrt_target(question)
    if n is not None and wv is not None:
        rt = int(n**0.5)
        root = rt if rt * rt == n else None
        if root is not None:
            if wrong_label == str(root - 1) or wrong_label == str(root + 1):
                return rule(
                    "akar_hampir_benar",
                    "careless",
                    f"Jawaban {wrong_label} dekat dengan akar sebenarnya; "
                    "kemungkinan kamu menguji bilangan yang salah satu dari jawaban tepat.",
                    "Cek dengan mengkuadratkan kandidat: hasilnya harus sama dengan bilangan di soal.",
                    "Akar kuadrat dari 49 adalah...",
                    ["5", "6", "7", "8"],
                    2,
                )
            return rule(
                "akar_tidak_tepat",
                "concept",
                f"Jawaban {wrong_label} tidak memenuhi {root}×{root}={n} (akar kuadrat bulat dari {n} adalah {root}).",
                "Cari bilangan bulat yang jika dikuadratkan sama dengan bilangan di soal.",
                "Akar kuadrat dari 36 adalah...",
                ["4", "5", "6", "7"],
                2,
            )

    # --- Cube root ---
    n3 = cbrt_target(question)
    if n3 is not None and wv is not None:
        for r in range(1, 20):
            if r**3 == n3:
                if wrong_label == str(r - 1) or wrong_label == str(r + 1):
                    return rule(
                        "akar_pangkat_tiga_dekat",
                        "careless",
                        f"Jawaban {wrong_label} dekat akar pangkat tiga yang benar.",
                        "Uji dengan pangkat tiga: bilangan yang benar harus memenuhi r³ = nilai soal.",
                        "Akar pangkat tiga dari 27 adalah...",
                        ["1", "2", "3", "4"],
                        2,
                    )
                break
        return rule(
            "akar_pangkat_tiga_salah",
            "concept",
            f"Jawaban {wrong_label} tidak memenuhi pangkat tiga balik ke bilangan soal.",
            "Cari bilangan bulat r sehingga r×r×r sama dengan bilangan di soal.",
            "Akar pangkat tiga dari 8 adalah...",
            ["1", "2", "3", "4"],
            1,
        )

    # --- Integer options all parseable ---
    ints = [parse_int_option(o) for o in options]
    if all(v is not None for v in ints) and cv is not None and wv is not None:
        return generic_numeric_rule(wv, cv, wrong_label, correct_label, q_plain)

    # --- Fraction-like ---
    fracs = [parse_fraction_option(o) for o in options]
    if all(f is not None for f in fracs):
        wf = fracs[wrong_idx]
        cf = fracs[answer_idx]
        if wf and cf and wf != cf:
            return rule(
                "pecahan_tidak_sederhana_atau_langkah_salah",
                "concept",
                f"Pilihan {wrong_label} biasanya muncul jika penyebut/pembilang belum disamakan "
                "atau penjumlahan pecahan belum diselesaikan.",
                "Samakan penyebut atau sederhanakan langkah sampai bentuk akhir paling sederhana.",
                "**Hitung** $\\frac{{1}}{{2}}+\\frac{{1}}{{4}}$ = ...",
                ["$\\frac{{2}}{{6}}$", "$\\frac{{3}}{{4}}$", "$\\frac{{1}}{{6}}$", "$\\frac{{1}}{{8}}$"],
                1,
            )

    # --- Default: option-referenced generic (still consistent with index) ---
    qtail = katex_inline_snippet((q_plain or "").strip(), 200)
    qref = f" Baca ulang bagian matematika soal: «{qtail}»." if qtail else ""
    return rule(
        "pilihan_tidak_sesuai_model",
        "strategy",
        f"Memilih {wrong_label} tidak menghasilkan jawaban yang sama dengan penyelesaian yang konsisten "
        f"menuju pilihan benar ({correct_label}). "
        f"Artinya langkah atau interpretasi model soal masih belum mengarah ke opsi itu.{qref}",
        "Tulis satu kalimat model dari soal, lalu hitung ulang perlahan sampai hasil akhir.",
        "**Hitung** 12 + 8 = ...",
        ["18", "19", "20", "22"],
        2,
    )


def collect_tags(questions: List[dict]) -> List[str]:
    tags: List[str] = []
    for q in questions:
        rules = q.get("microLoop", {}).get("distractor_rules", {})
        for k in sorted(rules.keys(), key=int):
            t = rules[k].get("error_tag")
            if t and t not in tags:
                tags.append(t)
    return tags[:12] or ["concept_mismatch", "strategy_error", "careless_reading"]


def process_pack(data: dict) -> bool:
    changed = False
    for arr in ("main_questions",):
        for q in data.get(arr, []):
            opts = q.get("options") or []
            ans = q.get("answer")
            if ans is None or not isinstance(ans, int) or not (0 <= ans < len(opts)):
                continue
            concept_id = q.get("microLoop", {}).get("concept_id", "concept_core")
            wrong_idxs = [i for i in range(len(opts)) if i != ans]
            new_rules: Dict[str, Any] = {}
            for wi in wrong_idxs:
                new_rules[str(wi)] = build_rule_for_wrong(
                    q.get("question", ""),
                    opts,
                    ans,
                    wi,
                )
            old = q.get("microLoop", {}).get("distractor_rules", {})
            if old != new_rules:
                q.setdefault("microLoop", {})["concept_id"] = concept_id
                q["microLoop"]["distractor_rules"] = new_rules
                changed = True

    if changed and data.get("micro_concepts"):
        tags = collect_tags(data["main_questions"])
        data["micro_concepts"][0]["target_error_tags"] = tags[:6]

    return changed


def main() -> None:
    files = sorted(BASE.glob("**/foundation-micro-authoring-pack.json"))
    n = 0
    for path in files:
        data = json.loads(path.read_text(encoding="utf-8"))
        if process_pack(data):
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            n += 1
    print("updated_packs", n, "of", len(files))


if __name__ == "__main__":
    main()
