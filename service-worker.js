const CACHE_NAME = "self-eval-cache-v1";

const ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

// 安装 SW → 缓存文件
self.addEventListener("install", (event) => {
    console.log("Service Worker 安装完成");
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

// 激活 SW
self.addEventListener("activate", (event) => {
    console.log("Service Worker 已激活");
});

// 捕获请求 → 优先从缓存取
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then(res => {
            return res || fetch(event.request);
        })
    );
});
