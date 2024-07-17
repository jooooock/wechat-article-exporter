import {parseCookies, H3Event} from 'h3'

interface SearchBizQuery {
    page?: string
    size?: string
    keyword: string
    token: string
}

export default defineEventHandler(async (event: H3Event) => {
    const cookies = parseCookies(event)
    const cookie = Object.keys(cookies).map(key => `${key}=${cookies[key]}`).join(';')

    const query = getQuery<SearchBizQuery>(event)
    const keyword = query.keyword
    const token = query.token
    const page: string = query.page || '1'
    const size: string = query.size || '5'
    const begin = (parseInt(page) - 1) * parseInt(size)

    const params: Record<string, string> = {
        action: 'search_biz',
        begin: begin.toString(),
        count: size,
        query: keyword,
        token: token,
        lang: 'zh_CN',
        f: 'json',
        ajax: '1',
    }

    return fetch(`https://mp.weixin.qq.com/cgi-bin/searchbiz?${new URLSearchParams(params).toString()}`, {
        method: 'GET',
        headers: {
            Referer: 'https://mp.weixin.qq.com/',
            Cookie: cookie,
        },
    }).then(resp => resp.json())
})
