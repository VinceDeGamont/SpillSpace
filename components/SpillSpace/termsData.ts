// Dokumen lengkap Clickwrap Agreement dan Kebijakan Privasi Platform SpillSpace
// Disusun sesuai format berlapis (Ringkasan + 11 Bab Ketentuan Lengkap) dari PDF.

export const TERMS_METADATA = {
  platformName: "SpillSpace",
  operatorEntity: "PT Wellmind Karya Digital (Pengelola Platform SpillSpace)",
  operatorAddress: "Jl. Jenderal Sudirman Kav. 52, Jakarta Selatan 12190",
  pseNumber: "TDPSE-0123456",
  privacyEmail: "privasi@wellmind.example",
  dpoName: "Ratna Wulandari, S.H., LL.M.",
  dpoEmail: "dpo@wellmind.example",
  hotline: "0800-1-000-000",
  version: "SpillSpace-Clickwrap-v1.0 (15/11/2026)",
  lastUpdated: "15 November 2026",
};

export type SummaryQA = {
  question: string;
  shortAnswer: string;
  detail: string;
  tone: "green" | "yellow" | "red";
};

export const LAYERED_SUMMARY_QA: SummaryQA[] = [
  {
    question: "Layanan ini untuk apa?",
    shortAnswer: "Memantau kondisi emosional, stres & work-life balance Anda",
    detail:
      "Untuk membantu Anda memantau kondisi emosional, tingkat stres, dan keseimbangan kehidupan kerja Anda, serta membantu Psikolog mengenali Pengguna yang mungkin membutuhkan pendampingan.",
    tone: "green",
  },
  {
    question: "Apakah Perusahaan bisa membaca curhatan dan jawaban saya?",
    shortAnswer: "Tidak. Hanya Laporan Agregat Anonim (min. 10 orang)",
    detail:
      "Tidak. Perusahaan tidak dapat mengakses isi curhatan, jawaban individual, riwayat emosional, maupun catatan konsultasi Anda. Perusahaan hanya menerima laporan Agregat Anonim tentang kondisi karyawan secara keseluruhan.",
    tone: "green",
  },
  {
    question: "Siapa yang bisa mengakses data saya?",
    shortAnswer: "Anda sendiri, Psikolog Mitra, & Pengelola Platform terbatas",
    detail:
      "Anda sendiri; Psikolog sebatas yang diperlukan untuk menjalankan tugas profesionalnya; dan Pengelola Platform sebatas yang diperlukan untuk menjalankan, mengamankan, dan memelihara sistem.",
    tone: "yellow",
  },
  {
    question: "Apakah hasil Layanan ini bisa memengaruhi pekerjaan saya?",
    shortAnswer: "Tidak boleh. Dilarang untuk KPI, sanksi, promosi, atau PHK",
    detail:
      "Tidak boleh. Perusahaan dilarang menggunakan hasil Layanan untuk menilai kinerja, memberikan sanksi, menolak promosi, atau melakukan PHK.",
    tone: "green",
  },
  {
    question: "Apakah data saya 100% aman?",
    shortAnswer: "Langkah teknis & organisasional berlapis + wajib notifikasi insiden",
    detail:
      "Tidak ada sistem yang dapat menjamin keamanan mutlak. Kami wajib menerapkan langkah teknis dan organisasional yang memadai, dan wajib menangani serta memberi tahu Anda apabila terjadi insiden.",
    tone: "yellow",
  },
  {
    question: "Bisakah saya berhenti?",
    shortAnswer: "Ya, tarik persetujuan & minta hapus data kapan saja",
    detail:
      "Ya. Anda dapat menarik persetujuan dan meminta penghapusan data kapan saja melalui menu Pengaturan Akun tanpa sanksi atau perlakuan merugikan dari Perusahaan.",
    tone: "red",
  },
];

export type TermsSection = {
  id: string;
  number: string;
  title: string;
  tag: string;
  paragraphs?: string[];
  bullets?: { label?: string; text: string; subBullets?: string[] }[];
  highlightBox?: string;
};

export const FULL_TERMS_SECTIONS: TermsSection[] = [
  {
    id: "pengantar",
    number: "1",
    title: "Pengantar",
    tag: "Format Berlapis",
    paragraphs: [
      'Perjanjian ini menetapkan bagaimana Kami memproses informasi pribadi apa pun yang Kami kumpulkan dari Anda atau tentang Anda, atau yang Anda berikan kepada Kami, sehubungan dengan penggunaan Anda atas layanan pemantauan kesejahteraan psikologis dan presensi kerja yang dapat diakses melalui situs web atau aplikasi SpillSpace (secara kolektif disebut sebagai "Layanan").',
      "Perjanjian ini disediakan dalam format berlapis, sehingga Anda dapat membaca ringkasannya terlebih dahulu, lalu membaca ketentuan lengkapnya. Harap baca secara menyeluruh sebelum Anda menekan tombol persetujuan.",
    ],
  },
  {
    id: "identitas",
    number: "2",
    title: "Identitas Pengelola Website dan Pengguna",
    tag: "Para Pihak & DPO",
    bullets: [
      {
        label: 'Pengelola Platform ("Kami")',
        text: "PT Wellmind Karya Digital (SpillSpace), Jl. Jenderal Sudirman Kav. 52, Jakarta Selatan 12190, nomor PSE TDPSE-0123456, kontak privasi@wellmind.example atau formulir pada menu Pengaturan Akun.",
      },
      {
        label: 'Pengguna ("Anda")',
        text: "Karyawan yang membuat akun dan menggunakan Layanan, yang identitasnya tercatat melalui akun pribadi.",
      },
      {
        label: "Perusahaan",
        text: "Badan hukum pemberi kerja yang bekerja sama dengan Pengelola Platform untuk menyediakan Layanan kepada karyawannya.",
      },
      {
        label: "Psikolog",
        text: "Tenaga profesional psikologi yang berpraktik sesuai Peraturan Perundang-undangan yang Berlaku dan Kode Etik Psikologi Indonesia.",
      },
      {
        label: "Pejabat Pelindungan Data Pribadi (DPO)",
        text: "Ratna Wulandari, S.H., LL.M., dpo@wellmind.example.",
      },
    ],
  },
  {
    id: "dasar-hukum",
    number: "3",
    title: "Maksud dan Tujuan Perjanjian; Dasar Hukum",
    tag: "UU PDP & Kode Etik",
    paragraphs: [
      "1. Perjanjian ini dibuat untuk mengatur penggunaan Layanan dan Pemrosesan Data Pribadi Anda, serta membangun kepercayaan antara Anda, Perusahaan, Psikolog, dan Pengelola Platform.",
      "2. Perjanjian ini disusun dengan memperhatikan Peraturan Perundang-undangan yang Berlaku, antara lain:",
    ],
    bullets: [
      {
        text: 'Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi ("UU PDP") beserta peraturan pelaksananya;',
      },
      {
        text: "Undang-Undang Nomor 17 Tahun 2023 tentang Kesehatan, sepanjang relevan dengan layanan dan rahasia kesehatan pribadi;",
      },
      {
        text: "Undang-Undang Nomor 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik sebagaimana telah diubah terakhir dengan Undang-Undang Nomor 1 Tahun 2024, serta Peraturan Pemerintah Nomor 71 Tahun 2019 tentang Penyelenggaraan Sistem dan Transaksi Elektronik, beserta peraturan turunannya;",
      },
      {
        text: "Kode Etik Psikologi Indonesia yang ditetapkan oleh Himpunan Psikologi Indonesia (HIMPSI), khususnya prinsip kerahasiaan dan hubungan profesional;",
      },
      {
        text: "Peraturan perundang-undangan di bidang ketenagakerjaan yang relevan dengan perlindungan hak karyawan.",
      },
    ],
    highlightBox:
      "Apabila terdapat perubahan peraturan di atas, ketentuan Perjanjian ini ditafsirkan sejalan dengan peraturan yang berlaku pada saat itu.",
  },
  {
    id: "ruang-lingkup",
    number: "4",
    title: "Ruang Lingkup Layanan",
    tag: "Indikator Warna",
    bullets: [
      {
        label: "1. Cakupan Layanan",
        text: "Layanan mencakup: pencatatan kehadiran (absen masuk dan pulang); formulir harian (pertanyaan singkat, pilihan jawaban, skala penilaian, dan kolom isian bebas); pengolahan jawaban menjadi Indikator Warna; laporan bulanan; evaluasi dan rekomendasi Psikolog; serta pelaporan Agregat Anonim kepada Perusahaan.",
      },
      {
        label: "2. Cakupan Pertanyaan",
        text: "Pertanyaan dapat mencakup tingkat stres, beban pekerjaan, tekanan lingkungan kerja, kondisi emosional, kualitas istirahat, hubungan sosial, dan keseimbangan kehidupan pribadi dengan pekerjaan.",
      },
      {
        label: "3. Arti Indikator Warna",
        text: "Hijau (kondisi relatif stabil), Kuning (terdapat indikasi tekanan atau stres yang perlu diperhatikan), Merah (terdapat indikasi tingkat stres tinggi dan disarankan mendapatkan pendampingan profesional).",
      },
      {
        label: "4. Bukan Diagnosis Medis/Psikologis",
        text: "Indikator Warna dan laporan otomatis merupakan alat pemantauan awal. Keduanya bukan diagnosis medis maupun diagnosis psikologis, dan tidak menggantikan pemeriksaan oleh psikolog, psikiater, atau tenaga kesehatan lainnya.",
      },
      {
        label: "5. Bukan Layanan Gawat Darurat",
        text: "Layanan bukan layanan gawat darurat. Apabila Anda berada dalam keadaan darurat atau merasa terancam keselamatannya, segera hubungi layanan darurat (119 ext. 8) atau fasilitas kesehatan terdekat.",
      },
    ],
  },
  {
    id: "ketentuan-akun",
    number: "5",
    title: "Ketentuan Penggunaan Akun, Persetujuan Dua Tingkat & Jenis Data",
    tag: "Persetujuan Berlapis",
    bullets: [
      {
        label: "Ketentuan Akun Pribadi",
        text: 'Anda memiliki satu akun pribadi dan tidak boleh membuat akun atas nama orang lain. Sebelum membuat akun atau menggunakan Layanan, Anda wajib membaca dan menyetujui Perjanjian ini melalui tombol "Saya Setuju dan Melanjutkan". Tanpa persetujuan tersebut, akun tidak dapat dibuat.',
      },
      {
        label: "Kerahasiaan Kredensial & Kesukarelaan",
        text: "Anda bertanggung jawab menjaga kerahasiaan kata sandi, kode OTP, dan perangkat Anda serta tidak membagikannya kepada siapa pun (termasuk atasan, rekan kerja, atau pihak Perusahaan). Penggunaan Layanan bersifat sukarela; keputusan untuk tidak menggunakan atau menarik persetujuan tidak boleh dijadikan dasar sanksi oleh Perusahaan.",
      },
      {
        label: "Persetujuan Dua Tingkat yang Terpisah",
        text: "Persetujuan Anda diberikan dalam dua tingkat yang terpisah:",
        subBullets: [
          "a. Persetujuan Umum: atas Perjanjian ini, Syarat Penggunaan Layanan, dan Pemrosesan Data Identitas serta Data Teknis untuk pengelolaan akun dan presensi.",
          "b. Persetujuan Eksplisit Data Psikologis: atas Pemrosesan Data Psikologis sebagai Data Pribadi yang bersifat spesifik, termasuk pengolahan otomatis menjadi Indikator Warna, penyusunan laporan bulanan, evaluasi Psikolog, dan penyusunan Laporan Agregat Anonim.",
          "Kotak centang Persetujuan Eksplisit Data Psikologis terpisah dan TIDAK dicentang secara otomatis. Kami menyimpan bukti persetujuan berupa waktu persetujuan, versi dokumen yang disetujui, dan identitas akun Anda.",
        ],
      },
      {
        label: "Jenis Data yang Dikumpulkan",
        text: "Data Identitas, Data Psikologis, dan data Laporan Agregat Anonim disimpan dan dikelola secara terpisah:",
        subBullets: [
          "1. Data Identitas: nama, nomor induk karyawan (NIK), email, nomor telepon, jabatan/unit kerja, data akun, dan waktu presensi.",
          "2. Data Psikologis: jawaban formulir harian, isian bebas/curhatan, Indikator Warna, laporan bulanan, hasil evaluasi, rekomendasi, serta catatan konsultasi Psikolog.",
          "3. Data Teknis: alamat IP, jenis perangkat dan peramban, waktu akses, dan log sistem untuk keamanan dan pemeliharaan.",
          "4. Data Persetujuan: bukti persetujuan dan penarikan persetujuan Anda.",
          "5. Data yang TIDAK Kami kumpulkan: data lokasi real-time, data biometrik, dan daftar kontak.",
        ],
      },
    ],
  },
  {
    id: "kerahasiaan-akses",
    number: "6",
    title: "Kerahasiaan Informasi Psikologis & Standar Hak Akses",
    tag: "Ambang Min. 10 Orang",
    paragraphs: [
      "Seluruh Data Psikologis (jawaban, cerita pribadi, curhatan, hasil formulir, dan kondisi emosional) merupakan informasi rahasia. Perusahaan tidak berhak mengakses isi curhatan, jawaban individual, riwayat emosional, Indikator Warna individual, laporan bulanan individual, maupun catatan konsultasi psikologis Anda meskipun Perusahaan yang membiayai Layanan. Kerahasiaan tetap berlaku setelah Anda berhenti bekerja di Perusahaan.",
    ],
    bullets: [
      {
        label: "1. Hak Akses Anda",
        text: "Dapat mengakses seluruh Data Psikologis dan laporan Anda sendiri melalui akun pribadi.",
      },
      {
        label: "2. Hak Akses Perusahaan",
        text: "Hanya menerima Laporan Agregat Anonim. Perusahaan TIDAK menerima dan tidak dapat meminta Data Identitas yang dikaitkan dengan Data Psikologis, Indikator Warna individual, maupun isi curhatan.",
      },
      {
        label: "3. Hak Akses Psikolog",
        text: "Hanya mengakses data yang diperlukan untuk tugas profesional. Dalam hal Indikator Warna Merah, Psikolog hanya menghubungi Anda melalui kanal Layanan untuk menawarkan pendampingan, tanpa memberi tahu Perusahaan siapa Anda.",
      },
      {
        label: "4. Hak Akses Pengelola Platform",
        text: "Akses teknis terhadap Data Psikologis dibatasi, dienkripsi, dicatat, dan hanya diberikan kepada personel tertentu untuk pemeliharaan atau penanganan insiden.",
      },
      {
        label: "5. Standar Anonimitas Laporan Agregat Anonim",
        text: "Wajib memenuhi 5 standar ketat:",
        subBullets: [
          "a. Laporan tidak sekadar menghilangkan nama, melainkan tidak memuat pengenal langsung maupun tidak langsung (NIK, email, jabatan unik, atau kombinasi atribut).",
          "b. Laporan hanya dibuat untuk kelompok dengan jumlah responden aktif sekurang-kurangnya 10 orang (ambang minimum). Apabila kelompok lebih kecil dari 10 orang, data kelompok TIDAK ditampilkan.",
          "c. Laporan tidak memuat isi curhatan atau kutipan isian bebas, serta tidak memuat pembagian berlapis (misalnya divisi + usia + jenis kelamin sekaligus).",
          "d. Laporan disampaikan secara periodik dan hanya memuat ukuran umum (kecenderungan tingkat stres, beban kerja, dan keseimbangan kehidupan kerja).",
          "e. Perusahaan dilarang mencoba mengidentifikasi individu dari laporan.",
        ],
      },
    ],
  },
  {
    id: "evaluasi-bulanan",
    number: "7",
    title: "Mekanisme Evaluasi dan Laporan Bulanan",
    tag: "Evaluasi Berkala",
    bullets: [
      {
        text: "1. Sistem mengolah jawaban harian untuk menghasilkan gambaran kondisi emosional Anda.",
      },
      {
        text: "2. Setiap akhir bulan, sistem menghasilkan laporan bulanan yang dapat Anda akses melalui akun pribadi (perkembangan tingkat stres, kondisi emosional, beban pekerjaan, dan keseimbangan kehidupan kerja).",
      },
      {
        text: "3. Psikolog dapat melakukan evaluasi dan memberikan rekomendasi tindak lanjut apabila diperlukan.",
      },
      {
        text: "4. Rekomendasi tindak lanjut bersifat saran. Keputusan konsultasi profesional mempertimbangkan evaluasi Psikolog dan keputusan Anda sendiri.",
      },
      {
        text: "5. Hasil penilaian otomatis bukan diagnosis. Anda berhak meminta peninjauan oleh Psikolog atas hasil yang menurut Anda tidak sesuai.",
      },
      {
        text: "6. Laporan individual tidak dapat diakses Perusahaan.",
      },
    ],
  },
  {
    id: "hak-kewajiban",
    number: "8",
    title: "Hak dan Kewajiban Para Pihak & Larangan Ketenagakerjaan",
    tag: "Perlindungan Karir",
    bullets: [
      {
        label: "A. Hak Anda sebagai Subjek Data Pribadi (9 Hak Utama)",
        text: "Anda berhak: (1) memperoleh informasi transparan; (2) mengetahui tujuan & dasar Pemrosesan; (3) mengakses, memperbaiki, dan memperbarui Data Pribadi; (4) meminta penghapusan/penghentian Pemrosesan; (5) menarik persetujuan Pemrosesan; (6) memperoleh kerahasiaan informasi psikologis; (7) mengetahui pihak yang dapat mengakses data; (8) mengajukan keberatan atas keputusan yang hanya didasarkan pada pemrosesan otomatis; dan (9) mengajukan pengaduan & menuntut ganti rugi atas pelanggaran Pemrosesan Data Pribadi. Permohonan melalui privasi@wellmind.example ditanggapi paling lama 30 hari kerja.",
      },
      {
        label: "B. Kewajiban Anda",
        text: "(1) Memberikan informasi yang benar sesuai kondisi Anda; (2) menjaga keamanan akun; (3) tidak menyalahgunakan Layanan (termasuk mengisi atas nama orang lain); dan (4) tidak menggunakan Layanan sebagai pengganti layanan darurat.",
      },
      {
        label: "C. Kewajiban Perusahaan",
        text: "(1) Tidak mengakses/meminta Data Psikologis individual; (2) tidak menggunakan hasil Layanan untuk kepentingan ketenagakerjaan yang merugikan; (3) tidak memaksa/mengintimidasi karyawan; (4) menggunakan Laporan Agregat Anonim hanya untuk memperbaiki lingkungan kerja; dan (5) mematuhi ambang minimum 10 orang dan larangan identifikasi.",
      },
      {
        label: "D. Larangan Penggunaan Data untuk Kepentingan Ketenagakerjaan yang Merugikan",
        text: "Perusahaan DILARANG menggunakan Data Psikologis, Indikator Warna, laporan, maupun Laporan Agregat Anonim untuk mendiskriminasi, memberikan sanksi, menurunkan penilaian kinerja, menolak/menunda promosi, memutasi secara merugikan, atau melakukan Pemutusan Hubungan Kerja (PHK). Hasil pengukuran psikologis tidak boleh dijadikan satu-satunya dasar maupun sebagian pertimbangan yang merugikan karyawan.",
      },
      {
        label: "E & F. Kewajiban Pengelola Platform dan Psikolog",
        text: "Pengelola Platform wajib menjaga pemisahan data, menolak permintaan akses Perusahaan di luar Laporan Agregat Anonim, dan memenuhi hak subjek data. Psikolog wajib mematuhi Kode Etik Psikologi Indonesia dan menjaga kerahasiaan profesional.",
      },
    ],
  },
  {
    id: "keamanan-penarikan",
    number: "9",
    title: "Keamanan, Penyimpanan, Kebocoran & Penarikan Persetujuan",
    tag: "Pemisahan 3 Lapisan",
    bullets: [
      {
        label: "1. Pemisahan Tiga Lapisan Data",
        text: "Kami memisahkan tiga lapisan data: (a) Data Identitas, (b) Data Psikologis, dan (c) data pelaporan Agregat Anonim dengan pengendalian akses berbeda serta enkripsi saat dikirim dan saat disimpan.",
      },
      {
        label: "2. Jangka Waktu Penyimpanan",
        text: "Data Identitas disimpan selama akun aktif; Data Psikologis disimpan selama maksimal 5 tahun sejak tanggal pengisian atau selama diperlukan untuk tujuan Layanan (mana yang lebih singkat); catatan bukti persetujuan disimpan selama 10 tahun sesuai kebutuhan hukum.",
      },
      {
        label: "3. Larangan Pelatihan AI & Komersialisasi",
        text: "Data Psikologis TIDAK digunakan untuk melatih, menyempurnakan, atau menguji model kecerdasan buatan (AI), dan tidak diperjualbelikan atau digunakan untuk kepentingan komersial.",
      },
      {
        label: "4. Pengungkapan Terbatas & Penanganan Kebocoran Data",
        text: "Pengungkapan hanya dapat dilakukan karena: (1) Kewajiban hukum, (2) Keadaan darurat ancaman keselamatan jiwa, atau (3) Persetujuan sah dan spesifik dari Anda. Permintaan dari atasan, HR, atau manajemen Perusahaan BUKAN dasar pengungkapan. Apabila terjadi kegagalan pelindungan Data Pribadi, Kami wajib memberitahukan secara tertulis kepada Anda dan lembaga berwenang sesuai UU PDP.",
      },
      {
        label: "5. Penarikan Persetujuan dan Penghapusan Data (Maks. 30 Hari)",
        text: "Anda dapat menarik persetujuan atas sebagian atau seluruh Pemrosesan Data Pribadi kapan saja melalui Pengaturan Akun. Setelah menerima penarikan persetujuan atau permintaan penghapusan, Kami menghentikan Pemrosesan dan menghapus/memusnahkan data dalam jangka waktu maksimal 30 hari serta menyampaikan konfirmasi tertulis. Penarikan persetujuan tidak menjadi dasar sanksi bagi Perusahaan.",
      },
    ],
  },
  {
    id: "perubahan",
    number: "10",
    title: "Perubahan Ketentuan",
    tag: "Pemberitahuan 30 Hari",
    paragraphs: [
      '1. Kami dapat memperbarui Perjanjian ini dari waktu ke waktu dan menandainya pada tanggal "Terakhir Diperbarui" di bagian atas dokumen.',
      "2. Kami memberi tahu Anda melalui pemberitahuan di platform dan/atau email paling lambat 30 hari sebelum perubahan berlaku.",
      "3. Untuk perubahan yang bersifat material (perubahan tujuan Pemrosesan, penambahan pihak penerima data, atau perubahan yang memengaruhi hak akses Perusahaan), Kami meminta persetujuan baru dari Anda sebelum perubahan berlaku.",
      "4. Perubahan tidak boleh mengurangi perlindungan kerahasiaan dan larangan penggunaan data yang merugikan tanpa persetujuan Anda.",
    ],
  },
  {
    id: "penutup",
    number: "11",
    title: "Penutup & Kontak Resmi",
    tag: "Persetujuan Elektronik",
    paragraphs: [
      "1. Perjanjian ini dibuat dan disetujui secara elektronik, serta merupakan satu kesatuan dengan Kebijakan Privasi dan Syarat Penggunaan Layanan SpillSpace.",
      "2. Apabila terdapat perbedaan penafsiran, ketentuan yang lebih melindungi kerahasiaan dan hak Anda sebagai subjek Data Pribadi yang diutamakan, sepanjang sesuai dengan Peraturan Perundang-undangan yang Berlaku.",
      '3. Dengan menekan tombol "Saya Setuju dan Melanjutkan", Anda menyatakan telah diberi kesempatan membaca Perjanjian ini, memahaminya, dan menyetujuinya secara sukarela.',
      "Hubungi Kami: apabila Anda memiliki pertanyaan, keluhan, atau ingin menggunakan hak atas Data Pribadi Anda, hubungi 0800-1-000-000 atau email ke privasi@wellmind.example (DPO: dpo@wellmind.example).",
    ],
  },
];
