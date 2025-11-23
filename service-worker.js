self.addEventListener("install", (event) => {
    console.log("Service Worker 安装完成");
});

self.addEventListener("activate", (event) => {
    console.log("Service Worker 已激活");
});

self.addEventListener("fetch", (event) => {});
