const CACHE = 'church-app-v1';
const ASSETS = ['/', '/_expo/static/js/web/entry.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then((r) => {
      const clone = r.clone();
      if (r.ok && e.request.url.startsWith(self.location.origin)) {
        caches.open(CACHE).then((c) => c.put(e.request, clone));
      }
      return r;
    }).catch(() => caches.match(e.request))
  );
});
