/**
 * 搜索公众号接口
 */

import {proxyMpRequest} from "~/server/utils";
import {getBizEntry} from "~/server/kv/biz";

interface SearchBizQuery {
    begin?: number
    size?: number
    keyword: string
    token: string
}

export default defineEventHandler(async (event) => {
    const query = getQuery<SearchBizQuery>(event)
    const keyword = query.keyword
    const token = query.token
    const begin: number = query.begin || 0
    const size: number = query.size || 5

    if (/^[a-z0-9]+==$/i.test(keyword)) {
        // 直接输入的bizNo, 检查kv数据
        const bizEntry = await getBizEntry(keyword)
        if (bizEntry) {
            return {
                base_resp: {
                    ret: 0,
                    err_msg: 'ok'
                },
                list: [bizEntry],
                total: 1,
            }
        }
    }

    const params: Record<string, string | number> = {
        action: 'search_biz',
        begin: begin,
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
