// Çevrimdışı oynamak için basit önbellek.
// Önce ağdan dener (güncel kalır), ağ yoksa önbellekten açar.
const CACHE = 'mercan-sehri-v1';
const FILES = [
  './', 'index.html', 'css/style.css', 'manifest.webmanifest',
  'js/data.js', 'js/avatar.js', 'js/scene.js', 'js/games.js', 'js/app.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
