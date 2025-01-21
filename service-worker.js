// service-worker.js

const CACHE_NAME = 'n-pontes-locacoes-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  // Adicione outros assets que deseja cachear, como ícones, imagens, etc.
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cacheando assets estáticos');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker ativado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Interceptar requisições e servir do cache
self.addEventListener('fetch', (event) => {
  console.log('Requisição interceptada:', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('Servindo do cache:', event.request.url);
          return response;
        }
        console.log('Buscando da rede:', event.request.url);
        return fetch(event.request);
      })
  );
});