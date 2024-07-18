import {proxyMpRequest} from "~/server/utils";

export default defineEventHandler(async (event) => {
    const {sessionid} = event.context.params!

    const body: Record<string, string | number> = {
        userlang: 'zh_CN',
        redirect_url: '',
        login_type: 3,
        sessionid: sessionid,
        token: '',
        lang: 'zh_CN',
        f: 'json',
        ajax: 1,
    }

    return proxyMpRequest({
        event: event,
        method: 'POST',
        endpoint: 'https://mp.weixin.qq.com/cgi-bin/bizlogin',
        query: {
            action: 'startlogin',
        },
        body: body,
    })
})
