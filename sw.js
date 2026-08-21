// Sentinel Air — service worker
//
// Sube el número de versión cada vez que actualices index.html.
// Al cambiar, el navegador descarta la caché anterior y toma la versión nueva.
const VERSION = 'sentinel-air-v5';

const CORE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

// Instalar: guardar los archivos base y activar de inmediato, sin esperar
// a que se cierren las pestañas abiertas.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

// Activar: borrar cachés de versiones anteriores y tomar control de las
// pestañas ya abiertas.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;

  const url = new URL(req.url);

  // Las APIs de clima, Kp y geocodificación nunca se cachean: un dato viejo
  // en una evaluación de vuelo es peor que no tener dato.
  if(url.origin !== self.location.origin){
    event.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }

  const isDoc = req.mode === 'navigate'
    || (req.headers.get('accept') || '').includes('text/html');

  if(isDoc){
    // network-first para el HTML: si hay señal, siempre la versión más nueva.
    // Sin señal, la última guardada — la app sigue abriendo en terreno.
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // El resto (icono, manifest): cache-first, cambian poco.
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(req, copy));
      return res;
    }))
  );
});
