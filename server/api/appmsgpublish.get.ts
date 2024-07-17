import {parseCookies, H3Event} from 'h3'

interface AppMsgPublishQuery {
    page?: string
    size?: string
    id: string
    keyword: string
    token: string
}

export default defineEventHandler(async (event: H3Event) => {
    const cookies = parseCookies(event)
    const cookie = Object.keys(cookies).map(key => `${key}=${cookies[key]}`).join(';')

    const query = getQuery<AppMsgPublishQuery>(event)
    const id = query.id
    const keyword = query.keyword
    const token = query.token
    const page: string = query.page || '1'
    const size: string = query.size || '5'
    const begin = (parseInt(page) - 1) * parseInt(size)

    const isSearching = !!keyword

    const params: Record<string, string> = {
        sub: isSearching ? "search" : "list",
        search_field: isSearching ? "7" : "null",
        begin: begin.toString(),
        count: size,
        query: keyword,
        fakeid: id,
        type: "101_1",
        free_publish_type: '1',
        sub_action: "list_ex",
        token: token,
        lang: "zh_CN",
        f: "json",
        ajax: '1',
    }
    return fetch(`https://mp.weixin.qq.com/cgi-bin/appmsgpublish?${new URLSearchParams(params).toString()}`, {
        method: 'GET',
        headers: {
            Referer: 'https://mp.weixin.qq.com/',
            Cookie: cookie,
        },
    }).then(resp => resp.json())
})
