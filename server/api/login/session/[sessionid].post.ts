import {parseCookies} from "h3";

export default defineEventHandler(async (event) => {
    const {sessionid} = event.context.params!
    const cookies = parseCookies(event)
    const cookie = Object.keys(cookies).map(key => `${key}=${cookies[key]}`).join(';')

    const body: Record<string, string> = {
        userlang: 'zh_CN',
        redirect_url: '',
        login_type: '3',
        sessionid: sessionid,
        token: '',
        lang: 'zh_CN',
        f: 'json',
        ajax: '1',
    }

    return fetch('https://mp.weixin.qq.com/cgi-bin/bizlogin?action=startlogin', {
        method: 'POST',
        body: new URLSearchParams(body).toString(),
        headers: {
            Referer: 'https://mp.weixin.qq.com/',
            Cookie: cookie,
        }
    }).catch(e => {
        console.log(e)
    })
})
