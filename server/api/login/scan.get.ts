import {proxyMpRequest} from "~/server/utils";

export default defineEventHandler(async (event) => {
    return proxyMpRequest({
        event: event,
        method: 'GET',
        endpoint: 'https://mp.weixin.qq.com/cgi-bin/scanloginqrcode',
        query: {
            action: 'ask',
            token: '',
            lang: 'zh_CN',
            f: 'json',
            ajax: 1,
        },
    })
})
