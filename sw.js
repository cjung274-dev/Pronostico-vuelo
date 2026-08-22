// Sentinel Air — service worker
//
// Sube el número de versión cada vez que actualices index.html.
// Al cambiar, el navegador descarta la caché anterior y toma la versión nueva.
const VERSION = 'sentinel-air-v11';

// Archivos propios: si alguno falla, la instalación entera falla.
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

// Dependencias externas necesarias para que la app funcione completa sin señal:
// html2canvas es lo que genera los PNG de la bitácora, y las fuentes evitan que
// el reporte exportado en terreno salga con tipografía de sistema.
// Se cachean "best effort": si una falla, la app se instala igual.
const VENDOR = [
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=Audiowide&display=swap'
];

// Instalar: guardar los archivos base y activar de inmediato, sin esperar
// a que se cierren las pestañas abiertas.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION)
      .then(async cache => {
        await cache.addAll(CORE); // obligatorios
        await Promise.allSettled(VENDOR.map(u => cache.add(u))); // opcionales
      })
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

// Orígenes de recursos estáticos que sí conviene servir desde caché:
// cambian de forma muy infrecuente y son necesarios para exportar sin señal.
const STATIC_HOSTS = [
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;

  const url = new URL(req.url);

  if(url.origin !== self.location.origin){
    if(STATIC_HOSTS.includes(url.hostname)){
      // Librerías y fuentes: cache-first. Versionadas en la URL, así que un
      // recurso cacheado nunca queda "viejo" en el sentido que importe.
      event.respondWith(
        caches.match(req).then(cached => {
          if(cached) return cached;
          return fetch(req).then(res => {
            if(res.ok || res.type === 'opaque'){
              const copy = res.clone();
              caches.open(VERSION).then(c => c.put(req, copy));
            }
            return res;
          }).catch(() => new Response('', {status: 504, statusText: 'Sin conexión'}));
        })
      );
      return;
    }
    // Las APIs de clima, Kp y geocodificación nunca se cachean: un dato viejo
    // en una evaluación de vuelo es peor que no tener dato. La app maneja el
    // fallo y muestra su propio caché, claramente marcado como antiguo.
    event.respondWith(fetch(req));
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
