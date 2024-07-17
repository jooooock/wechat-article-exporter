import {parseCookies, H3Event} from 'h3'

export default defineEventHandler(async (event: H3Event) => {
    const cookies = parseCookies(event)
    const cookie = Object.keys(cookies).map(key => `${key}=${cookies[key]}`).join(';')
    return fetch('https://mp.weixin.qq.com/cgi-bin/scanloginqrcode?action=ask&token=&lang=zh_CN&f=json&ajax=1', {
        method: 'GET',
        headers: {
            Referer: 'https://mp.weixin.qq.com/',
            Cookie: cookie,
        }
    })
})
