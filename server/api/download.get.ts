/**
 * 获取文章 html 内容接口
 */
import {proxyMpRequest} from "~/server/utils";

interface DownloadQuery {
    url: string
}

export default defineEventHandler(async (event) => {
    const query = getQuery<DownloadQuery>(event)

    return await proxyMpRequest({
        event: event,
        endpoint: query.url,
        method: 'GET',
        withCredentials: false,
    }).then(resp => resp.text())
})
