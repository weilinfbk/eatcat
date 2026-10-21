const CACHE_NAME = 'eatcat-v2';
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

// 安装时，强制跳过等待，立即激活
self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
    );
});

// 激活时，清理所有旧版本的缓存
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// 拦截请求：网络优先（Network First）
self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    
    // 外部 CDN 请求直接放行
    const url = new URL(e.request.url);
    if (url.origin !== self.location.origin) return;

    e.respondWith(
        fetch(e.request)
            .then(res => {
                // 如果网络请求成功，把最新的文件偷偷更新到缓存里
                if (res && res.status === 200) {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                }
                return res;
            })
            .catch(() => {
                // 只有在断网时，才去缓存里找
                return caches.match(e.request).then(cached => {
                    return cached || new Response('Offline', { status: 503 });
                });
            })
    );
});
