/* 烈哥客家面 — 三语切换 (中文 / Bahasa Melayu / English)
 * 纯静态实现：data-i18n 键 + localStorage 记忆 + 设置 <html lang>。
 * 设计规则：中文主文案下方的小号拉丁装饰行(.en / mi-en) 仅在中文模式显示，
 * 切到 BM / EN 时以空串隐藏，避免与已是拉丁文的主文案重复。
 */
(function () {
  'use strict';

  var LANG_TAG = { zh: 'zh-Hans', ms: 'ms', en: 'en' };

  // 每个键 = { zh, ms, en }；值为 '' 表示该语言下隐藏该元素。
  var T = {
    /* ---- NAV ---- */
    'nav.story':   { zh: '品牌故事', ms: 'Kisah',   en: 'Story' },
    'nav.craft':   { zh: '制面工艺', ms: 'Seni Mi', en: 'Craft' },
    'nav.menu':    { zh: '菜　单',   ms: 'Menu',    en: 'Menu' },
    'nav.find':    { zh: '寻味门店', ms: 'Lokasi',  en: 'Find Us' },
    'nav.gallery': { zh: '影　像',   ms: 'Galeri',  en: 'Gallery' },

    /* ---- DRAWER (含序号) ---- */
    'dw.story':   { zh: '<span class="idx">01</span>品牌故事', ms: '<span class="idx">01</span>Kisah Kami',        en: '<span class="idx">01</span>Our Story' },
    'dw.craft':   { zh: '<span class="idx">02</span>制面工艺', ms: '<span class="idx">02</span>Seni Membuat Mi',   en: '<span class="idx">02</span>Our Craft' },
    'dw.menu':    { zh: '<span class="idx">03</span>菜　单',   ms: '<span class="idx">03</span>Menu',              en: '<span class="idx">03</span>Menu' },
    'dw.find':    { zh: '<span class="idx">04</span>寻味门店', ms: '<span class="idx">04</span>Lokasi Kami',       en: '<span class="idx">04</span>Find Us' },
    'dw.gallery': { zh: '<span class="idx">05</span>影　像',   ms: '<span class="idx">05</span>Galeri',            en: '<span class="idx">05</span>Gallery' },
    'dw.foot':    { zh: '怡保 · 客家手作面 · Since 1974', ms: 'Ipoh · Mi Hakka Buatan Tangan · Since 1974', en: 'Ipoh · Handcrafted Hakka Noodles · Since 1974' },

    /* ---- HERO ---- */
    'hero.eyebrow': { zh: '怡保 · 客家手作面', ms: 'Ipoh · Mi Hakka Buatan Tangan', en: 'Ipoh · Handcrafted Hakka Noodles' },
    'hero.title':   { zh: '一碗不变的<br>古早味<span class="yr"> 自 1974</span>', ms: 'Semangkuk rasa<br>warisan<span class="yr"> sejak 1974</span>', en: 'One unchanging<br>heritage bowl<span class="yr"> since 1974</span>' },
    'hero.sub':     { zh: '三代传承，一根正艾木棍，压出半世纪不曾改变的味道。', ms: 'Tiga generasi, satu batang kayu Cengal — menekan rasa yang tak berubah selama setengah abad.', en: 'Three generations, one Chengal pole — pressing out a flavour unchanged for half a century.' },
    'hero.subEn':   { zh: 'Handcrafted since 1974 · Three generations, one recipe', ms: '', en: '' },
    'hero.btn':     { zh: '了解我们的故事 <span class="arr">→</span>', ms: 'Kisah kami <span class="arr">→</span>', en: 'Discover our story <span class="arr">→</span>' },
    'hero.announce':{ zh: '翠林城新店 · 6月5日试营业', ms: 'Cawangan baharu, Bandar Cyber · buka 5 Jun', en: 'New branch, Bandar Cyber · soft-opens 5 Jun' },
    'hero.scroll':  { zh: '向下滑动', ms: 'Tatal ke bawah', en: 'Scroll down' },

    /* ---- MANIFESTO ---- */
    'man.eyebrow': { zh: '我们的根 · Our Roots', ms: 'Akar Kami', en: 'Our Roots' },
    'man.big':     { zh: '凌晨三点，<span class="accent">磨面的人</span>已经醒来。', ms: 'Pukul 3 pagi, <span class="accent">pembuat mi</span> sudah bangun.', en: 'At 3am, <span class="accent">the noodle-maker</span> is already awake.' },
    'man.body':    {
      zh: '五十年来，从怡保国泰茶室的一方面档，到今天熙攘的店面，烈哥客家面只做一件事——把一团全蛋面，用同一根自 1974 年沿用至今的正艾木棍，压出三代人记忆里的那个味道。面、鱼丸、酿料，样样手作，日日新鲜。这是关于耐心、手艺与家的故事。',
      ms: 'Selama lima puluh tahun — dari sebuah gerai kecil di Kedai Kopi Cathay, Ipoh, hingga ke kedai yang sibuk hari ini — Leekko Hakka Mee hanya melakukan satu perkara: mengambil seketul mi telur penuh dan menekannya, dengan batang kayu Cengal yang sama digunakan sejak 1974, menjadi rasa yang diingati tiga generasi. Mi, bebola ikan, yong tau foo — semuanya buatan tangan, segar setiap hari. Ini kisah tentang kesabaran, seni dan keluarga.',
      en: 'For fifty years — from a single stall in Ipoh’s Cathay Tea House to today’s busy shopfront — Leekko Hakka Mee has done just one thing: take a ball of whole-egg noodle and press it, with the same Chengal pole used since 1974, into the flavour three generations remember. Noodles, fish balls, stuffed sides — all handmade, fresh every day. This is a story about patience, craft and family.'
    },
    'man.s1lab': { zh: '创立之年', ms: 'Ditubuhkan',     en: 'Established' },
    'man.s1en':  { zh: 'Established', ms: '', en: '' },
    'man.s2num': { zh: '三代',     ms: '3 Gen.',        en: '3 Gen.' },
    'man.s2lab': { zh: '同心传承', ms: 'Generasi',      en: 'Generations' },
    'man.s2en':  { zh: 'Generations', ms: '', en: '' },
    'man.s3num': { zh: '3<span style="font-family:var(--font-serif-cn);font-size:0.5em;font-weight:700">时</span>', ms: '3<span style="font-family:var(--font-sans);font-size:0.5em;font-weight:700">pg</span>', en: '3<span style="font-family:var(--font-sans);font-size:0.5em;font-weight:700">am</span>' },
    'man.s3lab': { zh: '凌晨开工', ms: 'Mula awal pagi', en: 'Early start' },
    'man.s3en':  { zh: 'Every morning', ms: '', en: '' },
    'man.s4num': { zh: '手作',     ms: 'Tangan',        en: 'By hand' },
    'man.s4lab': { zh: '日日新鲜', ms: 'Segar setiap hari', en: 'Fresh daily' },
    'man.s4en':  { zh: 'Made by hand', ms: '', en: '' },

    /* ---- STORY ---- */
    'story.eyebrow': { zh: '品牌故事 · Our Story', ms: 'Kisah Kami', en: 'Our Story' },
    'story.h2':      { zh: '三代人，一根木棍', ms: 'Tiga Generasi, Satu Batang Kayu', en: 'Three Generations, One Pole' },
    'story.lead':    { zh: '一团白色的客家面，串起了一个家族半个世纪的清晨。', ms: 'Seketul mi Hakka putih yang menghubungkan pagi sebuah keluarga selama setengah abad.', en: 'One ball of white Hakka noodle, threading together half a century of a family’s mornings.' },
    'story.t1h':  { zh: '面档的开始', ms: 'Permulaan Gerai', en: 'The stall begins' },
    'story.t1p':  { zh: '黄烈（Wong Leek）在怡保国泰茶室支起面档，以家乡的客家手作面起家。一根正艾木棍，从此开始压面。', ms: 'Wong Leek membuka gerai mi di Kedai Kopi Cathay, Ipoh, bermula dengan mi Hakka buatan tangan dari kampung halamannya. Satu batang kayu Cengal — dan penekanan mi pun bermula.', en: 'Wong Leek sets up a noodle stall at Cathay Tea House, Ipoh, starting out with his hometown’s handmade Hakka noodles. One Chengal pole — and the pressing begins.' },
    'story.t1en': { zh: 'Wong Leek starts the stall at Cathay Tea House, Ipoh', ms: '', en: '' },
    'story.t2h':  { zh: '第二代接手', ms: 'Generasi Kedua Mengambil Alih', en: 'The second generation takes over' },
    'story.t2p':  { zh: '女婿何德财（Ho Teck Chai）接过手艺，承袭岳父的压面绝活，凌晨三时起灶，把全蛋面的筋道一代代传下去。', ms: 'Menantu Ho Teck Chai mewarisi seni menekan mi daripada bapa mertuanya, menyalakan dapur pada pukul 3 pagi untuk meneruskan kekenyalan mi telur penuh dari generasi ke generasi.', en: 'Son-in-law Ho Teck Chai takes up the craft, inheriting his father-in-law’s pressing technique, firing up the stove at 3am to carry the springy whole-egg noodle down the generations.' },
    'story.t2en': { zh: 'Son-in-law Ho Teck Chai joins and learns the recipe', ms: '', en: '' },
    'story.t3h':  { zh: '第二间店，落户翠林城', ms: 'Kedai Kedua di Bandar Cyber', en: 'A second shop at Bandar Cyber' },
    'story.t3p':  { zh: '招牌挂上的那天，第二间店在翠林城 Bandar Cyber 试营业。从一个小档口走到今天，传统竹升客家面的手艺，得以继续传承下去。', ms: 'Pada hari papan tanda dinaikkan, kedai kedua dibuka di Bandar Cyber. Dari sebuah gerai kecil hingga ke hari ini, seni mi Hakka tradisional terus diwarisi.', en: 'The day the signboard went up, the second shop soft-opened at Bandar Cyber. From a small stall to today, the craft of traditional bamboo-pressed Hakka noodles lives on.' },
    'story.t3en': { zh: 'A second shop opens at Bandar Cyber, Ipoh', ms: '', en: '' },
    'story.quote':{ zh: '那一团白色的客家面，<br>是三代人的共同回忆。', ms: 'Seketul mi Hakka putih itu,<br>kenangan bersama tiga generasi.', en: 'That ball of white Hakka noodle —<br>a memory shared by three generations.' },
    'story.cite': { zh: '— 烈哥客家面', ms: '— Leekko Hakka Mee', en: '— Leekko Hakka Mee' },

    /* ---- CRAFT ---- */
    'craft.eyebrow': { zh: '制面工艺 · The Craft', ms: 'Seni Membuat Mi', en: 'The Craft' },
    'craft.h2':      { zh: '慢工，才出古早味', ms: 'Kerja Perlahan, Rasa Warisan', en: 'Slow work, true heritage flavour' },
    'craft.lead':    { zh: '没有捷径。每一道工序，都和五十年前一样，靠的是一双手与一身气力。', ms: 'Tiada jalan pintas. Setiap proses sama seperti lima puluh tahun lalu — bergantung pada sepasang tangan dan tenaga.', en: 'No shortcuts. Every step is done as it was fifty years ago — with a pair of hands and plain hard work.' },
    'craft.n1': { zh: '01 / 全蛋制作', ms: '01 / Mi Telur Penuh', en: '01 / Whole egg' },
    'craft.h1': { zh: '不加一滴水', ms: 'Tanpa setitik air', en: 'Not a single drop of water' },
    'craft.p1': { zh: '只用全蛋揉面，不掺一滴水。面香更浓郁，色泽金黄透亮，是机器面学不来的厚度。', ms: 'Diuli dengan telur penuh sahaja, tanpa setitik air. Mi lebih harum, keemasan dan berkilau — ketebalan rasa yang tak mampu ditiru mi mesin.', en: 'Made with whole eggs only, not a drop of water. The noodle is richer in aroma, golden and translucent — a depth machine-made noodles can’t match.' },
    'craft.e1': { zh: '100% egg noodle — no water, only eggs', ms: '', en: '' },
    'craft.n2': { zh: '02 / 正艾木棍碾压', ms: '02 / Tekanan Kayu Cengal', en: '02 / The Chengal pole' },
    'craft.h2b':{ zh: '同一根木棍，用了五十年', ms: 'Satu batang kayu, lima puluh tahun', en: 'One pole, fifty years' },
    'craft.p2': { zh: '以身压面，用的是自 1974 年沿用至今的同一根正艾木棍，替代了早年的竹升。面的筋道与爽弹，全凭这一压一碾。', ms: 'Ditekan dengan berat badan menggunakan batang kayu Cengal yang sama sejak 1974, menggantikan buluh lama. Kekenyalan mi datang sepenuhnya daripada tekanan ini.', en: 'Pressed by body weight with the very same Chengal pole used since 1974, replacing the old bamboo. The noodle’s bite and spring come entirely from this pressing.' },
    'craft.e2': { zh: 'Pressed with the same Chengal stick used since 1974', ms: '', en: '' },
    'craft.n3': { zh: '03 / 凌晨三时开工', ms: '03 / Mula Pukul 3 Pagi', en: '03 / Starts at 3am' },
    'craft.h3b':{ zh: '天未亮，面先香', ms: 'Sebelum subuh, mi sudah harum', en: 'Before dawn, the noodles are ready' },
    'craft.p3': { zh: '磨面的人凌晨三点便已起身。当城市还在沉睡，第一批面已经在案上成形，只为赶上清晨那第一碗。', ms: 'Pembuat mi bangun seawal 3 pagi. Ketika bandar masih lena, kumpulan mi pertama sudah terbentuk di atas papan — semata-mata untuk mangkuk pertama pagi itu.', en: 'The noodle-maker is up by 3am. While the city still sleeps, the first batch is already taking shape on the board — all for that first bowl of the morning.' },
    'craft.e3': { zh: 'The noodle-maker wakes at 3am', ms: '', en: '' },
    'craft.n4': { zh: '04 / 冷冻汆烫', ms: '04 / Sejuk Beku &amp; Celur', en: '04 / Frozen, then blanched' },
    'craft.h4b':{ zh: '爽脆弹牙的秘密', ms: 'Rahsia kekenyalan', en: 'The secret to the springy bite' },
    'craft.p4': { zh: '面条冷冻定型后再下锅汆烫，锁住口感。连同手工酿豆腐、酿苦瓜、西刀鱼丸，全都现做现卖，新鲜看得见。', ms: 'Mi diperkukuh dengan pembekuan, kemudian dicelur untuk mengunci teksturnya. Bersama yong tau foo buatan tangan, peria sumbat dan bebola ikan parang — semuanya dibuat dan dijual segar.', en: 'The noodle is set by freezing, then blanched to lock in texture. Along with handmade yong tau foo, stuffed bitter gourd and wolf-herring fish balls — all made and sold fresh, freshness you can see.' },
    'craft.e4': { zh: 'Frozen, then blanched — for that signature springy bite', ms: '', en: '' },

    /* ---- MENU ---- */
    'menu.eyebrow': { zh: '菜单 · Menu', ms: 'Menu', en: 'Menu' },
    'menu.h2':      { zh: '简单几味，做了五十年', ms: 'Beberapa Hidangan, Lima Puluh Tahun', en: 'A few dishes, fifty years' },
    'menu.note':    { zh: '价格皆在 RM 20 以下　·　仅供参考，店内现点现做，恕不提供线上点餐', ms: 'Semua harga di bawah RM 20　·　Sebagai rujukan sahaja; dimasak segar di kedai, tiada pesanan dalam talian', en: 'All under RM 20　·　For reference only; cooked fresh in-store, no online ordering' },
    'menu.g1':   { zh: '面食', ms: 'Mi', en: 'Noodles' },
    'menu.g1en': { zh: 'Noodles', ms: '', en: '' },
    'menu.i1n':  { zh: '竹升客家面（干捞）', ms: 'Mi Hakka Kering', en: 'Dry Hakka Mee' },
    'menu.i1en': { zh: 'Dry Hakka Mee', ms: '', en: '' },
    'menu.i1p':  { zh: '招牌', ms: 'Istimewa', en: 'Signature' },
    'menu.i1d':  { zh: '全蛋手作面，拌上猪油与酱汁，爽弹有筋道——最见功夫的一碗。', ms: 'Mi telur buatan tangan, digaul dengan minyak babi dan sos — kenyal dan padat, mangkuk yang paling menguji kemahiran.', en: 'Handmade whole-egg noodle tossed in lard and sauce — springy and firm, the bowl that shows the craft.' },
    'menu.i2n':  { zh: '客家汤面', ms: 'Mi Sup Hakka', en: 'Soup Hakka Mee' },
    'menu.i2en': { zh: 'Soup Hakka Mee', ms: '', en: '' },
    'menu.i2p':  { zh: '小鱼干', ms: 'Ikan Bilis', en: 'Anchovy broth' },
    'menu.i2d':  { zh: '小鱼干熬底，汤清味鲜，配上手工鱼丸与酿料，暖胃暖心。', ms: 'Sup jernih rebusan ikan bilis, dengan bebola ikan dan yong tau foo buatan tangan — menghangatkan hati.', en: 'A clear anchovy broth with handmade fish balls and stuffed sides — warms you through.' },
    'menu.i3n':  { zh: '咖喱客家面', ms: 'Mi Hakka Kari', en: 'Curry Hakka Mee' },
    'menu.i3en': { zh: 'Curry Hakka Mee', ms: '', en: '' },
    'menu.i3p':  { zh: '浓香', ms: 'Pekat', en: 'Rich' },
    'menu.i3d':  { zh: '南洋风味咖喱，浓而不腻，裹住每一根面条。', ms: 'Kari ala Nanyang, pekat tetapi tidak memualkan, menyaluti setiap helai mi.', en: 'Nanyang-style curry, rich but never cloying, coating every strand.' },
    'menu.g2':   { zh: '手工配料', ms: 'Sajian Buatan Tangan', en: 'Handmade Sides' },
    'menu.g2en': { zh: 'Handmade Sides', ms: '', en: '' },
    'menu.i4n':  { zh: '手工酿豆腐', ms: 'Yong Tau Foo', en: 'Yong Tau Foo' },
    'menu.i4en': { zh: 'Yong Tau Foo', ms: '', en: '' },
    'menu.i4p':  { zh: '现做', ms: 'Segar', en: 'Made fresh' },
    'menu.i5n':  { zh: '酿辣椒 · 酿苦瓜', ms: 'Cili &amp; Peria Sumbat', en: 'Stuffed Chilli &amp; Bitter Gourd' },
    'menu.i5en': { zh: 'Stuffed Chilli &amp; Bitter Gourd', ms: '', en: '' },
    'menu.i5p':  { zh: '现做', ms: 'Segar', en: 'Made fresh' },
    'menu.i6n':  { zh: '西刀鱼丸', ms: 'Bebola Ikan Parang', en: 'Wolf-Herring Fish Ball' },
    'menu.i6en': { zh: 'Wolf-Herring Fish Ball', ms: '', en: '' },
    'menu.i6p':  { zh: '手打', ms: 'Tumbuk tangan', en: 'Hand-pounded' },
    'menu.i7n':  { zh: '飞丸', ms: 'Fei Yuan', en: 'Fei Yuan Fish Ball' },
    'menu.i7en': { zh: 'Fei Yuan Fish Ball', ms: '', en: '' },
    'menu.i7p':  { zh: '手打', ms: 'Tumbuk tangan', en: 'Hand-pounded' },
    'menu.g3':   { zh: '饮品', ms: 'Minuman', en: 'Drinks' },
    'menu.g3en': { zh: 'Drinks', ms: '', en: '' },
    'menu.i8n':  { zh: '古早白咖啡', ms: 'Kopi Putih Klasik', en: 'Old-Town White Coffee' },
    'menu.i8en': { zh: 'Old-Town White Coffee', ms: '', en: '' },
    'menu.i8p':  { zh: '怡保', ms: 'Ipoh', en: 'Ipoh' },

    /* ---- FIND US ---- */
    'find.eyebrow':  { zh: '寻味门店 · Find Us', ms: 'Lokasi Kami', en: 'Find Us' },
    'find.h2':       { zh: '新店开张 · 翠林城', ms: 'Kedai Baharu · Bandar Cyber', en: 'Now Open · Bandar Cyber' },
    'find.lead':     { zh: '第二间店落户翠林城 Bandar Cyber。6月5日试营业——欢迎来吃一碗刚挂上招牌的古早味客家面。', ms: 'Kedai kedua kini di Bandar Cyber. Buka percubaan 5 Jun — datanglah menikmati semangkuk mi Hakka warisan yang baru sahaja menaikkan papan tandanya.', en: 'Our second shop is now at Bandar Cyber. Soft-opening 5 June — come for a bowl of heritage Hakka noodle from a shop that’s just raised its sign.' },
    'find.ribbon':   { zh: '6月5日 试营业 · NOW OPEN', ms: 'Buka 5 Jun · NOW OPEN', en: 'Soft-open 5 Jun · NOW OPEN' },
    'find.fBadge':   { zh: '最新开张 · Newest Branch', ms: 'Cawangan Terbaharu', en: 'Newest Branch' },
    'find.fName':    { zh: '翠林城 · 烈哥客家面', ms: 'Bandar Cyber · Leekko Hakka Mee', en: 'Bandar Cyber · Leekko Hakka Mee' },
    'find.fTag':     { zh: '「从一个小档口，到第二间店。招牌已经挂上，我们准备好了。」', ms: '“Dari sebuah gerai kecil, kini kedai kedua. Papan tanda sudah naik — kami sudah bersedia.”', en: '“From a small stall to a second shop. The sign is up — we’re ready.”' },
    'find.fHours':   { zh: '每日 7:00am – 1:00pm<br><span class="closed">每逢星期五休息</span>', ms: 'Setiap hari 7:00am – 1:00pm<br><span class="closed">Tutup setiap Jumaat</span>', en: 'Daily 7:00am – 1:00pm<br><span class="closed">Closed on Fridays</span>' },
    'find.directions':{ zh: '查看路线 <span class="arr">→</span>', ms: 'Lihat Laluan <span class="arr">→</span>', en: 'Get Directions <span class="arr">→</span>' },
    'find.more':     { zh: '其他门店 · More Locations', ms: 'Lokasi Lain', en: 'More Locations' },
    'find.s1Badge':  { zh: '本店 · Original', ms: 'Kedai Asal', en: 'Original' },
    'find.s1Name':   { zh: '街场本店', ms: 'Kedai Asal (Pekan)', en: 'The Original (Town)' },
    'find.s1Hours':  { zh: '周六 – 周四　7:00am – 12:30pm<br><span class="closed">周五休息</span>', ms: 'Sabtu – Khamis　7:00am – 12:30pm<br><span class="closed">Tutup Jumaat</span>', en: 'Sat – Thu　7:00am – 12:30pm<br><span class="closed">Closed Fri</span>' },
    'find.s2Badge':  { zh: '新店 · New Branch', ms: 'Cawangan Baharu', en: 'New Branch' },
    'find.s2Name':   { zh: 'Taman Hoover 新店', ms: 'Cawangan Taman Hoover', en: 'Taman Hoover Branch' },
    'find.s2Hours':  { zh: '第三代主理　·　营业时间请留意官方社媒', ms: 'Dikendalikan generasi ketiga　·　Sila semak media sosial rasmi untuk waktu operasi', en: 'Run by the third generation　·　Check our social media for opening hours' },

    /* ---- GALLERY ---- */
    'gal.eyebrow': { zh: '影像 · Gallery', ms: 'Galeri', en: 'Gallery' },
    'gal.h2':      { zh: '面档日常', ms: 'Hari-hari di Gerai', en: 'Life at the stall' },

    /* ---- FOOTER ---- */
    'foot.est':         { zh: '自 1974 年 · 怡保 Ipoh', ms: 'Sejak 1974 · Ipoh', en: 'Since 1974 · Ipoh' },
    'foot.navTitle':    { zh: '导览', ms: 'Navigasi', en: 'Navigate' },
    'foot.menu':        { zh: '菜单', ms: 'Menu', en: 'Menu' },
    'foot.gallery':     { zh: '影像', ms: 'Galeri', en: 'Gallery' },
    'foot.followTitle': { zh: '关注我们', ms: 'Ikuti Kami', en: 'Follow Us' },
    'foot.copy':        { zh: '© 2026 烈哥客家面 Leekko Hakka Mee · 三代手作 · 古早味相传', ms: '© 2026 Leekko Hakka Mee · Buatan tangan tiga generasi · Rasa warisan diwarisi', en: '© 2026 Leekko Hakka Mee · Three generations of handcraft · Heritage flavour, passed on' }
  };

  function applyLang(lang) {
    if (!LANG_TAG[lang]) lang = 'zh';
    document.documentElement.lang = LANG_TAG[lang];

    for (var key in T) {
      if (!Object.prototype.hasOwnProperty.call(T, key)) continue;
      var val = T[key][lang];
      if (val == null) continue; // 该语言未定义 -> 保持当前内容
      var els = document.querySelectorAll('[data-i18n="' + key + '"]');
      for (var i = 0; i < els.length; i++) {
        if (val === '') {            // 空串 -> 隐藏（拉丁装饰行规则）
          els[i].style.display = 'none';
        } else {
          els[i].style.display = '';
          els[i].innerHTML = val;
        }
      }
    }

    var btns = document.querySelectorAll('.lang-switch button');
    for (var j = 0; j < btns.length; j++) {
      btns[j].classList.toggle('active', btns[j].getAttribute('data-lang') === lang);
    }

    try { localStorage.setItem('leekko_lang', lang); } catch (e) {}
  }

  // 读取记忆的语言（默认中文）
  var saved = 'zh';
  try { saved = localStorage.getItem('leekko_lang') || 'zh'; } catch (e) {}
  if (!LANG_TAG[saved]) saved = 'zh';

  // 绑定切换按钮（脚本位于 body 末尾，DOM 已就绪）
  var switches = document.querySelectorAll('.lang-switch button');
  for (var k = 0; k < switches.length; k++) {
    switches[k].addEventListener('click', function () {
      applyLang(this.getAttribute('data-lang'));
    });
  }

  applyLang(saved);

  // 供其他脚本调用
  window.leekkoSetLang = applyLang;
})();
