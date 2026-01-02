export interface GrammarTask {
    id: string;
    levelId: string;
    english: string;
    indonesian: string;
    solution: string[]; // Ordered pieces
    distractors: string[]; // Extra pieces
    explanation: string;
}

export const GRAMMAR_DATA: GrammarTask[] = [
    // --- PHASE 1: PRESENT TENSE (Daily Habits) ---
    // Rule: I/You/We/They (V1), She/He/It (V1 + s/es)
    {
        id: 'pres_1',
        levelId: 'grammar-1',
        english: 'I eat nutritious food.',
        indonesian: 'Saya makan makanan bergizi.',
        solution: ['I', 'eat', 'nutritious', 'food'],
        distractors: ['eats', 'eating', 'ate'],
        explanation: 'Gampang bro! Subjeknya "I", jadi kata kerjanya (eat) tetep asli. Nutritious itu kosa kata level 16 lho!'
    },
    {
        id: 'pres_2',
        levelId: 'grammar-1',
        english: 'She eats an apple.',
        indonesian: 'Dia makan sebuah apel.',
        solution: ['She', 'eats', 'an', 'apple'],
        distractors: ['eat', 'eating', 'ate'],
        explanation: 'Inget ya! Kalau subjeknya She, He, atau It, kata kerjanya wajib nambah "s" di belakangnya. She eats, He drinks!'
    },
    {
        id: 'pres_3',
        levelId: 'grammar-1',
        english: 'The project requires strategy.',
        indonesian: 'Proyek itu membutuhkan strategi.',
        solution: ['The', 'project', 'requires', 'strategy'],
        distractors: ['require', 'requiring', 'required'],
        explanation: 'Project itu kata ganti "It" (tunggal), jadi kata kerjanya harus pake "s" (requires). Strategy itu kata dari level 22!'
    },
    {
        id: 'pres_4',
        levelId: 'grammar-1',
        english: 'They study blockchain technology.',
        indonesian: 'Mereka mempelajari teknologi blockchain.',
        solution: ['They', 'study', 'blockchain', 'technology'],
        distractors: ['studies', 'studying', 'studied'],
        explanation: 'Subjeknya "They" (mereka), jadi kata kerjanya (study) gak perlu tambahan "s". Blockchain itu ilmu level 30!'
    },

    // --- PHASE 2: SIMPLE PAST (Completed) ---
    // Rule: V2 for all subjects
    {
        id: 'past_1_1',
        levelId: 'grammar-past-1',
        english: 'I implemented the plan.',
        indonesian: 'Saya melaksanakan rencana tersebut.',
        solution: ['I', 'implemented', 'the', 'plan'],
        distractors: ['implement', 'implements', 'implementing'],
        explanation: 'Kejadian lampau bro! Pake Verb 2 (implemented). Implement itu kosa kata level 11!'
    },
    {
        id: 'past_1_2',
        levelId: 'grammar-past-1',
        english: 'She bought expensive furniture.',
        indonesian: 'Dia membeli furnitur mahal.',
        solution: ['She', 'bought', 'expensive', 'furniture'],
        distractors: ['buy', 'buys', 'buying'],
        explanation: 'Di Simple Past, She/He/It juga pake Verb 2 (bought). Gak ada tambahan "s" lagi kalau udah lampau.'
    },
    {
        id: 'past_1_3',
        levelId: 'grammar-past-1',
        english: 'We reached our potential.',
        indonesian: 'Kami mencapai potensi kami.',
        solution: ['We', 'reached', 'our', 'potential'],
        distractors: ['reach', 'reaches', 'reaching'],
        explanation: 'Reach jadi Reached. Potential itu kata keren dari level 23. Sikat bro!'
    },

    // --- PHASE 3: PAST CONTINUOUS (In Progress) ---
    // Rule: was/were + V-ing
    {
        id: 'past_2_1',
        levelId: 'grammar-past-2',
        english: 'I was cleaning the kitchen.',
        indonesian: 'Saya sedang membersihkan dapur.',
        solution: ['I', 'was', 'cleaning', 'the', 'kitchen'],
        distractors: ['am', 'were', 'clean'],
        explanation: 'Inget rumusnya: I/She/He/It + Was. Kitchen itu kata rumah dari level 2!'
    },
    {
        id: 'past_2_2',
        levelId: 'grammar-past-2',
        english: 'They were discussing strategy.',
        indonesian: 'Mereka sedang mendiskusikan strategi.',
        solution: ['They', 'were', 'discussing', 'strategy'],
        distractors: ['was', 'are', 'discuss'],
        explanation: 'Subjek banyak (They) pake WERE. Strategy itu kata kuncinya bisnis bro!'
    },

    // --- PHASE 4: PAST PERFECT (Before another action) ---
    // Rule: had + V3
    {
        id: 'past_3_1',
        levelId: 'grammar-past-3',
        english: 'He had acquired the skills.',
        indonesian: 'Dia sudah memperoleh keahlian tersebut.',
        solution: ['He', 'had', 'acquired', 'the', 'skills'],
        distractors: ['has', 'have', 'was'],
        explanation: 'Had + Verb 3 (acquired). "Sudah" di masa lalu. Acquire itu kata canggih level 11!'
    },
    {
        id: 'past_3_2',
        levelId: 'grammar-past-3',
        english: 'I had used the computer.',
        indonesian: 'Saya sudah menggunakan komputer.',
        solution: ['I', 'had', 'used', 'the', 'computer'],
        distractors: ['have', 'was', 'use'],
        explanation: 'Past Perfect itu buat nunjukin aksi yang udah beres duluan sebelum aksi lampau lainnya.'
    },

    // --- PHASE 5: PAST PERFECT CONTINUOUS (Duration) ---
    // Rule: had been + V-ing
    {
        id: 'past_4_1',
        levelId: 'grammar-past-4',
        english: 'We had been studying literature.',
        indonesian: 'Kami sudah sedang belajar sastra.',
        solution: ['We', 'had', 'been', 'studying', 'literature'],
        distractors: ['have', 'were', 'be'],
        explanation: 'Had been + studying. Buat durasi yang udah lama dilakuin di masa lalu. Literature itu kata puitis level 26!'
    },

    // --- PHASE 6: FUTURE TENSE (Plans) ---
    // Rule: will + V1
    {
        id: 'fut_1',
        levelId: 'grammar-3',
        english: 'I will explore the destination.',
        indonesian: 'Saya akan menjelajahi tujuan tersebut.',
        solution: ['I', 'will', 'explore', 'the', 'destination'],
        distractors: ['exploring', 'explored', 'explores'],
        explanation: 'Will + Verb 1 (explore). Destination itu kosa kata jalan-jalan level 6!'
    },
    {
        id: 'fut_2',
        levelId: 'grammar-3',
        english: 'Life will be an adventure.',
        indonesian: 'Hidup akan menjadi sebuah petualangan.',
        solution: ['Life', 'will', 'be', 'an', 'adventure'],
        distractors: ['is', 'being', 'was'],
        explanation: 'Kalau ceritain keadaan masa depan, pake Will Be. Adventure itu dari level 6 juga bro!'
    },

    // --- PHASE 1: SIMPLE PRESENT - MISSION: POSITIVE (Habits & Facts) ---
    // Rule: Santuy Group (I, You, We, They) -> Base Verb (V1)
    // Rule: Elit Group (She, He, It) -> Verb + s/es (V1+s)

    // MISSION 1: Kebiasaan Pribadi (No suffix on verb)
    {
        id: 'sp_pos_1_1',
        levelId: 'grammar-p1-simple-present-positive-1',
        english: 'I play game every day.',
        indonesian: 'Saya bermain game setiap hari.',
        solution: ['I', 'play', 'game', 'every', 'day'],
        distractors: ['plays', 'playing', 'is'],
        explanation: 'Standard: "I" + "play". Karena ini kebiasaan, kata kerjanya polos tanpa tambahan. Slay!'
    },
    {
        id: 'sp_pos_1_2',
        levelId: 'grammar-p1-simple-present-positive-1',
        english: 'They study in the library.',
        indonesian: 'Mereka belajar di perpustakaan.',
        solution: ['They', 'study', 'in', 'the', 'library'],
        distractors: ['studies', 'studying', 'are'],
        explanation: 'Fakta: "They" + "study". Gunakan kata kerja dasar karena subjeknya jamak.'
    },
    {
        id: 'sp_pos_1_3',
        levelId: 'grammar-p1-simple-present-positive-1',
        english: 'We eat breakfast together.',
        indonesian: 'Kami sarapan bersama.',
        solution: ['We', 'eat', 'breakfast', 'together'],
        distractors: ['eats', 'eating', 'ate'],
        explanation: 'Kebiasaan: "We" + "eat". Rutinitas pagi bro mabar nih!'
    },
    {
        id: 'sp_pos_1_4',
        levelId: 'grammar-p1-simple-present-positive-1',
        english: 'I wake up at five am.',
        indonesian: 'Saya bangun jam lima pagi.',
        solution: ['I', 'wake', 'up', 'at', 'five', 'am'],
        distractors: ['wakes', 'woke', 'am'],
        explanation: 'Rutinitas: "I" + "wake up". Morning person bro!'
    },
    {
        id: 'sp_pos_1_5',
        levelId: 'grammar-p1-simple-present-positive-1',
        english: 'You listen to music.',
        indonesian: 'Kamu mendengarkan musik.',
        solution: ['You', 'listen', 'to', 'music'],
        distractors: ['listens', 'listening', 'are'],
        explanation: 'Hobi: "You" + "listen". Musik bikin mood gacor!'
    },
    {
        id: 'sp_pos_1_6',
        levelId: 'grammar-p1-simple-present-positive-1',
        english: 'They visit their grandma.',
        indonesian: 'Mereka mengunjungi nenek mereka.',
        solution: ['They', 'visit', 'their', 'grandma'],
        distractors: ['visits', 'visiting', 'do'],
        explanation: 'Keluarga: "They" + "visit". Cucu yang berbakti bro!'
    },
    {
        id: 'sp_pos_1_7',
        levelId: 'grammar-p1-simple-present-positive-1',
        english: 'We walk to the park.',
        indonesian: 'Kami berjalan ke taman.',
        solution: ['We', 'walk', 'to', 'the', 'park'],
        distractors: ['walks', 'walking', 'went'],
        explanation: 'Olahraga: "We" + "walk". Jalan santuy di sore hari.'
    },
    {
        id: 'sp_pos_1_8',
        levelId: 'grammar-p1-simple-present-positive-1',
        english: 'I drink tea every morning.',
        indonesian: 'Saya minum teh setiap pagi.',
        solution: ['I', 'drink', 'tea', 'every', 'morning'],
        distractors: ['drinks', 'drinking', 'am'],
        explanation: 'Minuman: "I" + "drink". Teh manis biar semangat.'
    },
    {
        id: 'sp_pos_1_9',
        levelId: 'grammar-p1-simple-present-positive-1',
        english: 'You read a book before bed.',
        indonesian: 'Kamu membaca buku sebelum tidur.',
        solution: ['You', 'read', 'a', 'book', 'before', 'bed'],
        distractors: ['reads', 'reading', 'are'],
        explanation: 'Edukasi: "You" + "read". Biar pinter bro!'
    },
    {
        id: 'sp_pos_1_10',
        levelId: 'grammar-p1-simple-present-positive-1',
        english: 'They clean the house together.',
        indonesian: 'Mereka membersihkan rumah bersama.',
        solution: ['They', 'clean', 'the', 'house', 'together'],
        distractors: ['cleans', 'cleaning', 'do'],
        explanation: 'Gotong royong: "They" + "clean". Rumah bersih hati senang.'
    },

    // MISSION 2: Kehidupan Sehari-hari (Verb + S/ES)
    {
        id: 'sp_pos_2_1',
        levelId: 'grammar-p1-simple-present-positive-2',
        english: 'She plays game every day.',
        indonesian: 'Dia bermain game setiap hari.',
        solution: ['She', 'plays', 'game', 'every', 'day'],
        distractors: ['play', 'playing', 'is'],
        explanation: 'Rule: "She" (Subjek Tunggal) + "plays" (V1 + s). Ini aturan baku buat grup elit bro!'
    },
    {
        id: 'sp_pos_2_2',
        levelId: 'grammar-p1-simple-present-positive-2',
        english: 'He drinks fresh water.',
        indonesian: 'Dia minum air segar.',
        solution: ['He', 'drinks', 'fresh', 'water'],
        distractors: ['drink', 'drinking', 'drank'],
        explanation: 'Kesehatan: "He" + "drinks". Jangan lupa tambahin "s" ya bro!'
    },
    {
        id: 'sp_pos_2_3',
        levelId: 'grammar-p1-simple-present-positive-2',
        english: 'It works perfectly.',
        indonesian: 'Itu bekerja dengan sempurna.',
        solution: ['It', 'works', 'perfectly'],
        distractors: ['work', 'working', 'worked'],
        explanation: 'Mesin/Benda: "It" + "works". Semuanya lancar jaya bro!'
    },
    {
        id: 'sp_pos_2_4',
        levelId: 'grammar-p1-simple-present-positive-2',
        english: 'She cooks dinner every night.',
        indonesian: 'Dia memasak makan malam setiap malam.',
        solution: ['She', 'cooks', 'dinner', 'every', 'night'],
        distractors: ['cook', 'cooking', 'is'],
        explanation: 'Masak-masak: "She" + "cooks". Harum banget aroma-aroma kelulusan bro!'
    },
    {
        id: 'sp_pos_2_5',
        levelId: 'grammar-p1-simple-present-positive-2',
        english: 'He goes to the gym.',
        indonesian: 'Dia pergi ke tempat gym.',
        solution: ['He', 'goes', 'to', 'the', 'gym'],
        distractors: ['go', 'going', 'is'],
        explanation: 'Body Goals: "He" + "goes". Akhiran "es" karena "go" berakhir vokal. Slay!'
    },
    {
        id: 'sp_pos_2_6',
        levelId: 'grammar-p1-simple-present-positive-2',
        english: 'It rains every afternoon.',
        indonesian: 'Hujan turun setiap siang.',
        solution: ['It', 'rains', 'every', 'afternoon'],
        distractors: ['rain', 'raining', 'was'],
        explanation: 'Cuaca: "It" + "rains". Jangan lupa bawa payung bro!'
    },
    {
        id: 'sp_pos_2_7',
        levelId: 'grammar-p1-simple-present-positive-2',
        english: 'She brushes her teeth.',
        indonesian: 'Dia menyikat giginya.',
        solution: ['She', 'brushes', 'her', 'teeth'],
        distractors: ['brush', 'brushing', 'is'],
        explanation: 'Kebersihan: "She" + "brushes". Pake "es" karena kata kerjanya berakhiran "sh".'
    },
    {
        id: 'sp_pos_2_8',
        levelId: 'grammar-p1-simple-present-positive-2',
        english: 'He washes his car.',
        indonesian: 'Dia mencuci mobilnya.',
        solution: ['He', 'washes', 'his', 'car'],
        distractors: ['wash', 'washing', 'is'],
        explanation: 'Rajin: "He" + "washes". Mobil mengkilap era gacor!'
    },
    {
        id: 'sp_pos_2_9',
        levelId: 'grammar-p1-simple-present-positive-2',
        english: 'The sun shines brightly.',
        indonesian: 'Matahari bersinar dengan terang.',
        solution: ['The', 'sun', 'shines', 'brightly'],
        distractors: ['shine', 'shining', 'are'],
        explanation: 'Fakta Alam: "The sun" (It) + "shines". Dunia jadi cerah bro!'
    },
    {
        id: 'sp_pos_2_10',
        levelId: 'grammar-p1-simple-present-positive-2',
        english: 'She sings a beautiful song.',
        indonesian: 'Dia menyanyikan sebuah lagu yang indah.',
        solution: ['She', 'sings', 'a', 'beautiful', 'song'],
        distractors: ['sing', 'singing', 'is'],
        explanation: 'Talenta: "She" + "sings". Merdu banget kayak bro!'
    },

    // MISSION 3: Nama & Orang Lain
    {
        id: 'sp_pos_3_1',
        levelId: 'grammar-p1-simple-present-positive-3',
        english: 'Budi eats rice.',
        indonesian: 'Budi makan nasi.',
        solution: ['Budi', 'eats', 'rice'],
        distractors: ['eat', 'eating', 'ate'],
        explanation: 'Budi = He. Jadi "eats" pake "s". Fakta dasar banget bro!'
    },
    {
        id: 'sp_pos_3_2',
        levelId: 'grammar-p1-simple-present-positive-3',
        english: 'The cats sleep on the bed.',
        indonesian: 'Kucing-kucing itu tidur di atas kasur.',
        solution: ['The', 'cats', 'sleep', 'on', 'the', 'bed'],
        distractors: ['sleeps', 'sleeping', 'slept'],
        explanation: 'Cats (Jamak) = They. Jadi balik polos "sleep". Awas ketukar bro!'
    },
    {
        id: 'sp_pos_3_3',
        levelId: 'grammar-p1-simple-present-positive-3',
        english: 'Ani loves her cat.',
        indonesian: 'Ani menyayangi kucingnya.',
        solution: ['Ani', 'loves', 'her', 'cat'],
        distractors: ['love', 'loving', 'is'],
        explanation: 'Ani = She. Jadi "loves" pake "s". Sayang banget bro!'
    },
    {
        id: 'sp_pos_3_4',
        levelId: 'grammar-p1-simple-present-positive-3',
        english: 'My father works hard.',
        indonesian: 'Ayahku bekerja keras.',
        solution: ['My', 'father', 'works', 'hard'],
        distractors: ['work', 'working', 'am'],
        explanation: 'Father = He. Jadi "works" pake "s". Semangat bro!'
    },
    {
        id: 'sp_pos_3_5',
        levelId: 'grammar-p1-simple-present-positive-3',
        english: 'The teacher explains the lesson.',
        indonesian: 'Guru itu menjelaskan pelajarannya.',
        solution: ['The', 'teacher', 'explains', 'the', 'lesson'],
        distractors: ['explain', 'explaining', 'are'],
        explanation: 'Teacher (Tunggal) = He/She. Jadi "explains" pake "s". Biar paham bro!'
    },
    {
        id: 'sp_pos_3_6',
        levelId: 'grammar-p1-simple-present-positive-3',
        english: 'Budi and Ani play together.',
        indonesian: 'Budi dan Ani bermain bersama.',
        solution: ['Budi', 'and', 'Ani', 'play', 'together'],
        distractors: ['plays', 'playing', 'do'],
        explanation: 'Budi & Ani (Dua orang) = They. Jadi balik polos "play". Mabar bareng bro!'
    },
    {
        id: 'sp_pos_3_7',
        levelId: 'grammar-p1-simple-present-positive-3',
        english: 'Mr Smith speaks English.',
        indonesian: 'Tuan Smith berbicara bahasa Inggris.',
        solution: ['Mr', 'Smith', 'speaks', 'English'],
        distractors: ['speak', 'speaking', 'is'],
        explanation: 'Mr Smith = He. Jadi "speaks" pake "s". Cas-cis-cus bro!'
    },
    {
        id: 'sp_pos_3_8',
        levelId: 'grammar-p1-simple-present-positive-3',
        english: 'My sister draws a picture.',
        indonesian: 'Adikku menggambar sebuah gambar.',
        solution: ['My', 'sister', 'draws', 'a', 'picture'],
        distractors: ['draw', 'drawing', 'am'],
        explanation: 'Sister = She. Jadi "draws" pake "s". Artistik bro!'
    },
    {
        id: 'sp_pos_3_9',
        levelId: 'grammar-p1-simple-present-positive-3',
        english: 'The dog barks at strangers.',
        indonesian: 'Anjing itu menggonggong pada orang asing.',
        solution: ['The', 'dog', 'barks', 'at', 'strangers'],
        distractors: ['bark', 'barking', 'is'],
        explanation: 'Dog (Tunggal) = It. Jadi "barks" pake "s". Waspada bro!'
    },
    {
        id: 'sp_pos_3_10',
        levelId: 'grammar-p1-simple-present-positive-3',
        english: 'The water boils at one hundred degrees.',
        indonesian: 'Air mendidih pada suhu seratus derajat.',
        solution: ['The', 'water', 'boils', 'at', 'one', 'hundred', 'degrees'],
        distractors: ['boil', 'boiling', 'are'],
        explanation: 'Fakta Sains: Water (Uncountable) = It. Jadi "boils" pake "s". Panas bro!'
    },

    // MISSION 4: Dunia Kerja & Sekolah
    {
        id: 'sp_pos_4_1',
        levelId: 'grammar-p1-simple-present-positive-4',
        english: 'I study English every Monday.',
        indonesian: 'Saya belajar bahasa Inggris setiap Senin.',
        solution: ['I', 'study', 'English', 'every', 'Monday'],
        distractors: ['studies', 'studying', 'am'],
        explanation: 'Jadwal: "I" + "study". Rutinitas belajar era gacor!'
    },
    {
        id: 'sp_pos_4_2',
        levelId: 'grammar-p1-simple-present-positive-4',
        english: 'She teaches math at the university.',
        indonesian: 'Dia mengajar matematika di universitas.',
        solution: ['She', 'teaches', 'math', 'at', 'the', 'university'],
        distractors: ['teach', 'teaching', 'is'],
        explanation: 'Pekerjaan: "She" + "teaches". Pake "es" karena kata kerjanya berakhiran "ch".'
    },
    {
        id: 'sp_pos_4_3',
        levelId: 'grammar-p1-simple-present-positive-4',
        english: 'They work in a hospital.',
        indonesian: 'Mereka bekerja di sebuah rumah sakit.',
        solution: ['They', 'work', 'in', 'a', 'hospital'],
        distractors: ['works', 'working', 'do'],
        explanation: 'Profesi: "They" + "work". Melayani masyarakat bro!'
    },
    {
        id: 'sp_pos_4_4',
        levelId: 'grammar-p1-simple-present-positive-4',
        english: 'We attend the lecture.',
        indonesian: 'Kami menghadiri kuliah tersebut.',
        solution: ['We', 'attend', 'the', 'lecture'],
        distractors: ['attends', 'attending', 'are'],
        explanation: 'Kampus: "We" + "attend". Cari ilmu biar bro makin berwawasan!'
    },
    {
        id: 'sp_pos_4_5',
        levelId: 'grammar-p1-simple-present-positive-4',
        english: 'My coworker helps me.',
        indonesian: 'Rekan kerjaku membantuku.',
        solution: ['My', 'coworker', 'helps', 'me'],
        distractors: ['help', 'helping', 'am'],
        explanation: 'Solidaritas: Coworker (He/She) = "helps". Support system bro!'
    },
    {
        id: 'sp_pos_4_6',
        levelId: 'grammar-p1-simple-present-positive-4',
        english: 'He brings a laptop to the office.',
        indonesian: 'Dia membawa laptop ke kantor.',
        solution: ['He', 'brings', 'a', 'laptop', 'to', 'the', 'office'],
        distractors: ['bring', 'bringing', 'is'],
        explanation: 'Tech-savvy: "He" + "brings". Alat tempur era digital!'
    },
    {
        id: 'sp_pos_4_7',
        levelId: 'grammar-p1-simple-present-positive-4',
        english: 'You finish the task on time.',
        indonesian: 'Kamu menyelesaikan tugas tepat waktu.',
        solution: ['You', 'finish', 'the', 'task', 'on', 'time'],
        distractors: ['finishes', 'finishing', 'are'],
        explanation: 'Produktif: "You" + "finish". No deadline-deadline club bro!'
    },
    {
        id: 'sp_pos_4_8',
        levelId: 'grammar-p1-simple-present-positive-4',
        english: 'The students wear uniforms.',
        indonesian: 'Siswa-siswa itu mengenakan seragam.',
        solution: ['The', 'students', 'wear', 'uniforms'],
        distractors: ['wears', 'wearing', 'do'],
        explanation: 'Sekolah: Students (Jamak) = "wear". Kompak selalu bro!'
    },
    {
        id: 'sp_pos_4_9',
        levelId: 'grammar-p1-simple-present-positive-4',
        english: 'I send emails every day.',
        indonesian: 'Saya mengirim email setiap hari.',
        solution: ['I', 'send', 'emails', 'every', 'day'],
        distractors: ['sends', 'sending', 'am'],
        explanation: 'Korespondensi: "I" + "send". Komunikasi lancar bro!'
    },
    {
        id: 'sp_pos_4_10',
        levelId: 'grammar-p1-simple-present-positive-4',
        english: 'Sarah manages the project.',
        indonesian: 'Sarah mengelola proyek tersebut.',
        solution: ['Sarah', 'manages', 'the', 'project'],
        distractors: ['manage', 'managing', 'is'],
        explanation: 'Leadership: Sarah (She) = "manages". Manager material bro!'
    },

    // MISSION 5: Always & Never (Frequency)
    {
        id: 'sp_pos_5_1',
        levelId: 'grammar-p1-simple-present-positive-5',
        english: 'He always arrives on time.',
        indonesian: 'Dia selalu datang tepat waktu.',
        solution: ['He', 'always', 'arrives', 'on', 'time'],
        distractors: ['arrive', 'arriving', 'is'],
        explanation: 'International Rule: Kata keterangan frekuensi (always) diletakkan SEBELUM kata kerja (arrives). Karena subjeknya "He", verb-nya pake "s" ya!'
    },

    // MISSION 7: Healthy Living
    {
        id: 'sp_pos_7_1',
        levelId: 'grammar-p1-simple-present-positive-7',
        english: 'We drink enough water.',
        indonesian: 'Kami minum cukup air.',
        solution: ['We', 'drink', 'enough', 'water'],
        distractors: ['drinks', 'drinking', 'are'],
        explanation: 'Fakta kesehatan: "We" (Kami) + "drink" (polos). Tetap sehat tetep santuy bro!'
    },

    // MISSION 8: Digital Life
    {
        id: 'sp_pos_8_1',
        levelId: 'grammar-p1-simple-present-positive-8',
        english: 'They upload photos on Instagram.',
        indonesian: 'Mereka mengunggah foto di Instagram.',
        solution: ['They', 'upload', 'photos', 'on', 'Instagram'],
        distractors: ['uploads', 'uploading', 'is'],
        explanation: 'Era Digital: "They" + "upload". Ini menceritakan kebiasaan mereka di sosmed.'
    },

    // --- PHASE 1: SIMPLE PRESENT - MISSION: NEGATIVE (Don't & Doesn't) ---
    // Rule: Santuy (I/You/We/They) -> DO NOT (Don't)
    // Rule: Elit (She/He/It) -> DOES NOT (Doesn't) + VERB POLOS (V1)

    // MISSION 1: Not My Habit (Don't)
    {
        id: 'sp_neg_1_1',
        levelId: 'grammar-p1-simple-present-negative-1',
        english: 'I do not play game.',
        indonesian: 'Saya tidak bermain game.',
        solution: ['I', 'do', 'not', 'play', 'game'],
        distractors: ['does', 'am', 'playing'],
        explanation: 'Negative Rule: Untuk subjek "I", gunakan "do not" (atau don\'t). Kata kerjanya tetep polos ya!'
    },
    {
        id: 'sp_neg_1_2',
        levelId: 'grammar-p1-simple-present-negative-1',
        english: 'They do not study here.',
        indonesian: 'Mereka tidak belajar di sini.',
        solution: ['They', 'do', 'not', 'study', 'here'],
        distractors: ['does', 'is', 'studying'],
        explanation: 'Sama kayak "I", subjek jamak "They" juga pake "do not".'
    },

    // MISSION 2: Breaking Habits (Doesn't)
    {
        id: 'sp_neg_2_1',
        levelId: 'grammar-p1-simple-present-negative-2',
        english: 'She does not play game.',
        indonesian: 'Dia tidak bermain game.',
        solution: ['She', 'does', 'not', 'play', 'game'],
        distractors: ['do', 'plays', 'is'],
        explanation: 'CRITICAL RULE: Kalau udah ada "does not", akhiran "s" di kata kerja (plays) HILANG balik jadi polos (play). Elit tapi simpel!'
    },
    {
        id: 'sp_neg_2_2',
        levelId: 'grammar-p1-simple-present-negative-2',
        english: 'He does not drink coffee.',
        indonesian: 'Dia tidak minum kopi.',
        solution: ['He', 'does', 'not', 'drink', 'coffee'],
        distractors: ['do', 'drinks', 'is'],
        explanation: 'Ingat bro: "He" + "does not" + "drink" (tanpa s). "S"-nya sudah pindah ke "does"!'
    },

    // --- PHASE 1: SIMPLE PRESENT - MISSION: QUESTION (Do & Does) ---
    // Rule: DO + Santuy (I/You/We/They) + V1?
    // Rule: DOES + Elit (She/He/It) + V1?

    // MISSION 1: Simple Queries (Do)
    {
        id: 'sp_que_1_1',
        levelId: 'grammar-p1-simple-present-question-1',
        english: 'Do you study English?',
        indonesian: 'Apakah kamu belajar bahasa Inggris?',
        solution: ['Do', 'you', 'study', 'English', '?'],
        distractors: ['Does', 'Are', 'Am'],
        explanation: 'Interrogative Rule: Letakkan "Do" di depan kalimat untuk subjek "You". Jangan lupa tanda tanyanya!'
    },
    {
        id: 'sp_que_1_2',
        levelId: 'grammar-p1-simple-present-question-1',
        english: 'Do they play football?',
        indonesian: 'Apakah mereka bermain sepak bola?',
        solution: ['Do', 'they', 'play', 'football', '?'],
        distractors: ['Does', 'Is', 'Are'],
        explanation: 'Bro mabar: "Do" + "they" + "play". Gampang kan?'
    },

    // MISSION 2: Check on Him/Her (Does)
    {
        id: 'sp_que_2_1',
        levelId: 'grammar-p1-simple-present-question-2',
        english: 'Does she study English?',
        indonesian: 'Apakah dia belajar bahasa Inggris?',
        solution: ['Does', 'she', 'study', 'English', '?'],
        distractors: ['Do', 'Is', 'studies'],
        explanation: 'International Standard: Gunakan "Does" untuk subjek "She". Dan ingat, kata kerjanya (study) GAK BOLEH pake "s" lagi!'
    }
];
