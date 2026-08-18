// Service worker mínimo: solo habilita la instalación como PWA.
// No cachea datos meteorológicos — esos siempre deben pedirse en vivo.
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());
self.addEventListener('fetch', e => {
  // pasa todas las peticiones directo a la red, sin interceptar
  return;
});
