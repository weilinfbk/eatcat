const CACHE_NAME = 'eatcat-v1';

// 需要预缓存的资源（按你项目实际路径改）
const PRECACHE = [
    './',
    './index.html',
    './manifest.json',
    './static/index.js',
    './static/index.css',
    './static/image/ClickBefore.png',
    './static/music/err.mp3',
    './static/music/end.mp3',
    './static/music/tap.mp3',
    './icon-192.jpg',
    './icon-512.jpg'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    // 只处理 GET
    if (e.request.method !== 'GET') return;

    // 外部 CDN 请求不拦截（让浏览器自己处理，避免 catch 返回 undefined 的问题）
    const url = new URL(e.request.url);
    if (url.origin !== self.location.origin) return;

    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;
            return fetch(e.request).then(res => {
                // 缓存同源成功响应
                if (res && res.status === 200) {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
                }
                return res;
            }).catch(() => {
                // 真离线兜底：返回一个空 503，而不是 undefined
                return new Response('Offline', { status: 503, statusText: 'Offline' });
            });
        })
    );
});
