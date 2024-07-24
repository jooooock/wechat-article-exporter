/**
 * 获取文章 html 内容接口
 */

interface DownloadQuery {
    url: string
}

export default defineEventHandler(async (event) => {
    const query = getQuery<DownloadQuery>(event)

    let html: string = await proxyMpRequest({
        event: event,
        endpoint: query.url,
        method: 'GET'
    }).then(resp => resp.text())

    // 处理 img data-src
    html = html.replaceAll(/(<img[^>]+?)data-src="((https?|\/\/)[^"]+)"/gs, (match, p1, p2) => {
        return `${p1}src="${proxyImage(p2)}"`
    });
    // 处理 background url
    html = html.replaceAll(/((?:background|background-image): url\((?:&quot;)?)((?:https?|\/\/)[^)]+?)((?:&quot;)?\))/gs, (match, p1, p2, p3) => {
        return `${p1}${proxyImage(p2)}${p3}`
    })

    return html
})

function proxyImage(url: string) {
    return `https://service.champ.design/api/proxy?url=${encodeURIComponent(url)}`
}

const isDev = process.env.NODE_ENV === "development";
async function render(html: string) {
    let browser = isDev ? await launchBrowserLocal() : await launchBrowserRemote();
    const page = await browser.newPage();
    await page.setViewport({width: 1080, height: 1024});
    await page.setContent(html, {
        waitUntil: 'load',
    })
    await autoScroll(page);

    const fileElement = await page.waitForSelector('#page-content');
    const screenshot = await fileElement!.screenshot({
        encoding: 'base64',
    });
    await browser.close();
    return screenshot;
}

async function autoScroll(page: any){
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                // @ts-ignore
                var scrollHeight = document.body.scrollHeight;
                // @ts-ignore
                window.scrollBy(0, distance);
                totalHeight += distance;

                // @ts-ignore
                if(totalHeight >= scrollHeight - window.innerHeight){
                    clearInterval(timer);
                    resolve(true);
                }
            }, 100);
        });
    });
}
