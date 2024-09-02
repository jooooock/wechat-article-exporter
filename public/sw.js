const domains = [
    'mmbiz.qpic.cn',
    'mmbiz.qlogo.cn',
    'wx.qlogo.cn',
]

self.addEventListener('fetch', function (event) {
    const url = new URL(event.request.url)
    if (domains.includes(url.host)) {
        event.respondWith(
            fetch(url.href, {
                referrer: "",
                mode: 'no-cors'
            })
        );
    }
});
