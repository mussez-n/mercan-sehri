// =============================================================
// Mercan Şehri — oyun verisi
// Karakter parçaları, kilit kuralları ve görevler burada.
// Yeni parça/görev eklemek için sadece bu dosyayı düzenlemek yeterli.
//
// Kilit türleri:
//   {type:'free'}               → baştan açık
//   {type:'pearl', cost:30}     → gardıropta inciyle açılır
//   {type:'quest', quest:'pofi'}→ o görev ilk kez bitince hediye
//   {type:'stars', n:5}         → toplam yıldız sayısına ulaşınca açılır
// =============================================================

const FREE = { type: 'free' };
const P = (cost) => ({ type: 'pearl', cost });
const Q = (quest) => ({ type: 'quest', quest });
const ST = (n) => ({ type: 'stars', n });

const CATEGORIES = [
  { id: 'hair',      name: 'Saç',          icon: '💇‍♀️' },
  { id: 'hairColor', name: 'Saç Rengi',    icon: '🌈' },
  { id: 'tail',      name: 'Kuyruk',       icon: '🧜‍♀️' },
  { id: 'tailColor', name: 'Kuyruk Rengi', icon: '✨' },
  { id: 'top',       name: 'Üst',          icon: '🐚' },
  { id: 'makeup',    name: 'Makyaj',       icon: '💄' },
  { id: 'crown',     name: 'Taç',          icon: '👑' },
  { id: 'necklace',  name: 'Kolye',        icon: '📿' },
  { id: 'eyes',      name: 'Gözler',       icon: '👀' },
  { id: 'skin',      name: 'Ten',          icon: '🎨' },
];

const ITEMS = {
  skin: [
    { id: 's1', name: 'Şeftali',  color: '#fde3d2', unlock: FREE },
    { id: 's2', name: 'Bal',      color: '#f4c8a4', unlock: FREE },
    { id: 's3', name: 'Karamel',  color: '#dca47a', unlock: FREE },
    { id: 's4', name: 'Kakao',    color: '#b67a55', unlock: FREE },
    { id: 's5', name: 'Çikolata', color: '#87563a', unlock: FREE },
    { id: 's6', name: 'Deniz Mavisi', color: '#cdeefb', unlock: P(25) },
    { id: 's7', name: 'Lavanta',  color: '#e7dafb', unlock: P(25) },
  ],
  eyes: [
    { id: 'turkuaz', name: 'Turkuaz', color: '#22aebd', unlock: FREE },
    { id: 'mor',     name: 'Mor',     color: '#8a5cd6', unlock: FREE },
    { id: 'kahve',   name: 'Kahve',   color: '#7a4a2a', unlock: FREE },
    { id: 'yesil',   name: 'Yeşil',   color: '#3c9a5f', unlock: FREE },
    { id: 'mavi',    name: 'Mavi',    color: '#3b7fd9', unlock: FREE },
    { id: 'pembe',   name: 'Pembe',   color: '#e05a9a', unlock: P(15) },
    { id: 'altin',   name: 'Altın',   color: '#d4a52b', unlock: P(20) },
  ],
  hair: [
    { id: 'uzun',      name: 'Uzun Dalgalı', unlock: FREE },
    { id: 'bob',       name: 'Kısa Kesim',   unlock: FREE },
    { id: 'topuz',     name: 'Topuz',        unlock: P(30) },
    { id: 'orgu',      name: 'İki Örgü',     unlock: Q('tosba') },
    { id: 'atkuyrugu', name: 'At Kuyruğu',   unlock: P(40) },
    { id: 'bulut',     name: 'Bulut Bukle',  unlock: ST(3) },
  ],
  hairColor: [
    { id: 'pembe', name: 'Pembe Lila', colors: ['#fbd0e6', '#d9b0f2', '#b7a2f0'], unlock: FREE },
    { id: 'nane',  name: 'Nane',       colors: ['#d6fbef', '#9fe6dc', '#79cbd6'], unlock: FREE },
    { id: 'altin', name: 'Altın',      colors: ['#fff0bf', '#f9cf7c', '#eba55a'], unlock: FREE },
    { id: 'kizil', name: 'Kızıl',      colors: ['#ffb08f', '#f5774f', '#d9503a'], unlock: FREE },
    { id: 'gece',  name: 'Gece',       colors: ['#8090dc', '#4a56a8', '#2b336f'], unlock: P(20) },
    { id: 'sedef', name: 'Sedef',      colors: ['#ffffff', '#dff2ff', '#f6dcff', '#d8fff0'], unlock: P(35) },
    { id: 'gokkusagi', name: 'Gökkuşağı', colors: ['#ffb3c7', '#ffe29a', '#b5f0c8', '#a7d8ff', '#d6b8ff'], unlock: ST(5) },
  ],
  tail: [
    { id: 'klasik',  name: 'Klasik',  unlock: FREE },
    { id: 'dalgali', name: 'Dalgalı', unlock: P(30) },
    { id: 'yelpaze', name: 'Yelpaze', unlock: Q('kiskac') },
    { id: 'tul',     name: 'Tül',     unlock: P(45) },
  ],
  tailColor: [
    { id: 'sedef',   name: 'Sedef',   colors: ['#e3f4ff', '#f7dcff', '#d9fff1', '#fff2d4', '#e3f4ff'], unlock: FREE },
    { id: 'turkuaz', name: 'Turkuaz', colors: ['#a5f0e4', '#5fd0cf', '#2aa0b6'], unlock: FREE },
    { id: 'mercan',  name: 'Mercan',  colors: ['#ffd0bf', '#ff9a9a', '#ec6286'], unlock: FREE },
    { id: 'lavanta', name: 'Lavanta', colors: ['#efe2ff', '#c9a9f5', '#9479e0'], unlock: P(20) },
    { id: 'altin',   name: 'Altın',   colors: ['#fff6cc', '#f7d47a', '#e2a640'], unlock: P(30) },
    { id: 'gece',    name: 'Gece',    colors: ['#8fa0f0', '#5566cc', '#2a2f7a'], unlock: P(30) },
    { id: 'gokkusagi', name: 'Gökkuşağı', colors: ['#ffb3c7', '#ffe29a', '#b5f0c8', '#a7d8ff', '#d6b8ff'], unlock: ST(8) },
  ],
  top: [
    { id: 'kabuk',      name: 'Deniz Kabuğu', unlock: FREE },
    { id: 'yosun',      name: 'Yosun',        unlock: FREE },
    { id: 'inci',       name: 'İncili',       unlock: P(25) },
    { id: 'yildiz',     name: 'Yıldızlı',     unlock: Q('okto') },
    { id: 'mercan',     name: 'Mercan',       unlock: P(35) },
    { id: 'denizanasi', name: 'Denizanası',   unlock: ST(4) },
  ],
  makeup: [
    { id: 'yok',       name: 'Sade',         unlock: FREE },
    { id: 'allik',     name: 'Allık',        unlock: FREE },
    { id: 'dudak',     name: 'Pembe Dudak',  unlock: FREE },
    { id: 'far',       name: 'Mavi Far',     unlock: P(15) },
    { id: 'parilti',   name: 'Parıltı',      unlock: Q('dalga') },
    { id: 'kalp',      name: 'Kalpler',      unlock: P(25) },
    { id: 'yildizcil', name: 'Yıldız Çiller', unlock: P(20) },
  ],
  crown: [
    { id: 'yok',        name: 'Yok',            unlock: FREE },
    { id: 'kabuktoka',  name: 'Kabuk Toka',     unlock: FREE },
    { id: 'yildiztoka', name: 'Deniz Yıldızı',  unlock: FREE },
    { id: 'incitac',    name: 'İnci Taç',       unlock: Q('pofi') },
    { id: 'cicektac',   name: 'Çiçek Taç',      unlock: P(30) },
    { id: 'mercantac',  name: 'Mercan Taç',     unlock: P(40) },
    { id: 'denizanasi', name: 'Denizanası Şapka', unlock: ST(6) },
  ],
  necklace: [
    { id: 'yok',    name: 'Yok',          unlock: FREE },
    { id: 'inci',   name: 'İnci Kolye',   unlock: FREE },
    { id: 'kabuk',  name: 'Kabuk Kolye',  unlock: P(15) },
    { id: 'yildiz', name: 'Yıldız Kolye', unlock: P(20) },
    { id: 'kalp',   name: 'Kalp Kolye',   unlock: P(25) },
  ],
};

const DEFAULT_LOOK = {
  skin: 's1', eyes: 'turkuaz', hair: 'uzun', hairColor: 'pembe',
  tail: 'klasik', tailColor: 'sedef', top: 'kabuk', makeup: 'allik',
  crown: 'kabuktoka', necklace: 'inci',
};

// Görevler. {ad} → oyuncunun deniz kızının adı.
// x,y: şehir haritasındaki yeri (harita 2000x1000).
const QUESTS = [
  {
    id: 'pofi', npc: 'pofi', npcName: 'Balon Balığı Pofi', game: 'inciler',
    title: 'Kayıp İnciler', x: 300, y: 770,
    intro: 'Merhaba {ad}! Hapşırınca bütün incilerim saçıldı! Mercanların arasında saklandılar. Bulmama yardım eder misin?',
    again: 'Ay ay ay, yine hapşırdım! İncilerim gene kayboldu. Bir daha bulur musun?',
    outro: 'Hepsini buldun! Sen harika bir dostsun. Al, bu inci taç senin olsun!',
    reward: { cat: 'crown', id: 'incitac' }, pearls: 30,
  },
  {
    id: 'dalga', npc: 'dalga', npcName: 'Denizatı Dalga', game: 'fener',
    title: 'Mercan Feneri', x: 790, y: 790,
    intro: 'Ah {ad}, mercan fenerim fırtınada kırıldı! Şehrin bu köşesi karanlıkta kaldı. Parçaları yerine takar mısın?',
    again: 'Kocaman bir balina kuyruğunu salladı, fener yine dağıldı! Yardım eder misin?',
    outro: 'Fener yeniden parlıyor! Teşekkürler. Bu ışıltı makyajı da sana hediyem!',
    reward: { cat: 'makeup', id: 'parilti' }, pearls: 30,
  },
  {
    id: 'tosba', npc: 'tosba', npcName: 'Kaplumbağa Nine Tosba', game: 'labirent',
    title: 'Minik Eve Dönüyor', x: 1270, y: 820,
    intro: 'Canım {ad}, torunum Minik deniz yosunlarının arasında yolunu kaybetti. Onu eve getirir misin?',
    again: 'Minik yine oyuna daldı ve kayboldu! Onu bir kez daha eve getirir misin?',
    outro: 'Minik evde, kalbim rahatladı! Sana en sevdiğim örgü modelini öğreteyim.',
    reward: { cat: 'hair', id: 'orgu' }, pearls: 30,
  },
  {
    id: 'okto', npc: 'okto', npcName: 'Ahtapot Postacı Okto', game: 'mektup',
    title: 'Karışık Mektuplar', x: 1655, y: 800,
    intro: 'Selam {ad}! Sekiz kolumla bile yetişemiyorum, mektuplar karıştı! Her mektubu pulundaki resimle aynı eve götürür müsün?',
    again: 'Bugün de çok mektup var! Yine yardım eder misin?',
    outro: 'Bütün mektuplar sahibine ulaştı! Bu yıldızlı üst artık senin.',
    reward: { cat: 'top', id: 'yildiz' }, pearls: 30,
  },
  {
    id: 'kiskac', npc: 'kiskac', npcName: 'Yengeç Usta Kıskaç', game: 'hafiza',
    title: 'Mercan Bahçesi', x: 1880, y: 850,
    intro: '{ad}, bahçemdeki deniz çiçekleri eşlerini kaybettiği için solmuş. Aynı resimleri bulup eşleştirir misin?',
    again: 'Akıntı bahçemi yine karıştırdı! Eşleri bir daha bulur musun?',
    outro: 'Bahçem rengârenk açtı! Teşekkür ederim. Bu yelpaze kuyruk sana çok yakışacak.',
    reward: { cat: 'tail', id: 'yelpaze' }, pearls: 30,
  },
];
