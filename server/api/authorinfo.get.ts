/**
 * 搜索公众号主体信息
 */

import {proxyMpRequest} from "~/server/utils";

interface AuthorInfoQuery {
    biz: string
}

export default defineEventHandler(async (event) => {
    const {biz} = getQuery<AuthorInfoQuery>(event)

    const params: Record<string, string | number> = {
        wxtoken: '777',
        biz: biz,
        __biz: biz,
        x5: 0,
        f: 'json'
    }

    return proxyMpRequest({
        event: event,
        method: 'GET',
        endpoint: 'https://mp.weixin.qq.com/mp/authorinfo',
        query: params,
        parseJson: true,
    })
})
