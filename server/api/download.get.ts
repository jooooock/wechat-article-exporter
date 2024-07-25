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
