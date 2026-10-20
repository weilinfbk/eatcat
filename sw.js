// 基础 Service Worker，用于满足 PWA 的安装条件
self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
    // 暂时留空，由浏览器处理默认网络请求
});
