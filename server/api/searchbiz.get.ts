/**
 * 搜索公众号接口
 */

import {proxyMpRequest} from "~/server/utils";

interface SearchBizQuery {
    page?: number
    size?: number
    keyword: string
    token: string
}

export default defineEventHandler(async (event) => {
    const query = getQuery<SearchBizQuery>(event)
    const keyword = query.keyword
    const token = query.token
    const page: number = query.page || 1
    const size: number = query.size || 5
    const begin = (page - 1) * size

    const params: Record<string, string | number> = {
        action: 'search_biz',
        begin: begin.toString(),
        count: size,
        query: keyword,
        token: token,
        lang: 'zh_CN',
        f: 'json',
        ajax: '1',
    }

    return proxyMpRequest({
        event: event,
        method: 'GET',
        endpoint: 'https://mp.weixin.qq.com/cgi-bin/searchbiz',
        query: params,
        parseJson: true,
    })
})
