import {proxyMpRequest} from "~/server/utils";

export default defineEventHandler(async (event) => {
    const body: Record<string, string | number> = {
        userlang: 'zh_CN',
        redirect_url: '',
        cookie_forbidden: 0,
        cookie_cleaned: 0,
        plugin_used: 0,
        login_type: 3,
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
            action: 'login',
        },
        body: body,
    })
})
