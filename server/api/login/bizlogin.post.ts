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

    const response: Response = await proxyMpRequest({
        event: event,
        method: 'POST',
        endpoint: 'https://mp.weixin.qq.com/cgi-bin/bizlogin',
        query: {
            action: 'login',
        },
        body: body,
    })

    const headers = new Headers(response.headers)

    const cookies = response.headers.getSetCookie()
    const cookie = cookies.find(cookie => cookie.includes('slave_sid='))
    if (cookie) {
        const parts = cookie.split(';').map(v => v.trim())
        const expirePart = parts.find(part => part.startsWith('Expires='))
        if (expirePart) {
            const expire = expirePart.split('=')[1]
            headers.append('Set-Cookie', `token-expire=${expire};path=/`)
        }
    }

    return new Response(response.body, {headers: headers})
})
