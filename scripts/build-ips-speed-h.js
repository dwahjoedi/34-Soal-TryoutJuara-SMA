/**
 * Generates questions-ips-level-2-speed-h.json
 * Table questions use TipTap dual-format (flat + content.questionRich)
 *
 * Topic plan  : Geo 4, Sejarah 4, Ekonomi 5, Sosiologi 4, IDS 3
 * Difficulty  : 6 easy, 10 medium, 4 hard
 * Answer dist : 5 each for 0/1/2/3
 * Table items : Q8, Q13, Q16, Q18, Q19  (5 tables, ≥ min 3)
 */
const fs = require('fs');
const path = require('path');

const out = path.join(__dirname, '..', '04 Soal IPS', 'questions-ips-level-2-speed-h.json');

function para(text) {
  return { type: 'paragraph', content: [{ type: 'text', text }] };
}
function optRich(s) {
  return { type: 'doc', content: [para(s)] };
}
function makeTable(headers, rows) {
  const headerRow = {
    type: 'tableRow',
    content: headers.map((h) => ({ type: 'tableHeader', content: [para(h)] }))
  };
  const dataRows = rows.map((row) => ({
    type: 'tableRow',
    content: row.map((cell) => ({ type: 'tableCell', content: [para(String(cell))] }))
  }));
  return { type: 'table', content: [headerRow, ...dataRows] };
}
function flatFromTable(intro, headers, rows, closing) {
  const lines = [intro, '', headers.join('\t'), ...rows.map((r) => r.join('\t'))];
  if (closing) lines.push('', closing);
  return lines.join('\n');
}
function rationaleDoc(rationale) {
  return { type: 'doc', content: rationale.split(/\n\n+/).filter(Boolean).map((p) => para(p.replace(/\*\*/g, ''))) };
}
function tableQ({ intro, headers, rows, closing, options, answer, rationale }) {
  const question = flatFromTable(intro, headers, rows, closing);
  const questionRich = { type: 'doc', content: [para(intro), makeTable(headers, rows), ...(closing ? [para(closing)] : [])] };
  return {
    content: { question, questionRich, options, optionsRich: options.map(optRich), answer, rationale, rationaleRich: rationaleDoc(rationale) },
    question, options, answer, rationale
  };
}

const q = [];

// ─── GEOGRAFI ──────────────────────────────────────────────────────────────

// Q1 easy Peta & denah — ans:2 (C)
q.push({
  subject:'ips', difficulty:'easy', topic:'Geografi', subtopic:'Peta & denah',
  skill_type:'understanding', question_type:'concept_check',
  tags:['ips-level-2-speed-h'], is_active:true,
  question:'Pada sebuah peta, terdapat kotak kecil berisi daftar simbol dan artinya, misalnya garis merah = jalan nasional, titik biru = sumber air, dan warna hijau = hutan. Kotak kecil tersebut disebut ...',
  options:[
    'Skala peta — menunjukkan perbandingan jarak di peta dengan jarak sesungguhnya',
    'Inset peta — peta kecil yang menunjukkan lokasi daerah di peta utama',
    'Legenda peta — keterangan yang menjelaskan makna setiap simbol yang digunakan dalam peta',
    'Koordinat peta — sistem angka untuk menentukan posisi suatu titik di peta'
  ],
  answer:2,
  rationale:'**Jawaban: C**\n\nLangkah 1: Identifikasi fungsi kotak berisi daftar simbol dan artinya.\n\nLangkah 2: Dalam ilmu kartografi, kotak seperti itu disebut **legenda peta** (atau keterangan). Fungsinya memberi tahu pembaca makna setiap simbol, warna, dan garis dalam peta agar peta dapat dipahami dengan benar.\n\n**Materi terkait:**\n- **Skala**: perbandingan jarak; contoh 1:50.000 artinya 1 cm = 500 m.\n- **Inset**: gambar peta mini di pojok peta utama yang menunjukkan di mana posisi daerah yang dipetakan dalam konteks yang lebih luas.\n- **Koordinat**: garis lintang dan bujur untuk menentukan posisi geografis.\n\nInsight kunci: Tanpa legenda, simbol-simbol di peta menjadi tidak bermakna; legenda adalah "kamus" peta.\n\nKenapa opsi lain salah: A adalah skala (perbandingan jarak), B adalah inset (peta kecil lokasi), D adalah koordinat (garis lintang/bujur).'
});

// Q2 medium Interaksi ruang — ans:0 (A)
q.push({
  subject:'ips', difficulty:'medium', topic:'Geografi', subtopic:'Interaksi ruang',
  skill_type:'reasoning', question_type:'story_problem',
  tags:['ips-level-2-speed-h'], is_active:true,
  question:'Bacalah skenario berikut:\n\n*Setiap tahun, ratusan ribu warga desa di Jawa Tengah dan Jawa Timur merantau ke Jakarta dan kota-kota besar lain untuk mencari pekerjaan. Akibatnya, banyak desa kekurangan tenaga kerja usia produktif. Sawah mulai ditelantarkan, kegiatan seni tradisi sepi peminat, dan anak-anak yang ditinggal orang tuanya merantau dibesarkan oleh kakek-nenek.*\n\nDampak **negatif** urbanisasi yang paling langsung dirasakan oleh desa-desa asal perantau adalah ...',
  options:[
    'Berkurangnya tenaga kerja produktif di desa sehingga kegiatan pertanian dan budaya lokal melemah',
    'Desa menjadi lebih maju karena perantau mengirim uang dari kota',
    'Urbanisasi menyebabkan penduduk kota berkurang sehingga harga tanah di kota turun',
    'Semua penduduk desa akhirnya pindah ke kota dan desa menjadi kosong'
  ],
  answer:0,
  rationale:'**Jawaban: A**\n\nLangkah 1: Urbanisasi adalah perpindahan penduduk dari desa ke kota untuk mencari penghidupan lebih baik.\n\nLangkah 2: Ketika orang-orang usia produktif (15–45 tahun) meninggalkan desa, yang tersisa adalah anak-anak dan lansia. Ini menyebabkan:\n- Sawah tidak ada yang menggarap → pertanian terbengkalai\n- Pelukis, pengrajin, penari tradisi → kehilangan regenerasi\n- Anak-anak tumbuh tanpa bimbingan langsung orang tua\n\n**Materi terkait:** *Ketimpangan pembangunan* antarwilayah menjadi pemicu utama urbanisasi. Solusi jangka panjang yang sering diupayakan: pembangunan infrastruktur dan industri di daerah agar peluang kerja tersedia tanpa harus merantau jauh.\n\nInsight kunci: Urbanisasi punya dua sisi — kota mendapat tenaga kerja murah, desa kehilangan sumber dayanya.\n\nKenapa opsi lain salah: B ada benarnya (remitansi/kiriman uang) tetapi itu dampak *positif*, bukan yang ditanya; C dan D terlalu ekstrem dan tidak sesuai fakta.'
});

// Q3 medium Kondisi geografis Indonesia — ans:3 (D)
q.push({
  subject:'ips', difficulty:'medium', topic:'Geografi', subtopic:'Kondisi geografis Indonesia',
  skill_type:'reasoning', question_type:'story_problem',
  tags:['ips-level-2-speed-h'], is_active:true,
  question:'Bacalah teks berikut:\n\n*Para nelayan tradisional di pantai selatan Jawa sudah lama mengenal dua musim yang berbeda. Pada musim tertentu, angin bertiup dari arah barat daya membawa banyak hujan dan ombak besar — mereka menyebutnya musim barat. Pada musim lain, angin datang dari arah tenggara, cuaca cerah dan laut lebih tenang — mereka menyebutnya musim timur.*\n\nPenjelasan paling tepat mengapa Indonesia memiliki dua musim yang berbeda seperti itu adalah ...',
  options:[
    'Indonesia memiliki banyak gunung berapi yang memengaruhi pola curah hujan di setiap daerah',
    'Posisi Indonesia di khatulistiwa membuat matahari bersinar lebih terik sehingga terbentuk dua musim',
    'Indonesia dikelilingi oleh dua samudra yang suhunya selalu berbeda',
    'Angin muson yang berhembus bergantian dari Benua Asia (musim barat: basah) dan Benua Australia (musim timur: kering) memengaruhi cuaca dan iklim di Indonesia sepanjang tahun'
  ],
  answer:3,
  rationale:'**Jawaban: D**\n\nLangkah 1: Dua musim yang dimaksud adalah musim hujan dan musim kemarau.\n\nLangkah 2: Penyebab utamanya adalah **angin muson** — angin yang berbalik arah secara periodik setiap 6 bulan:\n- **Muson barat (Oktober–April):** bertiup dari Benua Asia yang dingin + basah menuju Australia yang panas → membawa uap air → Indonesia musim *hujan*.\n- **Muson timur (April–Oktober):** bertiup dari Australia yang kering menuju Asia → udara kering → Indonesia musim *kemarau*.\n\n**Materi terkait:** Angin muson terbentuk karena perbedaan tekanan udara antara daratan besar (benua) dan lautan. Saat musim panas di Asia, daratan lebih panas dari laut → tekanan rendah di Asia → angin bergerak dari Australia ke Asia melewati Indonesia.\n\nInsight kunci: Letak Indonesia di antara dua benua adalah kunci mengapa muson sangat berpengaruh pada iklimnya.\n\nKenapa opsi lain salah: A (gunung berapi) hanya memengaruhi cuaca lokal, bukan pola dua musim nasional; B (khatulistiwa) membuat iklim tropis secara umum, bukan dua musim; C (dua samudra) bukan penjelasan utama musim.'
});

// Q4 hard Lingkungan hidup & sumber daya — ans:1 (B)
q.push({
  subject:'ips', difficulty:'hard', topic:'Geografi', subtopic:'Lingkungan hidup & sumber daya',
  skill_type:'reasoning', question_type:'multi_step',
  tags:['ips-level-2-speed-h'], is_active:true,
  question:'Perhatikan informasi berikut:\n\n*Kalimantan memiliki hutan hujan tropis terbesar ketiga di dunia dan merupakan habitat asli orangutan. Dalam 30 tahun terakhir, lebih dari separuh hutan Kalimantan hilang akibat pembukaan lahan kelapa sawit, penebangan kayu, dan tambang batu bara. Dampaknya berlapis: orangutan kehilangan habitat dan terancam punah; tanah gambut yang kering menjadi sangat mudah terbakar saat musim kemarau, menghasilkan asap tebal; akar hutan yang hilang tidak lagi menahan air hujan sehingga banjir lebih sering dan lebih dahsyat.*\n\nDari informasi, rantai dampak deforestasi di Kalimantan yang paling tepat menggambarkan hubungan SEBAB-AKIBAT bertingkat adalah ...',
  options:[
    'Deforestasi tidak berpengaruh signifikan karena hutan bisa ditanam kembali dalam waktu singkat',
    'Hilangnya tutupan hutan → (1) hilang habitat → kepunahan fauna; (2) gambut kering → kebakaran hutan → kabut asap; (3) hilang resapan air → banjir lebih sering — semua dampak ini terjadi serentak dan saling memperburuk',
    'Deforestasi hanya memengaruhi orangutan saja tanpa dampak lain yang signifikan bagi manusia',
    'Pembukaan lahan selalu menghasilkan manfaat ekonomi yang lebih besar dari kerugian lingkungannya'
  ],
  answer:1,
  rationale:'**Jawaban: B**\n\nSoal ini menguji kemampuan **menelusuri rantai dampak multi-level** dari satu penyebab.\n\nLangkah 1 — Dampak biodiversitas: Hutan = habitat → hilang hutan = hilang tempat tinggal, makan, berkembang biak orangutan dan ribuan spesies lain → kepunahan lokal atau global.\n\nLangkah 2 — Dampak bencana iklim: Gambut adalah tanah organik yang sangat mudah terbakar jika kering. Hutan gambut yang ditebang → gambut terekspos panas → saat kemarau = kebakaran hebat → asap menyebar ratusan km → ISPA (infeksi saluran pernapasan atas) di mana-mana.\n\nLangkah 3 — Dampak hidrologi: Akar pohon menyerap dan menahan air hujan di dalam tanah. Tanpa hutan → hujan langsung mengalir ke sungai → banjir mendadak dan lebih parah; di musim kemarau, tidak ada cadangan air tanah → kekeringan.\n\n**Materi terkait:** *Ekosistem* adalah jaringan yang saling terhubung — merusak satu komponen sering memicu reaksi berantai tak terduga. Konsep ini disebut *cascading effects* atau efek domino lingkungan.\n\nInsight kunci: Deforestasi bukan hanya masalah "pohon yang hilang" — ini masalah air, udara, pangan, dan kehidupan jutaan orang.\n\nKenapa opsi lain salah: A meremehkan skala kerusakan permanen gambut (butuh ribuan tahun terbentuk); C mengabaikan dampak pada manusia (banjir, asap); D mengabaikan biaya lingkungan jangka panjang yang sering jauh melebihi keuntungan jangka pendek.'
});

// ─── SEJARAH ────────────────────────────────────────────────────────────────

// Q5 easy Warisan budaya & nasionalisme — ans:0 (A)
q.push({
  subject:'ips', difficulty:'easy', topic:'Sejarah', subtopic:'Warisan budaya & nasionalisme',
  skill_type:'understanding', question_type:'concept_check',
  tags:['ips-level-2-speed-h'], is_active:true,
  question:'Pada 2 Oktober 2009, UNESCO mengakui **Batik** sebagai *Intangible Cultural Heritage* (Warisan Budaya Tak Benda) milik Indonesia. Pengakuan ini memiliki arti penting karena ...',
  options:[
    'Menegaskan bahwa batik adalah karya asli budaya Indonesia yang unik, mendorong bangsa Indonesia untuk melestarikan dan mengembangkan batik agar tidak punah atau diklaim pihak lain',
    'Mengharuskan semua negara di dunia memakai batik sebagai pakaian resmi setiap hari',
    'Membuktikan bahwa batik lebih indah dari semua kain tenun tradisional negara lain',
    'Memberikan hak paten eksklusif kepada satu perusahaan Indonesia untuk memproduksi batik'
  ],
  answer:0,
  rationale:'**Jawaban: A**\n\nLangkah 1: UNESCO mengakui batik sebagai milik Indonesia → ini pengakuan resmi internasional tentang identitas budaya.\n\nLangkah 2: Pengakuan ini memiliki dua dampak utama:\n- **Pelestarian:** mendorong masyarakat Indonesia untuk terus mewariskan ilmu membatik ke generasi berikutnya.\n- **Perlindungan:** secara moral mencegah klaim budaya oleh pihak lain (meski bukan perlindungan hukum seperti paten).\n\n**Materi terkait:** Batik memiliki ratusan motif yang berbeda-beda menurut daerah asal — batik Pekalongan, Solo, Yogyakarta, Cirebon, Madura, Papua, masing-masing punya keunikan. Pada 2 Oktober (Hari Batik Nasional), warga Indonesia merayakannya dengan mengenakan batik.\n\nInsight kunci: Warisan budaya bukan hanya tentang keindahan — ini tentang identitas, sejarah, dan kelangsungan suatu komunitas.\n\nKenapa opsi lain salah: B berlebihan (tidak ada kewajiban global); C adalah perbandingan yang tidak relevan; D salah — paten tidak diberikan UNESCO untuk budaya.'
});

// Q6 medium Sejarah Indonesia — ans:3 (D)
q.push({
  subject:'ips', difficulty:'medium', topic:'Sejarah', subtopic:'Sejarah Indonesia',
  skill_type:'reasoning', question_type:'story_problem',
  tags:['ips-level-2-speed-h'], is_active:true,
  question:'Bacalah teks berikut:\n\n*Islam mulai masuk ke Nusantara diperkirakan antara abad ke-7 hingga ke-13. Berbeda dari penyebaran agama di banyak tempat lain yang seringkali melalui perang atau paksaan, Islam di Nusantara umumnya menyebar secara damai. Para pedagang Muslim dari Gujarat (India), Arab, dan Persia singgah di pelabuhan-pelabuhan Nusantara untuk berdagang. Di sinilah terjadi interaksi budaya — dan banyak penguasa lokal serta rakyat biasa tertarik dan memeluk Islam secara sukarela.*\n\nFaktor yang paling menentukan **mengapa Islam menyebar secara damai** di Nusantara adalah ...',
  options:[
    'Penguasa-penguasa lokal diperintahkan langsung oleh Kerajaan Arab untuk memeluk Islam',
    'Tentara Islam dari luar negeri menaklukkan seluruh Nusantara sebelum menyebarkan ajarannya',
    'Islam masuk bersamaan dengan datangnya penjajah Eropa sehingga rakyat memilih Islam sebagai perlawanan',
    'Jalur perdagangan menciptakan hubungan yang setara dan saling menguntungkan — Islam diperkenalkan melalui interaksi budaya yang organik, bukan paksaan, sehingga penerimaan masyarakat lebih tulus dan mendalam'
  ],
  answer:3,
  rationale:'**Jawaban: D**\n\nLangkah 1: Pedagang Muslim datang bukan sebagai penakluk melainkan sebagai mitra dagang. Mereka membangun kepercayaan dan relasi sosial sebelum memperkenalkan keyakinan.\n\nLangkah 2: Proses ini berbeda secara fundamental dari penyebaran paksa — orang yang secara sukarela tertarik lebih mudah mendalami dan menjalankan ajaran dengan penuh kesadaran.\n\nLangkah 3: Penguasa lokal yang memeluk Islam juga mendapat manfaat jaringan dagang Muslim yang luas — sehingga ada insentif ekonomi dan sosial, bukan sekadar tekanan religius.\n\n**Materi terkait:** Wali Songo adalah contoh dakwah adaptif yang memakai seni (wayang, gamelan) dan tradisi lokal untuk menyampaikan nilai-nilai Islam — strategi akulturasi yang berhasil. Pelabuhan Demak, Cirebon, dan Gresik menjadi pusat penyebaran Islam awal.\n\nInsight kunci: Metode penyebaran memengaruhi kedalaman dan keberlanjutan penerimaan suatu kepercayaan dalam masyarakat.\n\nKenapa opsi lain salah: A dan B mengandaikan otoritas atau kekuatan militer yang tidak terjadi; C mengacaukan urutan waktu — Islam masuk jauh sebelum penjajah Eropa datang secara masif.'
});

// Q7 medium Tokoh & perubahan sosial — ans:2 (C)
q.push({
  subject:'ips', difficulty:'medium', topic:'Sejarah', subtopic:'Tokoh & perubahan sosial',
  skill_type:'reasoning', question_type:'story_problem',
  tags:['ips-level-2-speed-h'], is_active:true,
  question:'Bacalah teks berikut:\n\n*Ki Hajar Dewantara (KHD) mendirikan Taman Siswa di Yogyakarta pada 1922. Sekolah ini terbuka untuk semua anak pribumi tanpa memandang status sosial — berbeda dari sekolah kolonial Belanda yang hanya menerima anak pegawai pemerintah dan kaum bangsawan. KHD terkenal dengan tiga semboyannya: "Ing ngarsa sung tuladha, ing madya mangun karsa, tut wuri handayani" (di depan memberi teladan, di tengah membangun semangat, di belakang memberi dorongan).*\n\nKontribusi paling mendasar Ki Hajar Dewantara bagi pendidikan Indonesia adalah ...',
  options:[
    'Memperkenalkan teknologi komputer dan internet ke sekolah-sekolah di Indonesia',
    'Mendirikan universitas teknik pertama di Nusantara untuk mencetak insinyur lokal',
    'Memperjuangkan akses pendidikan yang merata bagi semua anak bangsa dan menanamkan filosofi pendidikan yang berorientasi pada karakter dan kemandirian — bukan sekadar transfer ilmu dari penjajah',
    'Menjadi menteri pendidikan pertama Indonesia yang menyusun kurikulum nasional yang dipakai hingga saat ini'
  ],
  answer:2,
  rationale:'**Jawaban: C**\n\nLangkah 1: Taman Siswa mendobrak tembok eksklusivitas pendidikan kolonial — siapapun boleh belajar.\n\nLangkah 2: Semboyan KHD mengandung filosofi yang dalam: guru bukan sekedar "pemberi informasi" tetapi pemimpin yang memberikan teladan dan mendorong murid tumbuh dari dalam.\n\nLangkah 3: Ini berbeda 180 derajat dari pendidikan kolonial yang bertujuan mencetak pekerja atau pegawai rendahan yang patuh — bukan warga yang merdeka dan berpikir kritis.\n\n**Materi terkait:** KHD diangkat sebagai Menteri Pendidikan pertama RI. Semboyannya *"Tut Wuri Handayani"* kini menjadi motto Kementerian Pendidikan. Tanggal lahirnya, 2 Mei, diperingati sebagai Hari Pendidikan Nasional.\n\nInsight kunci: Pendidikan yang baik bukan hanya mengisi kepala dengan informasi, tetapi membentuk karakter manusia yang merdeka.\n\nKenapa opsi lain salah: A tidak relevan dengan zamannya; B bukan fokus KHD; D meski KHD memang menjadi Mendikbud pertama, itu bukan *kontribusi paling mendasar* — kontribusi filosofis dan gerakan Taman Siswa jauh lebih berarti.'
});

// Q8 hard Kronologi peristiwa — TABLE — ans:1 (B)
const t_q8 = tableQ({
  intro:'Perhatikan tabel kronologi negosiasi dan perjanjian antara Indonesia dan Belanda pasca kemerdekaan.',
  headers:['Perjanjian / Konferensi','Tahun','Hasil utama bagi Indonesia'],
  rows:[
    ['Perjanjian Linggajati','1947','Belanda mengakui RI de facto di Jawa, Madura, dan Sumatra'],
    ['Perjanjian Renville','1948','RI menarik pasukan dari "kantong"; wilayah RI menyusut drastis'],
    ['KMB (Konferensi Meja Bundar)','1949','Belanda mengakui kedaulatan penuh RIS; Irian Barat ditangguhkan']
  ],
  closing:'Dari tabel, pernyataan yang paling tepat menggambarkan pola perjuangan diplomasi Indonesia adalah ...',
  options:[
    'Setiap perjanjian semakin merugikan Indonesia hingga akhirnya Indonesia menyerah kepada Belanda',
    'Perjuangan kemerdekaan bersifat ganda — tekanan militer di lapangan dan diplomasi internasional saling memperkuat; tekanan Belanda di meja perundingan selalu diimbangi perlawanan fisik di lapangan hingga akhirnya Belanda terpaksa mengakui kedaulatan di KMB',
    'Indonesia hanya mengandalkan diplomasi tanpa perlawanan militer sama sekali',
    'Semua perjanjian menghasilkan kesepakatan yang menguntungkan kedua belah pihak secara setara'
  ],
  answer:1,
  rationale:'**Jawaban: B**\n\nLangkah 1: Baca setiap baris tabel dan perhatikan hasil bagi RI.\n\nLangkah 2: Linggajati (1947) = pengakuan de facto → masih terbatas. Renville (1948) = RI rugi besar (wilayah menyusut) → membuktikan diplomasi saja tidak cukup. KMB (1949) = akhirnya pengakuan penuh.\n\nLangkah 3: Rentetan ini bukan "naik terus". Ada kemunduran di Renville. Kuncinya: setiap kali Belanda menekan habis di meja perundingan, pejuang di lapangan (Soedirman, Serangan Umum 1 Maret) membuktikan RI masih eksis → memberi tekanan balik diplomatik melalui PBB → Belanda akhirnya tidak bisa bertahan.\n\n**Materi terkait:** Kombinasi *perjuangan fisik dan diplomasi* ini dalam sejarah Indonesia dikenal sebagai strategi "perjuangan dwi-tunggal". Soekarno-Hatta mewakili jalur diplomasi; Soedirman jalur militer. Keduanya tidak bisa berjalan sendiri-sendiri.\n\nInsight kunci: Tabel kronologi mengajarkan kita bahwa sejarah bukan garis lurus — ada kemunduran, ada tekanan, tetapi ketekunan dan strategi menentukan hasil akhir.\n\nKenapa opsi lain salah: A salah — Indonesia tidak menyerah; C salah — ada perjuangan militer yang sangat intensif; D salah — Renville jelas sangat merugikan RI.'
});
q.push({
  subject:'ips', difficulty:'hard', topic:'Sejarah', subtopic:'Kronologi peristiwa',
  skill_type:'reasoning', question_type:'visual_analysis',
  tags:['ips-level-2-speed-h','table'], is_active:true, ...t_q8
});

// ─── EKONOMI ────────────────────────────────────────────────────────────────

// Q9 easy Ekonomi dasar — ans:3 (D)
q.push({
  subject:'ips', difficulty:'easy', topic:'Ekonomi', subtopic:'Ekonomi dasar',
  skill_type:'understanding', question_type:'concept_check',
  tags:['ips-level-2-speed-h'], is_active:true,
  question:'Setiap orang memiliki kebutuhan yang berbeda-beda tingkatannya. Para ahli ekonomi membagi kebutuhan menjadi tiga tingkat: **primer**, **sekunder**, dan **tersier**.\n\nContoh yang paling tepat untuk masing-masing tingkatan secara berurutan adalah ...',
  options:[
    'Mobil mewah (primer) — makan nasi (sekunder) — baju seragam (tersier)',
    'Pergi berlibur ke luar negeri (primer) — rumah tinggal sederhana (sekunder) — tas branded (tersier)',
    'Pendidikan (primer) — oksigen untuk bernapas (sekunder) — nasi untuk makan (tersier)',
    'Makanan dan minuman (primer) — pendidikan dan transportasi (sekunder) — liburan dan barang mewah (tersier)'
  ],
  answer:3,
  rationale:'**Jawaban: D**\n\nLangkah 1: Kebutuhan primer adalah kebutuhan paling mendasar — tanpanya manusia tidak bisa bertahan hidup (makan, minum, pakaian, tempat tinggal).\n\nLangkah 2: Kebutuhan sekunder adalah kebutuhan penting untuk kehidupan layak tetapi bukan yang paling mutlak (pendidikan, kesehatan, transportasi, komunikasi).\n\nLangkah 3: Kebutuhan tersier adalah kebutuhan tambahan yang bersifat kemewahan atau hiburan (liburan ke luar negeri, barang mewah, hobi mahal).\n\n**Materi terkait:** Tingkatan kebutuhan bukan bersifat kaku — kebutuhan sekunder bisa menjadi primer tergantung kondisi. Misalnya, *transportasi* bagi petani yang sawahnya jauh dari rumah bisa sangat vital; bagi anak-anak, *pendidikan* adalah kebutuhan yang sangat penting meski secara klasik dikategorikan sekunder.\n\nInsight kunci: Memahami tingkatan kebutuhan membantu kita membuat keputusan ekonomi yang lebih bijak — mendahulukan yang paling penting.\n\nKenapa opsi lain salah: A, B, C semuanya menukar urutan secara tidak tepat; pada A, mobil mewah jelas tersier, bukan primer.'
});

// Q10 medium Permintaan & penawaran — ans:0 (A)
q.push({
  subject:'ips', difficulty:'medium', topic:'Ekonomi', subtopic:'Permintaan & penawaran',
  skill_type:'reasoning', question_type:'story_problem',
  tags:['ips-level-2-speed-h'], is_active:true,
  question:'Bacalah teks berikut:\n\n*Brebes, Jawa Tengah, adalah daerah penghasil bawang merah terbesar di Indonesia. Pada awal 2024, banjir besar merendam ribuan hektar lahan bawang merah selama dua minggu, merusak sebagian besar panen yang siap dipetik. Tidak lama setelah banjir surut, harga bawang merah di pasar-pasar di seluruh Indonesia naik lebih dari 150%, dari Rp25.000/kg menjadi Rp65.000/kg.*\n\nMenggunakan konsep permintaan dan penawaran, kenaikan harga bawang merah paling tepat dijelaskan oleh ...',
  options:[
    'Banjir menghancurkan panen sehingga pasokan (penawaran) bawang merah berkurang drastis, sementara kebutuhan masyarakat akan bawang merah tidak berkurang — permintaan tetap tinggi tetapi penawaran turun tajam mendorong harga naik',
    'Masyarakat tiba-tiba membeli bawang merah jauh lebih banyak dari biasanya sehingga stok habis',
    'Pemerintah menetapkan harga minimum bawang merah untuk melindungi petani',
    'Pengiriman bawang merah dari luar negeri dihentikan sehingga Indonesia kekurangan pasokan impor'
  ],
  answer:0,
  rationale:'**Jawaban: A**\n\nLangkah 1: Banjir = penyebab eksternal yang merusak tanaman sebelum dipanen → *penawaran (supply) turun drastis*.\n\nLangkah 2: Kebutuhan dapur akan bawang merah tidak berubah hanya karena ada banjir di Brebes — orang tetap memasak → *permintaan (demand) tetap stabil*.\n\nLangkah 3: Ketika penawaran turun sementara permintaan tetap → harga keseimbangan bergerak naik.\n\n**Materi terkait:** Ini contoh nyata *supply shock* (guncangan sisi penawaran) — gangguan produksi yang tiba-tiba mempengaruhi harga. Contoh lain supply shock: letusan gunung berapi mengubur sawah, kekeringan gagal panen, wabah penyakit pada ternak.\n\nInsight kunci: Harga barang di pasar tidak ditentukan oleh satu pihak saja, tetapi oleh pertemuan permintaan dan penawaran — jika salah satunya terganggu, harga berubah.\n\nKenapa opsi lain salah: B tidak sesuai fakta (tidak ada lonjakan permintaan tiba-tiba); C adalah kebijakan harga minimum yang tidak terjadi dalam kasus ini; D bawang merah Brebes adalah produksi lokal, bukan impor.'
});

// Q11 medium Kegiatan ekonomi — ans:2 (C)
q.push({
  subject:'ips', difficulty:'medium', topic:'Ekonomi', subtopic:'Kegiatan ekonomi',
  skill_type:'reasoning', question_type:'story_problem',
  tags:['ips-level-2-speed-h'], is_active:true,
  question:'Bacalah teks berikut:\n\n*Kopi Gayo dari Aceh adalah salah satu kopi terbaik dunia. Perjalanannya panjang sebelum sampai ke cangkir kopi di Tokyo atau Amsterdam: petani di lereng pegunungan memanen buah kopi → pengolah lokal mengupas dan mengeringkan biji → eksportir memproses, mengemas, dan mengirim ke luar negeri → kedai kopi di luar negeri menyeduh dan menjual ke pelanggan. Harga satu cangkir kopi Gayo di Tokyo bisa 50–100 kali harga yang diterima petani per cangkir.*\n\nFenomena ini paling tepat menggambarkan konsep ...',
  options:[
    'Monopoli perdagangan internasional karena hanya satu negara yang boleh menjual kopi',
    'Inflasi harga kopi akibat kelebihan pasokan dari petani Aceh',
    'Rantai nilai (value chain) — setiap pelaku dalam rantai produksi menambahkan nilai dan biaya pada produk, tetapi manfaat ekonomi tidak selalu terbagi merata antara petani di hulu dan pengecer di hilir',
    'Sistem barter yang masih berlangsung antara petani dan pedagang internasional'
  ],
  answer:2,
  rationale:'**Jawaban: C**\n\nLangkah 1: Identifikasi setiap tahap: panen → olah → ekspor → seduh-jual. Setiap tahap menambahkan sesuatu (jasa pengolahan, pengemasan, transportasi, penyeduhan, brand value).\n\nLangkah 2: Konsep ini disebut **rantai nilai** (*value chain*) — nilai produk bertambah di setiap sambungan rantai.\n\nLangkah 3: Masalah yang disorot: petani di ujung "hulu" hanya menerima sebagian kecil dari harga akhir. Ini isu keadilan distribusi nilai yang penting dalam ekonomi pembangunan.\n\n**Materi terkait:** Cara petani mendapat bagian lebih besar: sertifikasi perdagangan adil (*fair trade*), koperasi yang mengolah dan mengekspor sendiri, atau branding langsung ke pembeli internasional. Kopi Gayo telah mendapat sertifikasi geografis dari Uni Eropa.\n\nInsight kunci: Memahami rantai nilai membantu kita mengerti mengapa barang ekspor bernilai tinggi di luar negeri tetapi penghasilannya tida otomatis sampai ke produsen awal.\n\nKenapa opsi lain salah: A (monopoli) tidak sesuai konteks; B (inflasi) tidak relevan; D (barter) tidak sesuai sistem perdagangan modern.'
});

// Q12 easy Peran konsumen & produsen — ans:1 (B)
q.push({
  subject:'ips', difficulty:'easy', topic:'Ekonomi', subtopic:'Peran konsumen & produsen',
  skill_type:'understanding', question_type:'concept_check',
  tags:['ips-level-2-speed-h'], is_active:true,
  question:'Setiap kemasan makanan yang dijual di minimarket biasanya mencantumkan: nama produk, komposisi bahan, informasi nilai gizi (kalori, lemak, protein), tanggal kadaluarsa, dan nama produsen.\n\nBagi konsumen, informasi di label kemasan tersebut berfungsi terutama untuk ...',
  options:[
    'Membuat produk terlihat lebih mahal dan mewah di rak toko',
    'Membantu konsumen membuat keputusan pembelian yang terinformasi — mengetahui apa yang dikonsumsi, apakah sesuai kebutuhan gizi, dan kapan produk tidak lagi aman dikonsumsi',
    'Meningkatkan pajak yang harus dibayar produsen kepada pemerintah',
    'Menggantikan fungsi dokter dalam menilai kesehatan konsumen'
  ],
  answer:1,
  rationale:'**Jawaban: B**\n\nLangkah 1: Label kemasan adalah bentuk transparansi dari produsen kepada konsumen.\n\nLangkah 2: Dengan membaca label, konsumen bisa:\n- Memilih produk yang sesuai kebutuhan (misalnya: penderita diabetes menghindari produk gula tinggi).\n- Menghindari bahan yang tidak sesuai keyakinan atau alergi.\n- Memastikan produk masih dalam masa layak konsumsi.\n\n**Materi terkait:** UU Perlindungan Konsumen mewajibkan produsen mencantumkan informasi yang benar dan tidak menyesatkan. Hak konsumen atas *informasi yang akurat* adalah salah satu hak dasar yang dilindungi undang-undang.\n\nInsight kunci: Konsumen yang cerdas membaca label — bukan karena diperintah, tetapi karena peduli pada kesehatan dan keamanan dirinya sendiri.\n\nKenapa opsi lain salah: A, C, dan D tidak mencerminkan fungsi utama label bagi konsumen.'
});

// Q13 hard Ekonomi dasar — TABLE — ans:0 (A)
const t_q13 = tableQ({
  intro:'Perhatikan data keuangan dua UMKM (Usaha Mikro, Kecil, dan Menengah) dalam satu bulan (data latihan fiktif).',
  headers:['UMKM','Biaya operasional/bulan','Pendapatan/bulan'],
  rows:[
    ['Warung Makan Pak Hendra','Rp3.500.000','Rp5.000.000'],
    ['Toko Kelontong Bu Ratna','Rp4.000.000','Rp5.800.000']
  ],
  closing:'Berdasarkan tabel, pernyataan yang paling tepat tentang laba bersih masing-masing UMKM adalah ...',
  options:[
    'Warung Makan: laba Rp1.500.000; Toko Kelontong: laba Rp1.800.000 — Toko Kelontong menghasilkan laba bersih lebih besar meskipun biaya operasionalnya juga lebih tinggi',
    'Warung Makan lebih menguntungkan karena biaya operasionalnya lebih rendah',
    'Kedua UMKM memiliki laba bersih yang sama besar',
    'Tidak cukup data untuk membandingkan karena modal awal tidak dicantumkan'
  ],
  answer:0,
  rationale:'**Jawaban: A**\n\nLangkah 1: Hitung laba bersih = Pendapatan – Biaya operasional.\n\nLangkah 2:\n- Warung Makan: Rp5.000.000 – Rp3.500.000 = **Rp1.500.000**\n- Toko Kelontong: Rp5.800.000 – Rp4.000.000 = **Rp1.800.000**\n\nLangkah 3: Toko Kelontong menghasilkan laba lebih besar (Rp1.800.000 > Rp1.500.000), meskipun biayanya juga lebih tinggi. Artinya, pendapatan Toko Kelontong tumbuh lebih cepat dari biayanya.\n\n**Materi terkait:** *Laba bersih* ≠ *pendapatan*. Banyak pengusaha pemula keliru fokus pada pendapatan tinggi tanpa memperhatikan biaya. Bisnis dengan pendapatan Rp10 juta tapi biaya Rp9,5 juta labanya hanya Rp500.000 — lebih kecil dari bisnis berpendapatan Rp5,8 juta berbiaya Rp4 juta.\n\nInsight kunci: Dalam ekonomi, yang penting bukan "berapa banyak masuk" tetapi "berapa yang tersisa setelah semua biaya dibayar".\n\nKenapa opsi lain salah: B salah — biaya rendah belum tentu berarti lebih menguntungkan; yang penting adalah selisih pendapatan dan biaya. C salah secara hitungan. D salah — soal hanya menanyakan laba bersih dari data yang ada, bukan ROI modal.'
});
q.push({
  subject:'ips', difficulty:'hard', topic:'Ekonomi', subtopic:'Ekonomi dasar',
  skill_type:'reasoning', question_type:'visual_analysis',
  tags:['ips-level-2-speed-h','table'], is_active:true, ...t_q13
});

// ─── SOSIOLOGI ───────────────────────────────────────────────────────────────

// Q14 easy Lembaga sosial — ans:3 (D)
q.push({
  subject:'ips', difficulty:'easy', topic:'Sosiologi', subtopic:'Lembaga sosial',
  skill_type:'understanding', question_type:'concept_check',
  tags:['ips-level-2-speed-h'], is_active:true,
  question:'Di setiap RW di Indonesia biasanya ada **Posyandu** (Pos Pelayanan Terpadu). Kader posyandu — warga yang terlatih secara sukarela — membantu menimbang bayi, mengukur tinggi balita, membagikan vitamin A, dan mencatat tumbuh kembang anak.\n\nPosyandu paling tepat dikelompokkan sebagai ...',
  options:[
    'Lembaga ekonomi yang bertujuan mencari keuntungan dari jasa kesehatan',
    'Lembaga pendidikan formal yang memberi ijazah kepada peserta',
    'Lembaga pemerintahan yang bertugas memungut pajak kesehatan dari warga',
    'Lembaga sosial kemasyarakatan di tingkat komunitas yang membantu memenuhi kebutuhan kesehatan ibu dan anak secara gotong royong'
  ],
  answer:3,
  rationale:'**Jawaban: D**\n\nLangkah 1: Identifikasi ciri-ciri Posyandu: berbasis komunitas, dikelola kader sukarela, tidak bertujuan profit, melayani kebutuhan kesehatan dasar.\n\nLangkah 2: Lembaga sosial adalah organisasi yang memenuhi kebutuhan tertentu dalam masyarakat secara berkelanjutan. Posyandu memenuhi kebutuhan pemantauan kesehatan anak — fungsi sosial yang penting.\n\n**Materi terkait:** Posyandu adalah contoh nyata **gotong royong** di bidang kesehatan — warga membantu warga. Keberhasilan Posyandu telah diakui WHO sebagai model posyandu komunitas yang efektif biaya. Indonesia memiliki lebih dari 300.000 Posyandu aktif.\n\nInsight kunci: Lembaga sosial tidak harus berukuran besar atau resmi — Posyandu kecil di gang sempit bisa menyelamatkan ribuan anak dari gizi buruk.\n\nKenapa opsi lain salah: A salah — Posyandu tidak mencari keuntungan; B salah — Posyandu bukan sekolah formal; C salah — Posyandu tidak memungut pajak.'
});

// Q15 medium Norma & nilai sosial — ans:1 (B)
q.push({
  subject:'ips', difficulty:'medium', topic:'Sosiologi', subtopic:'Norma & nilai sosial',
  skill_type:'reasoning', question_type:'story_problem',
  tags:['ips-level-2-speed-h'], is_active:true,
  question:'Bacalah skenario berikut:\n\n*Pak Tarman, seorang warga desa, kehilangan rumahnya karena kebakaran. Dalam seminggu setelah musibah, seluruh warga desa bergerak spontan: ada yang menyumbang kayu, ada yang menyumbang seng, ada yang memasak untuk para pekerja, dan ada yang benar-benar turun tangan membangun. Tidak ada yang meminta bayaran — ini dilakukan karena solidaritas sesama warga desa.*\n\nPerilaku warga desa tersebut paling tepat mencerminkan nilai sosial ...',
  options:[
    'Individualisme — setiap orang bekerja demi kepentingan pribadinya sendiri',
    'Gotong royong dan solidaritas komunitas — bekerja bersama secara sukarela untuk kepentingan sesama tanpa mengharapkan imbalan langsung',
    'Kompetisi — warga bersaing untuk menunjukkan siapa yang paling banyak menyumbang',
    'Birokrasi — bantuan diberikan setelah melalui prosedur administrasi yang panjang'
  ],
  answer:1,
  rationale:'**Jawaban: B**\n\nLangkah 1: Identifikasi ciri-ciri perilaku: spontan, kolektif, sukarela, untuk kepentingan warga lain.\n\nLangkah 2: Ini adalah contoh sempurna **gotong royong** — nilai asli Indonesia yang mengedepankan solidaritas dan kerja sama tanpa pamrih.\n\nLangkah 3: Bedakan dengan donasi charity formal: gotong royong lebih menekankan *keterlibatan fisik langsung* dan *kebersamaan*, bukan hanya transfer materi.\n\n**Materi terkait:** Gotong royong dalam berbagai bentuk: *sambatan* (Jawa, bantu membangun), *mapalus* (Minahasa), *subak* (Bali, sistem irigasi kolektif — diakui UNESCO), *saling bantu* (Sumatra). Nilai ini telah dirumuskan Soekarno sebagai salah satu jiwa Pancasila.\n\nInsight kunci: Gotong royong bukan sekadar tradisi lama — ini adalah modal sosial yang memperkuat ketahanan komunitas dalam menghadapi krisis.\n\nKenapa opsi lain salah: A (individualisme) kebalikan dari yang ditunjukkan; C (kompetisi) tidak ada dalam cerita; D (birokrasi) juga bertentangan dengan sifat spontan gotong royong.'
});

// Q16 medium Interaksi sosial — TABLE — ans:2 (C)
const t_q16 = tableQ({
  intro:'Perhatikan tabel jenis-jenis interaksi sosial dan contohnya.',
  headers:['Jenis Interaksi','Sifat','Contoh dalam kehidupan'],
  rows:[
    ['Kerja sama','Asosiatif','Warga bergotong royong membersihkan selokan'],
    ['Persaingan','Disosiatif','Dua warung makan bersaing menarik pelanggan'],
    ['Akomodasi','Asosiatif','Dua RT berselisih, diselesaikan lewat musyawarah'],
    ['Asimilasi','Asosiatif','Keturunan imigran mengadopsi sepenuhnya adat budaya lokal']
  ],
  closing:'Berdasarkan tabel, jenis interaksi yang termasuk kategori ASOSIATIF (mendorong persatuan atau kerja sama) adalah ...',
  options:[
    'Persaingan dan Akomodasi saja',
    'Kerja sama dan Persaingan saja',
    'Kerja sama, Akomodasi, dan Asimilasi — ketiganya bersifat asosiatif; hanya Persaingan yang bersifat disosiatif',
    'Semua jenis interaksi dalam tabel bersifat asosiatif'
  ],
  answer:2,
  rationale:'**Jawaban: C**\n\nLangkah 1: Baca kolom "Sifat" pada tabel — kerja sama, akomodasi, dan asimilasi ditandai *Asosiatif*; persaingan ditandai *Disosiatif*.\n\nLangkah 2: Asosiatif = interaksi yang mengarah pada integrasi dan persatuan (kerja sama, akomodasi, asimilasi, akulturasi). Disosiatif = interaksi yang memiliki potensi ketegangan atau perpecahan (persaingan, konflik, kontravensi).\n\nLangkah 3: Persaingan bukan selalu negatif dalam ekonomi (mendorong inovasi), tetapi secara sosiologis dikategorikan disosiatif karena mengandung potensi konflik jika tidak dikelola.\n\n**Materi terkait:**\n- *Akomodasi* mencakup: negosiasi, mediasi, arbitrasi, konsiliasi, kompromi — semua cara untuk meredakan konflik tanpa harus ada yang kalah total.\n- *Asimilasi* berbeda dari *akulturasi*: asimilasi = satu pihak melebur penuh ke yang lain; akulturasi = kedua pihak bercampur dan keduanya masih ada.\n\nInsight kunci: Memahami sifat interaksi membantu kita mengelola hubungan sosial lebih bijak — tahu kapan bersaing wajar dan kapan perlu bekerja sama.\n\nKenapa opsi lain salah: A memasukkan Persaingan yang disosiatif; B sama kesalahannya; D mengabaikan data yang menunjukkan Persaingan = disosiatif.'
});
q.push({
  subject:'ips', difficulty:'medium', topic:'Sosiologi', subtopic:'Interaksi sosial',
  skill_type:'reasoning', question_type:'visual_analysis',
  tags:['ips-level-2-speed-h','table'], is_active:true, ...t_q16
});

// Q17 hard Mobilitas sosial — ans:0 (A)
q.push({
  subject:'ips', difficulty:'hard', topic:'Sosiologi', subtopic:'Mobilitas sosial',
  skill_type:'reasoning', question_type:'multi_step',
  tags:['ips-level-2-speed-h'], is_active:true,
  question:'Bacalah skenario berikut:\n\n*Dini adalah anak seorang buruh tani dari desa terpencil di NTT. Orang tuanya tidak pernah mengenyam pendidikan formal. Berkat kecerdasannya, Dini mendapat beasiswa penuh dari sebuah yayasan swasta untuk kuliah di universitas negeri terbaik di Jawa. Delapan tahun kemudian, ia menjadi dokter spesialis dan membuka klinik di kota besar, dengan penghasilan dan status sosial yang sangat berbeda dari orang tuanya.*\n\nDari perspektif sosiologi, perubahan yang dialami Dini paling tepat disebut ...',
  options:[
    'Mobilitas sosial vertikal naik melalui jalur pendidikan — individu melampaui strata sosial warisan keluarga dan mencapai posisi yang lebih tinggi berkat usaha, kesempatan, dan investasi dalam pendidikan',
    'Mobilitas sosial horizontal — Dini hanya berpindah dari satu daerah ke daerah lain tanpa perubahan status',
    'Mobilitas sosial turun — Dini meninggalkan desa asal yang tenang dan damai untuk kehidupan kota yang keras',
    'Tidak ada mobilitas sosial karena status sosial seseorang ditentukan sejak lahir dan tidak bisa berubah'
  ],
  answer:0,
  rationale:'**Jawaban: A**\n\nLangkah 1: Definisikan mobilitas sosial — perubahan posisi seseorang dalam struktur sosial masyarakat.\n\nLangkah 2: Mobilitas *vertikal naik* terjadi ketika seseorang berpindah ke lapisan sosial yang lebih tinggi (lebih tinggi dalam hal pendidikan, pendapatan, pekerjaan, atau status).\n\nLangkah 3: Dini bergerak dari buruh tani (strata bawah) → dokter spesialis (strata atas/menengah-atas). Jalurnya adalah *pendidikan* — salah satu mekanisme mobilitas vertikal paling kuat dan terbuka di masyarakat modern.\n\nLangkah 4: Beasiswa menjadi *jembatan* yang menutup kesenjangan akses — tanpa beasiswa, kemungkinan Dini melanjutkan pendidikan sangat kecil.\n\n**Materi terkait:**\n- *Mobilitas horizontal*: berpindah ke pekerjaan setara level — misalnya, guru SD pindah mengajar di SD lain.\n- *Faktor mobilitas vertikal*: pendidikan, pernikahan, karier, usaha bisnis, bakat seni/olahraga.\n- *Sistem kasta* (seperti India tradisional) membatasi mobilitas sosial secara hukum dan adat — Indonesia tidak menganut sistem ini.\n\nInsight kunci: Pendidikan adalah "elevator sosial" paling demokratis — terbuka untuk siapa pun yang berkesempatan mengaksesnya, terlepas dari latar belakang keluarga.\n\nKenapa opsi lain salah: B salah karena ada perubahan status yang signifikan, bukan sekadar pindah daerah; C membalik arah mobilitas; D bertentangan dengan fakta bahwa mobilitas sosial nyata terjadi.'
});

// ─── INTERPRETASI DATA SOSIAL ─────────────────────────────────────────────────

// Q18 easy Kependudukan — TABLE — ans:1 (B)
const t_q18 = tableQ({
  intro:'Perhatikan data pulau-pulau besar di Indonesia (data estimasi, dibulatkan untuk latihan).',
  headers:['Pulau','Luas wilayah (km²)','Jumlah penduduk'],
  rows:[
    ['Jawa','128.297','151.600.000'],
    ['Sumatra','473.481','58.600.000'],
    ['Kalimantan','539.460','16.400.000']
  ],
  closing:'Berdasarkan tabel, pulau yang memiliki kepadatan penduduk (jiwa per km²) paling tinggi adalah ...',
  options:[
    'Sumatra, karena memiliki jumlah penduduk lebih dari 58 juta jiwa',
    'Jawa, karena meskipun luasnya terkecil di antara ketiganya, jumlah penduduknya jauh paling besar sehingga menghasilkan kepadatan tertinggi',
    'Kalimantan, karena wilayahnya paling luas sehingga menampung lebih banyak penduduk',
    'Ketiganya memiliki kepadatan yang hampir sama rata'
  ],
  answer:1,
  rationale:'**Jawaban: B**\n\nLangkah 1: Hitung estimasi kepadatan = jumlah penduduk ÷ luas wilayah.\n\nLangkah 2:\n- Jawa: 151.600.000 ÷ 128.297 ≈ **1.182 jiwa/km²**\n- Sumatra: 58.600.000 ÷ 473.481 ≈ **124 jiwa/km²**\n- Kalimantan: 16.400.000 ÷ 539.460 ≈ **30 jiwa/km²**\n\nLangkah 3: Jawa memiliki kepadatan sekitar 10× Sumatra dan 40× Kalimantan.\n\n**Materi terkait:** Ini menjelaskan mengapa pemerintah Indonesia sejak dulu menjalankan program *transmigasi* — memindahkan penduduk dari Jawa yang padat ke Kalimantan, Sulawesi, dan Papua yang jarang penduduknya. Distribusi penduduk yang tidak merata juga menyebabkan tekanan pada lahan, air, dan infrastruktur di Jawa.\n\nInsight kunci: Membaca tabel kependudukan membutuhkan perhitungan tambahan — angka jumlah penduduk saja belum cukup menentukan kepadatan; harus dibagi dengan luas wilayah.\n\nKenapa opsi lain salah: A menggunakan jumlah penduduk absolut, bukan kepadatan; C terbalik — luas besar dengan penduduk sedikit berarti kepadatan rendah; D jelas tidak benar berdasarkan hitungan.'
});
q.push({
  subject:'ips', difficulty:'easy', topic:'Interpretasi Data Sosial', subtopic:'Kependudukan',
  skill_type:'understanding', question_type:'visual_analysis',
  tags:['ips-level-2-speed-h','table'], is_active:true, ...t_q18
});

// Q19 medium Grafik sosial ekonomi — TABLE — ans:3 (D)
const t_q19 = tableQ({
  intro:'Perhatikan data rata-rata lama sekolah (tahun) berdasarkan wilayah dan jenis kelamin (data latihan fiktif).',
  headers:['Kelompok','Rata-rata lama sekolah (tahun)'],
  rows:[
    ['Perkotaan — laki-laki','10,2'],
    ['Perkotaan — perempuan','9,8'],
    ['Perdesaan — laki-laki','7,4'],
    ['Perdesaan — perempuan','6,9']
  ],
  closing:'Berdasarkan data, kesimpulan yang paling tepat tentang ketimpangan pendidikan adalah ...',
  options:[
    'Tidak ada perbedaan pendidikan antara laki-laki dan perempuan di kota maupun desa',
    'Perbedaan kota-desa dalam capaian pendidikan tidak signifikan',
    'Laki-laki perdesaan memiliki capaian pendidikan lebih rendah dari perempuan perkotaan sehingga perempuan lebih maju secara keseluruhan',
    'Terdapat dua ketimpangan sekaligus: ketimpangan kota-desa (capaian perkotaan lebih tinggi) dan ketimpangan gender (laki-laki lebih tinggi dari perempuan di kedua wilayah); perempuan perdesaan berada di posisi paling rendah'
  ],
  answer:3,
  rationale:'**Jawaban: D**\n\nLangkah 1: Baca setiap baris dan bandingkan.\n\nLangkah 2 — Ketimpangan kota-desa:\n- Kota laki-laki (10,2) vs Desa laki-laki (7,4) → selisih 2,8 tahun\n- Kota perempuan (9,8) vs Desa perempuan (6,9) → selisih 2,9 tahun\n→ Warga kota rata-rata bersekolah hampir 3 tahun lebih lama dari warga desa.\n\nLangkah 3 — Ketimpangan gender:\n- Di kota: laki-laki (10,2) > perempuan (9,8)\n- Di desa: laki-laki (7,4) > perempuan (6,9)\n→ Di kedua wilayah, laki-laki sedikit lebih tinggi.\n\nLangkah 4: Perempuan perdesaan (6,9) = kelompok paling rendah — menanggung beban *double disadvantage* (desa DAN perempuan).\n\n**Materi terkait:** Rata-rata lama sekolah adalah komponen kunci *Indeks Pembangunan Manusia (IPM)*. Kesenjangan pendidikan kota-desa dan gender adalah tantangan besar yang perlu diatasi untuk meningkatkan kualitas SDM Indonesia secara merata. Program seperti *KIP* (Kartu Indonesia Pintar) bertujuan mengurangi ketimpangan ini.\n\nInsight kunci: Data multidimensi perlu dibaca dari berbagai arah — vertikal (kota vs desa) DAN horizontal (gender) — untuk mendapat gambaran utuh.\n\nKenapa opsi lain salah: A jelas salah (ada perbedaan); B salah — 3 tahun perbedaan sangat signifikan; C salah — laki-laki perdesaan (7,4) lebih tinggi dari perempuan perkotaan (9,8) adalah tidak benar — justru perempuan perkotaan lebih tinggi.'
});
q.push({
  subject:'ips', difficulty:'medium', topic:'Interpretasi Data Sosial', subtopic:'Grafik sosial ekonomi',
  skill_type:'reasoning', question_type:'visual_analysis',
  tags:['ips-level-2-speed-h','table'], is_active:true, ...t_q19
});

// Q20 medium Studi kasus — ans:2 (C)
q.push({
  subject:'ips', difficulty:'medium', topic:'Interpretasi Data Sosial', subtopic:'Studi kasus',
  skill_type:'reasoning', question_type:'story_problem',
  tags:['ips-level-2-speed-h'], is_active:true,
  question:'Bacalah teks berikut:\n\n*Setiap tahun menjelang Hari Raya Idul Fitri, jutaan warga dari kota-kota besar (Jakarta, Surabaya, Bandung) kembali ke kampung halaman mereka di Jawa Tengah, Jawa Timur, Jawa Barat, dan daerah lain. Fenomena ini disebut "mudik". Selama 5–10 hari, ekonomi di kampung halaman mendadak ramai — pedagang pasar laku keras, usaha kecil sibuk, dan rupiah dari kota mengalir ke desa. Setelah mudik berakhir, ekonomi kembali ke ritme normal.*\n\nDari perspektif IPS, fenomena mudik memiliki makna paling tepat sebagai ...',
  options:[
    'Bukti bahwa kota-kota besar sudah tidak mampu menampung penduduk dan mereka terpaksa meninggalkan kota',
    'Masalah kemacetan lalu lintas semata yang harus diatasi pemerintah dengan infrastruktur lebih baik',
    'Fenomena sosial-ekonomi unik yang mencerminkan kuatnya ikatan keluarga, redistribusi ekonomi sementara dari kota ke desa, dan identitas budaya kolektif tentang pulang kampung',
    'Tanda bahwa Indonesia belum berhasil membangun infrastruktur transportasi yang memadai'
  ],
  answer:2,
  rationale:'**Jawaban: C**\n\nLangkah 1: Mudik bukan sekadar "pulang kampung" — ini peristiwa yang melibatkan 20–30 juta orang sekaligus, jaringan transportasi nasional, dan ekonomi dua arah.\n\nLangkah 2 — Dimensi sosial: Ikatan keluarga (*kinship*) yang kuat mendorong jutaan orang rela macet berjam-jam dan mengeluarkan biaya besar demi bertemu keluarga. Ini mencerminkan nilai kolektivisme masyarakat Indonesia.\n\nLangkah 3 — Dimensi ekonomi: Uang dari perantau mengalir ke daerah — ini *redistribusi ekonomi* sementara yang merangsang ekonomi daerah. UMKM di kampung panen rezeki.\n\nLangkah 4 — Dimensi budaya/identitas: "Pulang kampung" adalah ekspresi identitas kolektif — banyak perantau merasa butuh "mengisi ulang" akar budayanya setiap tahun.\n\n**Materi terkait:** Negara-negara lain juga punya tradisi serupa: *Chunyun* di Tiongkok (mudik terbesar di dunia, ratusan juta orang), *Eid travel* di Bangladesh. Semuanya mencerminkan nilai keluarga dan ikatan budaya yang melampaui kesulitan fisik perjalanan.\n\nInsight kunci: Satu fenomena bisa dilihat dari sudut ekonomi, sosial, dan budaya sekaligus — perspektif IPS yang holistik memberikan pemahaman yang jauh lebih kaya daripada hanya melihatnya sebagai "masalah kemacetan".\n\nKenapa opsi lain salah: A dan D hanya melihat satu sisi negatif; B mereduksi fenomena multidimensi menjadi masalah teknis semata.'
});

// ─── VERIFY & WRITE ──────────────────────────────────────────────────────────

const byAns = { 0: 0, 1: 0, 2: 0, 3: 0 };
const byDiff = {};
q.forEach((item) => {
  byAns[item.answer]++;
  byDiff[item.difficulty] = (byDiff[item.difficulty] || 0) + 1;
});
console.log(`Total: ${q.length} | Difficulty: ${JSON.stringify(byDiff)} | Answers: ${JSON.stringify(byAns)}`);

fs.writeFileSync(out, JSON.stringify(q, null, 2), 'utf8');
console.log('Written:', out);
