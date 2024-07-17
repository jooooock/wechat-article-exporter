import {parseCookies, H3Event} from 'h3'

export default defineEventHandler(async (event: H3Event) => {
    const cookies = parseCookies(event)
    const cookie = Object.keys(cookies).map(key => `${key}=${cookies[key]}`).join(';')

    const body: Record<string, string> = {
        userlang: 'zh_CN',
        redirect_url: '',
        cookie_forbidden: '0',
        cookie_cleaned: '0',
        plugin_used: '0',
        login_type: '3',
        token: '',
        lang: 'zh_CN',
        f: 'json',
        ajax: '1',
    }

    return fetch('https://mp.weixin.qq.com/cgi-bin/bizlogin?action=login', {
        method: 'POST',
        body: new URLSearchParams(body).toString(),
        headers: {
            Referer: 'https://mp.weixin.qq.com/',
            Cookie: cookie,
        }
    })
})
