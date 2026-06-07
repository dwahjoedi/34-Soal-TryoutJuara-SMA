/**
 * Generates questions-ips-level-2-speed-g.json with TipTap table blocks for data questions.
 * Table items use content.questionRich per question-bank-import-example-with-table.json
 */
const fs = require('fs');
const path = require('path');

const outPath = path.join(__dirname, '..', '04 Soal IPS', 'questions-ips-level-2-speed-g.json');

function textPara(text) {
  return { type: 'paragraph', content: [{ type: 'text', text }] };
}

function optRich(s) {
  return { type: 'doc', content: [textPara(s)] };
}

function rationaleToDoc(rationale) {
  const parts = rationale.split(/\n\n+/).filter(Boolean);
  return {
    type: 'doc',
    content: parts.map((p) => textPara(p.replace(/\*\*/g, '')))
  };
}

function makeTable(headers, rows) {
  const headerRow = {
    type: 'tableRow',
    content: headers.map((h) => ({
      type: 'tableHeader',
      content: [textPara(h)]
    }))
  };
  const dataRows = rows.map((row) => ({
    type: 'tableRow',
    content: row.map((cell) => ({
      type: 'tableCell',
      content: [textPara(String(cell))]
    }))
  }));
  return { type: 'table', content: [headerRow, ...dataRows] };
}

function plainFromTable(intro, headers, rows, closing) {
  const lines = [intro, '', headers.join('\t'), ...rows.map((r) => r.join('\t'))];
  if (closing) lines.push('', closing);
  return lines.join('\n');
}

function wrapContent({ intro, headers, rows, closing, options, answer, rationale }) {
  const docContent = [textPara(intro), makeTable(headers, rows)];
  if (closing) docContent.push(textPara(closing));
  const questionRich = { type: 'doc', content: docContent };
  const question = plainFromTable(intro, headers, rows, closing);
  return {
    content: {
      question,
      questionRich,
      options,
      optionsRich: options.map(optRich),
      answer,
      rationale,
      rationaleRich: rationaleToDoc(rationale)
    },
    question,
    options,
    answer,
    rationale
  };
}

const questions = [];

// Q1 easy Geo — answer index 2 (C)
questions.push({
  subject: 'ips',
  difficulty: 'easy',
  topic: 'Geografi',
  subtopic: 'Kondisi geografis Indonesia',
  skill_type: 'understanding',
  question_type: 'concept_check',
  tags: ['ips-level-2-speed-g'],
  is_active: true,
  question:
    'Indonesia terletak di antara dua samudra dan dua benua. Posisi di sekitar garis khatulistiwa memberi pengaruh besar terhadap iklim. Pernyataan yang paling tepat tentang iklim wilayah Indonesia pada umumnya adalah ...',
  options: [
    'Iklim sedang dengan empat musim salju seperti Eropa',
    'Iklim kutub dengan suhu sangat dingin sepanjang tahun',
    'Iklim tropis dengan suhu relatif stabil sepanjang tahun dan musim hujan-kemarau yang dipengaruhi angin muson',
    'Iklim gurun dengan hampir tidak pernah turun hujan'
  ],
  answer: 2,
  rationale:
    '**Jawaban: C**\n\nLangkah 1: Indonesia berada di daerah tropis dekat khatulistiwa, sehingga tidak mengalami empat musim seperti negara beriklim sedang.\n\nLangkah 2: Pola hujan banyak dipengaruhi angin muson barat dan muson timur, sehingga ada musim hujan dan musim kemarau, tetapi suhu tidak ekstrem seperti iklim kutub atau gurun.\n\n**Materi terkait:** *Iklim tropis* memiliki radiasi matahari relatif merata; perbedaan musim lebih terasa pada curah hujan daripada suhu harian.\n\nInsight kunci: Letak astronomis memengaruhi pola iklim besar suatu wilayah.\n\nKenapa opsi lain salah: A dan B menggambarkan iklim di luar wilayah tropis; D tidak menggambarkan Indonesia yang basah secara umum.'
});

// Q2 medium Geo — answer 3 (D)
questions.push({
  subject: 'ips',
  difficulty: 'medium',
  topic: 'Geografi',
  subtopic: 'Interaksi ruang',
  skill_type: 'reasoning',
  question_type: 'story_problem',
  tags: ['ips-level-2-speed-g'],
  is_active: true,
  question:
    'Skenario: Di sebuah desa pegunungan, jalan baru menghubungkan desa ke pasar kabupaten. Waktu tempuh turun dari 3 jam jalan kaki menjadi 40 menit naik ojek. Akibatnya, petani sayur bisa menjual lebih cepat dan anak-anak bisa sekolah lebih teratur.\n\nPerubahan ini paling tepat menunjukkan bahwa ...',
  options: [
    'Letak geografis tidak pernah memengaruhi aktivitas ekonomi',
    'Pegunungan selalu menghambat perdagangan sehingga jalan tidak berpengaruh',
    'Ojek online adalah satu-satunya faktor yang menentukan harga sayur',
    'Perbaikan akses transportasi mempercepat interaksi antarruang dan dapat meningkatkan kesejahteraan'
  ],
  answer: 3,
  rationale:
    '**Jawaban: D**\n\nLangkah 1: Jalan memperpendek waktu tempuh sehingga barang (sayur) dan orang (siswa) lebih mudah bergerak antar tempat.\n\nLangkah 2: Ini adalah contoh *interaksi ruang* — hubungan antara desa dan kota menjadi lebih erat karena hambatan jarak berkurang.\n\n**Materi terkait:** Infrastruktur transportasi mempengaruhi biaya waktu, kesempatan ekonomi, dan akses layanan sosial.\n\nInsight kunci: Geografi tidak hanya "peta", tetapi juga bagaimana orang memanfaatkan ruang lewat mobilitas.\n\nKenapa opsi lain salah: A dan B terlalu mutlak; C menyalahkan satu faktor tunggal dan mengabaikan peran akses fisik.'
});

// Q3 TABLE Geo — answer 0 (A) — jagung wrong, padi correct was B; reorder options so correct is A
const t1 = wrapContent({
  intro: 'Perhatikan data penggunaan air irigasi per hektar pada tiga tanaman (data latihan fiktif).',
  headers: ['Tanaman', 'Air (liter/hektar/minggu)'],
  rows: [
    ['Padi', '12.000'],
    ['Jagung', '7.500'],
    ['Kedelai', '5.000']
  ],
  closing: 'Berdasarkan tabel, simpulan yang paling tepat adalah ...',
  options: [
    'Padi membutuhkan air irigasi paling besar sehingga pengelolaan air sangat penting di lahan persawahan',
    'Jagung membutuhkan air paling banyak dibanding tanaman lain',
    'Kedelai tidak membutuhkan air sama sekali',
    'Semua tanaman membutuhkan air dalam jumlah persis sama'
  ],
  answer: 0,
  rationale:
    '**Jawaban: A**\n\nLangkah 1: Bandingkan angka pada kolom kedua — 12.000 > 7.500 > 5.000, jadi padi paling besar kebutuhan airnya.\n\nLangkah 2: Implikasi geografis-ekonomis: sawah padi sering membutuhkan saluran irigasi/bendungan; tanpa pengaturan, risiko kekeringan atau konflik air bisa muncul.\n\n**Materi terkait:** Sumber daya air terbatas; komposisi tanaman memengaruhi tekanan terhadap irigasi komunal.\n\nInsight kunci: Membaca tabel = bandingkan nilai secara sistematis, lalu tarik implikasi, bukan hanya menyebut angka.\n\nKenapa opsi lain salah: B salah karena yang tertinggi padi; C dan D bertentangan dengan data.'
});
questions.push({
  subject: 'ips',
  difficulty: 'medium',
  topic: 'Geografi',
  subtopic: 'Lingkungan hidup & sumber daya',
  skill_type: 'reasoning',
  question_type: 'visual_analysis',
  tags: ['ips-level-2-speed-g', 'table'],
  is_active: true,
  ...t1
});

// Q4 hard Geo — answer 1 (B)
questions.push({
  subject: 'ips',
  difficulty: 'hard',
  topic: 'Geografi',
  subtopic: 'Peta & denah',
  skill_type: 'reasoning',
  question_type: 'multi_step',
  tags: ['ips-level-2-speed-g'],
  is_active: true,
  question:
    'Pada sebuah peta topografi, jarak dua titik di peta adalah 4 cm dan skala peta 1:50.000. Seorang pendaki memperkirakan medan antara kedua titik sangat curam.\n\nJarak lurus di lapangan antara kedua titik tersebut adalah ...',
  options: [
    '200 meter (4 × 50)',
    '2 kilometer (4 cm × 50.000 = 200.000 cm = 2 km)',
    '500 meter',
    '20 kilometer'
  ],
  answer: 1,
  rationale:
    '**Jawaban: B**\n\nLangkah 1: Skala 1:50.000 artinya 1 cm di peta = 50.000 cm di lapangan = 500 meter.\n\nLangkah 2: 4 cm di peta = 4 × 500 m = 2.000 m = 2 km.\n\nLangkah 3: Keterangan medan curam menambah konteks pendakian, tetapi jarak lurus dihitung dari skala, bukan dari kemiringan.\n\n**Materi terkait:** Konversi cm peta ke meter/km lapangan dengan mengalikan jarak peta dengan jarak sebenarnya per cm.\n\nInsight kunci: Kemiringan mempengaruhi *usaha* mendaki, bukan panjang proyeksi horizontal jika soal meminta jarak peta.\n\nKenapa opsi lain salah: A salah mengalikan dengan 50 tanpa konversi satuan; C dan D tidak sesuai perhitungan 4 × 500 m.'
});

// Q5 Sejarah easy — answer 3 (D) — move correct to D
questions.push({
  subject: 'ips',
  difficulty: 'easy',
  topic: 'Sejarah',
  subtopic: 'Warisan budaya & nasionalisme',
  skill_type: 'understanding',
  question_type: 'concept_check',
  tags: ['ips-level-2-speed-g'],
  is_active: true,
  question:
    'Candi Borobudur di Magelang merupakan warisan budaya Buddha yang dikenal dunia. Sebagai warisan budaya, Borobudur berfungsi penting bagi bangsa Indonesia karena ...',
  options: [
    'Menunjukkan bahwa Indonesia hanya memiliki satu agama tunggal sepanjang sejarah',
    'Membuktikan bahwa bangunan batu tidak perlu dirawat',
    'Hanya menarik bagi wisatawan asing tanpa manfaat bagi masyarakat lokal',
    'Menjadi bukti peradaban masa lalu yang memperkaya identitas nasional dan sumber pembelajaran sejarah'
  ],
  answer: 3,
  rationale:
    '**Jawaban: D**\n\nLangkah 1: Warisan budaya adalah peninggalan masa lalu yang bernilai sehingga dilestarikan.\n\nLangkah 2: Borobudur menjadi simbol kekayaan budaya Nusantara dan materi pembelajaran tentang peradaban, seni, dan kepercayaan di masa lampau.\n\n**Materi terkait:** Nasionalisme juga dibentuk lewat kebanggaan akan keberagaman warisan budaya.\n\nInsight kunci: Warisan bukan sekadar objek wisata, tetapi jendela memahami masyarakat masa lalu.\n\nKenapa opsi lain salah: A mengabaikan keberagaman; B salah secara perawatan; C mengabaikan ekonomi kreatif lokal dan pendidikan.'
});

// Q6 TABLE Sejarah — urutan: BPUPKI → Proklamasi → PPKI
const t2 = wrapContent({
  intro: 'Perhatikan urutan peristiwa (data latihan) berikut.',
  headers: ['Urutan', 'Peristiwa'],
  rows: [
    ['1', 'BPUPKI menyusun dasar negara (April–Agustus 1945)'],
    ['2', 'Proklamasi kemerdekaan 17 Agustus 1945'],
    ['3', 'PPKI mengesahkan UUD 1945 (18 Agustus 1945)']
  ],
  closing: 'Berdasarkan tabel, kesimpulan yang paling tepat adalah ...',
  options: [
    'Proklamasi terjadi sebelum perumusan dasar negara dimulai',
    'UUD 1945 disahkan lebih dulu daripada proklamasi',
    'Semua peristiwa terjadi pada hari yang sama sehingga urutan tidak penting',
    'Perumusan dasar negara melalui BPUPKI mendahului proklamasi, lalu PPKI mengesahkan UUD setelah kemerdekaan dinyatakan'
  ],
  answer: 3,
  rationale:
    '**Jawaban: D**\n\nLangkah 1: BPUPKI berjalan sebelum 17 Agustus 1945 untuk menyiapkan dasar negara.\n\nLangkah 2: Proklamasi 17 Agustus 1945 adalah puncak deklarasi kemerdekaan.\n\nLangkah 3: PPKI 18 Agustus 1945 mengesahkan UUD dan struktur kenegaraan sebagai tindak lanjut.\n\n**Materi terkait:** Membaca tabel kronologi = cocokkan urutan angka dengan urutan tanggal sejarah.\n\nInsight kunci: Tanggal berdekatan tidak boleh membuat kita menukar urutan logis peristiwa.\n\nKenapa opsi lain salah: A dan B membalik urutan; C mengabaikan proses berjenjang.'
});
questions.push({
  subject: 'ips',
  difficulty: 'medium',
  topic: 'Sejarah',
  subtopic: 'Kronologi peristiwa',
  skill_type: 'reasoning',
  question_type: 'visual_analysis',
  tags: ['ips-level-2-speed-g', 'table'],
  is_active: true,
  ...t2
});

// Q7 medium Sejarah — answer 0 (A)
questions.push({
  subject: 'ips',
  difficulty: 'medium',
  topic: 'Sejarah',
  subtopic: 'Tokoh & perubahan sosial',
  skill_type: 'reasoning',
  question_type: 'story_problem',
  tags: ['ips-level-2-speed-g'],
  is_active: true,
  question:
    'R.A. Kartini dikenal melalui surat-suratnya yang mengupayakan pendidikan bagi perempuan pribumi. Kontribusi utama pemikiran Kartini bagi perubahan sosial pada zamannya adalah ...',
  options: [
    'Memperkuat gagasan bahwa perempuan pribumi juga berhak mendapat pendidikan dan kesempatan berkembang, sehingga membuka diskusi tentang emansipasi',
    'Menghapus seluruh tradisi budaya Jawa tanpa seleksi',
    'Memusatkan perhatian hanya pada industri militer',
    'Menolak semua bentuk kerja sama dengan pemerintah kolonial tanpa tujuan pendidikan'
  ],
  answer: 0,
  rationale:
    '**Jawaban: A**\n\nLangkah 1: Surat-surat Kartini menunjukkan kritik terhadap pembatasan peran perempuan dan dorongan pada pendidikan.\n\nLangkah 2: Ini memicu kesadaran baru tentang kesetaraan dalam konteks sosial kolonial.\n\n**Materi terkait:** Tokoh tidak selalu "pemimpin militer"; perubahan sosial bisa dimulai dari ide dan tulisan.\n\nInsight kunci: Emansipasi berarti memperluas kesempatan—bukan menghapus identitas budaya secara membabi buta.\n\nKenapa opsi lain salah: B terlalu ekstrem; C dan D tidak sesuai fokus Kartini pada pendidikan perempuan.'
});

// Q8 hard Sejarah — answer 2 (C) — reorder options
questions.push({
  subject: 'ips',
  difficulty: 'hard',
  topic: 'Sejarah',
  subtopic: 'Sejarah Indonesia',
  skill_type: 'reasoning',
  question_type: 'multi_step',
  tags: ['ips-level-2-speed-g'],
  is_active: true,
  question:
    'Konferensi Asia-Afrika di Bandung (1955) dihadiri banyak negara yang baru merdeka. Nilai besar konferensi tersebut dalam konteks pergaulan bangsa Indonesia di dunia adalah ...',
  options: [
    'Membentuk blok militer untuk menyerang negara maju',
    'Memutuskan Indonesia keluar dari PBB secara permanen',
    'Menegaskan semangat anti-kolonialisme, solidaritas negara Asia-Afrika, dan peran Indonesia sebagai jembatan diplomasi bebas aktif',
    'Menetapkan Bahasa Indonesia sebagai satu-satunya bahasa resmi dunia'
  ],
  answer: 2,
  rationale:
    '**Jawaban: C**\n\nLangkah 1: Konteks 1955 adalah gelombang dekolonisasi; banyak negara ingin merdeka dari penjajahan.\n\nLangkah 2: Konferensi menekankan perdamaian, kerja sama, dan hak menentukan nasib sendiri—selaras dengan politik luar negeri Indonesia.\n\nLangkah 3: Ini memperkuat citra Indonesia sebagai negara yang memimpin dialog Selatan-Selatan awal.\n\n**Materi terkait:** *Solidaritas* antar negara berkembang adalah tema besar Orde Lama dalam diplomasi.\n\nInsight kunci: Sejarah internasional mempengaruhi posisi Indonesia sebagai aktor regional, bukan hanya urusan domestik.\n\nKenapa opsi lain salah: A dan B tidak sesuai tujuan konferensi; D tidak realistis dan bukan hasil KAA.'
});

// Q9 easy Ekonomi — answer 0 (A)
questions.push({
  subject: 'ips',
  difficulty: 'easy',
  topic: 'Ekonomi',
  subtopic: 'Ekonomi dasar',
  skill_type: 'understanding',
  question_type: 'concept_check',
  tags: ['ips-level-2-speed-g'],
  is_active: true,
  question:
    'Ani menabung uang lebaran di celengan di rumah. Kakaknya menyarankan menabung di bank agar lebih aman dan bisa bertambah sedikit dari bunga.\n\nPerbedaan paling mendasar antara tabungan di celengan dan di bank (dalam konteks sederhana) adalah ...',
  options: [
    'Tabungan di bank umumnya lebih aman dari risiko hilang/curi dan sering mendapat bunga kecil, sedangkan uang di celengan tidak bertambah dan lebih rentan jika tidak terjaga',
    'Celengan selalu memberikan keuntungan lebih besar tanpa risiko apa pun',
    'Bank melarang siapa pun menarik uang tabungan',
    'Celengan diatur oleh undang-undang perbankan nasional'
  ],
  answer: 0,
  rationale:
    '**Jawaban: A**\n\nLangkah 1: Fungsi tabungan sederhana—menunda konsumsi untuk kebutuhan mendatang.\n\nLangkah 2: Lembaga keuangan formal menawarkan keamanan pencatatan dan bunga (meskipun kecil), berbeda dengan menyimpan cash di rumah.\n\n**Materi terkait:** *Opportunity cost* sederhana: bunga kecil vs risiko kehilangan di rumah.\n\nInsight kunci: Memilih instrumen tabungan melibatkan keamanan dan disiplin, bukan hanya "simpan di mana".\n\nKenapa opsi lain salah: B mengabaikan risiko dan bunga; C salah—nasabah bisa menarik sesuai ketentuan; D membalik peran lembaga.'
});

// Q10 TABLE Ekonomi — answer 3 (D)
const t3 = wrapContent({
  intro: 'Harga telur ayam di sebuah pasar tradisional (data latihan fiktif) tercatat sebagai berikut.',
  headers: ['Minggu', 'Harga per kg'],
  rows: [
    ['Sebelum Lebaran', 'Rp28.000'],
    ['Minggu pertama setelah Lebaran', 'Rp22.000'],
    ['Minggu ketiga setelah Lebaran', 'Rp20.000']
  ],
  closing: 'Polanya paling tepat dijelaskan oleh pernyataan berikut.',
  options: [
    'Harga naik karena permintaan turun drastis setelah Lebaran',
    'Harga ditentukan hanya oleh keinginan penjual tanpa hubungan dengan pembeli',
    'Telur tidak mengikuti hukum permintaan dan penawaran',
    'Setelah puncak kebutuhan Lebaran, permintaan telur cenderung menurun sehingga harga ikut turun jika pasokan relatif banyak'
  ],
  answer: 3,
  rationale:
    '**Jawaban: D**\n\nLangkah 1: Tabel menunjukkan tren penurunan harga pasca Lebaran.\n\nLangkah 2: Di sekitar Lebaran, banyak rumah membutuhkan telur untuk kue dan hidangan—permintaan tinggi cenderung mendorong harga naik sebelum hari raya.\n\nLangkah 3: Setelah Lebaran, kebutuhan mendadak berkurang—permintaan turun—dan tekanan harga bisa turun bila stok masih mencukupi.\n\n**Materi terkait:** *Permintaan musiman* memengaruhi harga barang pangan.\n\nInsight kunci: Membaca tabel ekonomi = lihat arah perubahan, lalu hubungkan dengan logika permintaan-penawaran.\n\nKenapa opsi lain salah: A membalik hubungan permintaan-harga; B dan C menolak konsep pasar sederhana.'
});
questions.push({
  subject: 'ips',
  difficulty: 'medium',
  topic: 'Ekonomi',
  subtopic: 'Permintaan & penawaran',
  skill_type: 'reasoning',
  question_type: 'visual_analysis',
  tags: ['ips-level-2-speed-g', 'table'],
  is_active: true,
  ...t3
});

// Q11 medium Ekonomi — answer 2 (C)
questions.push({
  subject: 'ips',
  difficulty: 'medium',
  topic: 'Ekonomi',
  subtopic: 'Kegiatan ekonomi',
  skill_type: 'reasoning',
  question_type: 'story_problem',
  tags: ['ips-level-2-speed-g'],
  is_active: true,
  question:
    'Sebuah koperasi desa membeli hasil panen petani secara kolektif lalu menjual ke kota dengan harga sedikit lebih tinggi. Keuntungan dibagi kepada anggota sesuai aturan.\n\nPeran koperasi dalam rantai kegiatan ekonomi ini paling tepat adalah ...',
  options: [
    'Menghilangkan peran distribusi karena barang langsung dikonsumsi di lahan',
    'Menjadikan petani hanya sebagai buruh tanpa hak suara',
    'Mengumpulkan hasil produksi banyak petani (produsen) dan menyalurkan ke konsumen dengan pembagian keuntungan yang adil bagi anggota',
    'Memastikan harga di kota selalu lebih murah dari harga di desa tanpa alasan'
  ],
  answer: 2,
  rationale:
    '**Jawaban: C**\n\nLangkah 1: Koperasi menghubungkan produsen kecil dengan pasar yang lebih luas.\n\nLangkah 2: Ada kegiatan *distribusi* dan *jual beli* kolektif yang diharapkan meningkatkan posisi tawar petani.\n\n**Materi terkait:** Prinsip gotong royong ekonomi—anggota sekaligus pemilik.\n\nInsight kunci: Koperasi bukan sekadar toko, tetapi organisasi ekonomi berbasis keanggotaan.\n\nKenapa opsi lain salah: A salah—ada distribusi; B bertentangan prinsip demokrasi koperasi; D tidak selalu benar.'
});

// Q12 medium Ekonomi — answer 1 (B)
questions.push({
  subject: 'ips',
  difficulty: 'medium',
  topic: 'Ekonomi',
  subtopic: 'Peran konsumen & produsen',
  skill_type: 'reasoning',
  question_type: 'story_problem',
  tags: ['ips-level-2-speed-g'],
  is_active: true,
  question:
    'Seorang produsen kerajinan anyaman menjual produknya melalui toko online. Ia memfoto barang dengan pencahayaan baik dan menjelaskan bahan secara jujur. Pembeli bisa memberi ulasan.\n\nPraktik yang paling mencerminkan peran produsen yang bertanggung jawab adalah ...',
  options: [
    'Menyembunyikan cacat barang agar cepat laku',
    'Memberi informasi jelas dan jujur serta menjaga kualitas agar konsumen bisa memutuskan dengan baik—membangun kepercayaan jangka panjang',
    'Menolak semua kritik pembeli',
    'Menjual barang palsu agar harga lebih murah dari pesaing'
  ],
  answer: 1,
  rationale:
    '**Jawaban: B**\n\nLangkah 1: Produsen bertanggung jawab menyediakan informasi yang benar tentang barang/jasa.\n\nLangkah 2: Transparansi mengurangi ketidaksetaraan informasi antara penjual dan pembeli.\n\n**Materi terkait:** Etika bisnis sederhana—reputasi digital sangat bergantung pada ulasan.\n\nInsight kunci: Konsumen cerdas membandingkan informasi; produsen jujur memenangkan kepercayaan.\n\nKenapa opsi lain salah: A, C, dan D melanggar prinsip konsumen dilindungi secara moral.'
});

// Q13 hard Ekonomi — answer 0 (A) — same text as B before, index 0
questions.push({
  subject: 'ips',
  difficulty: 'hard',
  topic: 'Ekonomi',
  subtopic: 'Ekonomi dasar',
  skill_type: 'reasoning',
  question_type: 'multi_step',
  tags: ['ips-level-2-speed-g'],
  is_active: true,
  question:
    'Sebuah keluarga menyimpan uang tunai di bawah bantal selama setahun. Selama tahun itu, harga rata-rata sembako naik 8%. Daya beli uang tabungan mereka terhadap sembako secara real menjadi ...',
  options: [
    'Cenderung menurun karena harga naik sementara jumlah uang tunai tetap—setiap rupiah membeli lebih sedikit barang',
    'Lebih besar tanpa syarat',
    'Tetap sama persis karena nominal uang tidak berubah',
    'Naik otomatis 8% mengikuti inflasi tanpa dampak'
  ],
  answer: 0,
  rationale:
    '**Jawaban: A**\n\nLangkah 1: Inflasi berarti harga umum naik.\n\nLangkah 2: Jika jumlah uang simpanan tetap, maka kemampuan membeli (*daya beli*) terhadap barang yang naik harganya menurun.\n\nLangkah 3: Menyimpan dalam bentuk tunai tanpa imbal hasil tidak melindungi dari kenaikan harga.\n\n**Materi terkait:** *Inflasi* memengaruhi nilai riil uang—bukan hanya angka nominal.\n\nInsight kunci: "Punya uang sama banyak" belum tentu "mampu beli sama banyak".\n\nKenapa opsi lain salah: B, C, dan D mengabaikan efek inflasi terhadap daya beli.'
});

// Q14 TABLE Sosiologi — answer 1 (B)
const t4 = wrapContent({
  intro: 'Tabel berikut mencocokkan lembaga sosial dengan contoh perannya (data latihan fiktif).',
  headers: ['Lembaga', 'Contoh peran'],
  rows: [
    ['Keluarga', 'Mengajarkan sopan santun dan membagi tugas rumah'],
    ['Sekolah', 'Memberi ilmu dan sertifikat kelulusan'],
    ['Pemerintah desa', 'Mengatur jadwal ronda keamanan lingkungan']
  ],
  closing: 'Berdasarkan tabel, pasangan yang paling tepat menunjukkan fungsi lembaga sosial adalah ...',
  options: [
    'Sekolah utama mengatur ronda malam hari, sedangkan pemerintah desa mengajar matematika setiap hari',
    'Keluarga berperan dalam sosialisasi awal perilaku; sekolah berperan dalam pendidikan formal; pemerintah desa berperan dalam tata kelola ketertiban warga',
    'Lembaga sosial hanya berarti organisasi politik partai',
    'Pemerintah desa tidak memiliki peran dalam kehidupan warga'
  ],
  answer: 1,
  rationale:
    '**Jawaban: B**\n\nLangkah 1: Baca setiap baris sebagai pasangan konsep-contoh.\n\nLangkah 2: Keluarga adalah agen sosialisasi primer; sekolah adalah lembaga pendidikan formal; pemerintah desa mengatur urusan publik setempat termasuk keamanan lingkungan.\n\n**Materi terkait:** *Lembaga sosial* adalah struktur yang memenuhi kebutuhan tetap masyarakat.\n\nInsight kunci: Tabel "cocokkan" menguji apakah kamu mengenali definisi lembaga, bukan sekadar menghafal nama.\n\nKenapa opsi lain salah: A menukar peran; C terlalu sempit; D salah secara empiris.'
});
questions.push({
  subject: 'ips',
  difficulty: 'easy',
  topic: 'Sosiologi',
  subtopic: 'Lembaga sosial',
  skill_type: 'understanding',
  question_type: 'visual_analysis',
  tags: ['ips-level-2-speed-g', 'table'],
  is_active: true,
  ...t4
});

// Q15 medium Sosiologi — answer 2 (C)
questions.push({
  subject: 'ips',
  difficulty: 'medium',
  topic: 'Sosiologi',
  subtopic: 'Norma & nilai sosial',
  skill_type: 'reasoning',
  question_type: 'story_problem',
  tags: ['ips-level-2-speed-g'],
  is_active: true,
  question:
    'Di dalam bus kota yang ramai, seorang penumpang membuka jendela dan membuang sampah ke jalan. Penumpang lain menegur dengan sopan.\n\nTeguran tersebut paling tepat karena membuang sampah sembarangan melanggar ...',
  options: [
    'Norma kesopanan ringan saja tanpa konsekuensi apa pun',
    'Hukum internasional tentang penerbangan',
    'Norma yang berkaitan dengan kebersihan lingkungan dan tanggung jawab bersama di ruang publik',
    'Adat istiadat perkawinan'
  ],
  answer: 2,
  rationale:
    '**Jawaban: C**\n\nLangkah 1: Ruang publik (jalan, bus) membutuhkan aturan perilaku agar nyaman dan bersih.\n\nLangkah 2: Membuang sampah sembarangan merugikan pengguna jalan lain dan petugas kebersihan—melanggar norma lingkungan dan etika berbagi ruang.\n\n**Materi terkait:** Norma bisa bersifat moral/sosial sebelum sampai sanksi hukum berat.\n\nInsight kunci: Kesadaran lingkungan adalah bagian dari nilai kehidupan berbangsa di kota.\n\nKenapa opsi lain salah: A meremehkan dampak; B dan D tidak relevan.'
});

// Q16 medium Sosiologi — answer 1 (B)
questions.push({
  subject: 'ips',
  difficulty: 'medium',
  topic: 'Sosiologi',
  subtopic: 'Interaksi sosial',
  skill_type: 'reasoning',
  question_type: 'story_problem',
  tags: ['ips-level-2-speed-g'],
  is_active: true,
  question:
    'Dua kelompok pemuda dari desa berbeda saling mengejek di media sosial hingga memicu keributan rencana di dunia nyata. Tokoh adat dan guru sepakat mengadakan pertemuan mediated untuk mencari jalan damai.\n\nBentuk penyelesaian yang digambarkan paling mendekati ...',
  options: [
    'Asimilasi budaya tanpa dialog',
    'Mediasi dengan pihak ketiga netral yang membantu pihak bertikai bernegosiasi',
    'Penyelesaian dengan mengisolasi kedua desa dari dunia luar selamanya',
    'Kompetisi untuk mempermalukan pihak lawan di media'
  ],
  answer: 1,
  rationale:
    '**Jawaban: B**\n\nLangkah 1: Konflik sosial membutuhkan saluran komunikasi agar tidak membesar.\n\nLangkah 2: Mediasi melibatkan pihak ketiga membantu struktur pertemuan dan menjaga netralitas.\n\n**Materi terkait:** *Akomodasi* dan mediasi adalah cara mengelola konflik tanpa kekerasan.\n\nInsight kunci: Interaksi digital mempercepat eskalasi—penyelesaian tetap butuh ruang dialog nyata.\n\nKenapa opsi lain salah: A, C, dan D bukan model penyelesaian konstruktif.'
});

// Q17 TABLE mobilitas — answer 1 (B)
const t5 = wrapContent({
  intro: 'Data perkiraan pendapatan keluarga (fiktif) sebelum dan sesudah seorang ibu lulus pelatihan menjahit bersubsidi.',
  headers: ['Periode', 'Pendapatan/bulan'],
  rows: [
    ['Sebelum pelatihan', 'Rp2.200.000'],
    ['Setelah 1 tahun bekerja di konveksi mitra', 'Rp3.800.000']
  ],
  closing: 'Perubahan ini paling tepat digambarkan sebagai ...',
  options: [
    'Mobilitas sosial turun karena ibu menjadi lebih sibuk',
    'Mobilitas sosial naik vertikal—posisi ekonomi keluarga membaik karena keterampilan dan pekerjaan baru',
    'Mobilitas horizontal semata karena tidak ada perubahan pendapatan',
    'Mobilitas hanya terjadi jika keluarga pindah negara'
  ],
  answer: 1,
  rationale:
    '**Jawaban: B**\n\nLangkah 1: Pendapatan naik signifikan menunjukkan peningkatan kemampuan ekonomi keluarga.\n\nLangkah 2: Pelatihan menjahit meningkatkan *human capital* sehingga akses pekerjaan dan upah bisa meningkat—contoh mobilitas ekonomi naik.\n\n**Materi terkait:** *Mobilitas vertikal* naik berarti status ekonomi/stratifikasi membaik dibanding sebelumnya.\n\nInsight kunci: Data sebelum-sesudah membantu melihat mobilitas tanpa tebak-tebakan.\n\nKenapa opsi lain salah: A membalik arah; C salah karena ada perubahan jelas; D terlalu sempit.'
});
questions.push({
  subject: 'ips',
  difficulty: 'hard',
  topic: 'Sosiologi',
  subtopic: 'Mobilitas sosial',
  skill_type: 'reasoning',
  question_type: 'visual_analysis',
  tags: ['ips-level-2-speed-g', 'table'],
  is_active: true,
  ...t5
});

// Q18 TABLE IDS IPM — answer 2 (C)
const t6 = wrapContent({
  intro: 'Indeks Pembangunan Manusia (IPM) tiga provinsi (data latihan fiktif, skala 0–100).',
  headers: ['Provinsi', 'IPM'],
  rows: [
    ['Provinsi X', '72,1'],
    ['Provinsi Y', '68,4'],
    ['Provinsi Z', '75,8']
  ],
  closing: 'Berdasarkan tabel, simpulan yang paling tepat adalah ...',
  options: [
    'Provinsi Y memiliki tingkat pembangunan manusia tertinggi',
    'Tidak ada perbedaan pembangunan antarwilayah karena angkanya sama',
    'Provinsi Z menunjukkan skor IPM tertinggi di antara ketiga provinsi, mengindikasikan capaian pembangunan manusia yang relatif lebih baik pada indikator yang dirangkum IPM',
    'IPM hanya mengukur luas wilayah, bukan kualitas hidup'
  ],
  answer: 2,
  rationale:
    '**Jawaban: C**\n\nLangkah 1: Bandingkan angka: 75,8 > 72,1 > 68,4, jadi tertinggi Provinsi Z.\n\nLangkah 2: IPM merangkum dimensi kesehatan, pendidikan, dan standar hidup—bukan sekadar satu indikator sempit.\n\n**Materi terkait:** Membaca tabel perbandingan wilayah membantu melihat ketimpangan pembangunan.\n\nInsight kunci: Angka lebih tinggi berarti capaian relatif lebih baik menurut definisi IPM—tetap perlu konteks data detail untuk penjelasan penuh.\n\nKenapa opsi lain salah: A membalik urutan; B salah secara numerik; D salah definisi IPM.'
});
questions.push({
  subject: 'ips',
  difficulty: 'medium',
  topic: 'Interpretasi Data Sosial',
  subtopic: 'Grafik sosial ekonomi',
  skill_type: 'reasoning',
  question_type: 'visual_analysis',
  tags: ['ips-level-2-speed-g', 'table'],
  is_active: true,
  ...t6
});

// Q19 IDS studi kasus — answer 3 (D) — easy untuk menyeimbangkan 6 easy
questions.push({
  subject: 'ips',
  difficulty: 'easy',
  topic: 'Interpretasi Data Sosial',
  subtopic: 'Studi kasus',
  skill_type: 'reasoning',
  question_type: 'story_problem',
  tags: ['ips-level-2-speed-g'],
  is_active: true,
  question:
    'Sebuah desa wisata membatasi jumlah pengunjung per hari dan meminta wisatawan memakai pakaian adat ringan saat masuk situs budaya. Langkah ini bertujuan mengurangi kerusakan lingkungan dan menjaga kesopanan.\n\nNilai sosial yang paling menonjol dari kebijakan tersebut adalah ...',
  options: [
    'Menghapus identitas budaya lokal sepenuhnya',
    'Mendorong kompetisi antarwisatawan untuk foto sebanyak mungkin',
    'Menutup akses ekonomi warga desa tanpa alasan',
    'Keseimbangan antara pelestarian budaya-lingkungan dengan keberlanjutan pariwisata berkelanjutan'
  ],
  answer: 3,
  rationale:
    '**Jawaban: D**\n\nLangkah 1: Pembatasan kunjungan mengurangi tekanan pada ekosistem dan infrastruktur kecil.\n\nLangkah 2: Aturan berpakaian menghormati norma setempat dan mengurangi perilaku yang mengganggu ritus atau ruang sakral.\n\n**Materi terkait:** Pariwisata berkelanjutan menghubungkan ekonomi, budaya, dan lingkungan.\n\nInsight kunci: Data atau kebijakan sosial sering memiliki tujuan ganda—bukan hanya "larang" tanpa arah.\n\nKenapa opsi lain salah: A, B, dan C tidak sesuai niat pelestarian dan penghormatan.'
});

// Q20 IDS kependudukan — answer 0 (A)
questions.push({
  subject: 'ips',
  difficulty: 'easy',
  topic: 'Interpretasi Data Sosial',
  subtopic: 'Kependudukan',
  skill_type: 'understanding',
  question_type: 'concept_check',
  tags: ['ips-level-2-speed-g'],
  is_active: true,
  question:
    'Pembagian penduduk berdasarkan kelompok umur (misalnya banyak anak vs. banyak lansia) memengaruhi kebutuhan kota akan sekolah, rumah sakit, dan pekerja.\n\nKonsep yang paling tepat untuk membahas komposisi umur penduduk adalah ...',
  options: [
    'Struktur penduduk menurut kelompok umur (bonus demografi vs. penuaan)',
    'Letak astronomis benda langit',
    'Sistem pemerintahan monarki absolut',
    'Teknik menggambar peta kontur saja'
  ],
  answer: 0,
  rationale:
    '**Jawaban: A**\n\nLangkah 1: Komposisi umur menentukan kebutuhan fasilitas—banyak anak artinya kebutuhan sekolah besar; banyak lansia artinya kebutuhan kesehatan jangka panjang.\n\nLangkah 2: Istilah umum untuk pembahasan ini adalah struktur penduduk menurut umur.\n\n**Materi terkait:** *Bonus demografi* terjadi ketika proporsi usia produktif besar—peluang ekonomi jika dikelola baik.\n\nInsight kunci: Data kependudukan membantu perencanaan, bukan hanya statistik kosong.\n\nKenapa opsi lain salah: B, C, dan D tidak membahas komposisi umur.'
});

// Verify counts
const byAns = { 0: 0, 1: 0, 2: 0, 3: 0 };
questions.forEach((q) => {
  byAns[q.answer]++;
});
const byDiff = {};
questions.forEach((q) => {
  byDiff[q.difficulty] = (byDiff[q.difficulty] || 0) + 1;
});
console.log('Questions:', questions.length, 'Difficulty:', byDiff, 'Answers:', byAns);

fs.writeFileSync(outPath, JSON.stringify(questions, null, 2), 'utf8');
console.log('Wrote', outPath);
