self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
    // 处理网络请求，防止页面资源加载失败
    e.respondWith(fetch(e.request).catch(() => {
        // 失败时的静默处理
    }));
});
