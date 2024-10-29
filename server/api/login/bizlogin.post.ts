import {proxyMpRequest} from "~/server/utils";
import {createUser, getUser, type UserEntry} from "~/server/kv/user";


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


    const cookies = response.headers.getSetCookie()
    const parsedCookies = parseCookies(cookies)

    const _body = await response.json()
    const _token = new URL(`http://localhost${_body.redirect_url}`).searchParams.get('token')
    const _cookie: string[] = []
    Object.keys(parsedCookies).forEach(key => {
        _cookie.push(key + '=' + parsedCookies[key].value)
    })
    const {nick_name, head_img} = await $fetch(`/api/login/info?token=${_token}`, {
        headers: {
            Cookie: _cookie.join(';')
        }
    })
    if (!nick_name) {
        // 登录的非公众号
        return {
            err: '请选择公众号登录'
        }
    }

    const searchResult = await $fetch(`/api/searchbiz?token=${_token}&keyword=${nick_name}`, {
        headers: {
            Cookie: _cookie.join(';')
        }
    })
    let _fakeid = ''
    let _avatar = head_img
    if (searchResult && searchResult.base_resp && searchResult.base_resp.ret === 0) {
        const account = searchResult.list.find((account: any) => account.nickname === nick_name)
        if (account) {
            _fakeid = account.fakeid
            _avatar = account.round_head_img
        }
    }

    const slave_user_cookie = parsedCookies['slave_user']
    if (!slave_user_cookie) {
        return {
            err: '登录失败，请稍后重试'
        }
    }

    let user: UserEntry | null = await getUser(slave_user_cookie.value)
    if (!user) {
        // 创建用户
        user = {
            uuid: crypto.randomUUID(),
            fakeid: _fakeid,
            originalID: slave_user_cookie.value,
            nickname: nick_name,
            avatar: _avatar,
            createdAt: Date.now(),
        }
        if (await createUser(user)) {
            console.log(`新用户(${user.nickname}:${user.uuid})创建成功`)
        } else {
            console.warn(`新用户(${user.nickname}:${user.uuid})创建失败`)
        }
    }

    const newBody = JSON.stringify({
        uuid: user.uuid,
        nickname: user.nickname,
        avatar: user.avatar,
        fakeid: user.fakeid,
        token: _token,
        expires: slave_user_cookie.expires,
    })

    const headers = new Headers(response.headers)
    headers.set('Content-Length', new TextEncoder().encode(newBody).length.toString())
    return new Response(newBody, {headers: headers})
})

interface CookieItem {
    name: string
    value: string
    path: string
    expires: string
    secure: boolean
    httpOnly: boolean
}

function parseCookies (cookies: string[]): Record<string, CookieItem> {
    const result: Record<string, CookieItem> = {}
    cookies.forEach(cookie => {
        const parts = cookie.split(';').map(v => v.trim())
        const [name, value] = parts[0].split('=')
        const other = parts.slice(1).map(v => v.toLowerCase())

        const pathPart = other.find(part => part.startsWith('path='))
        const expirePart = other.find(part => part.startsWith('expires='))
        result[name] = {
            name: name,
            value: value,
            path: pathPart?.split('=')[1] || '/',
            expires: expirePart?.split('=')[1] || '',
            secure: other.includes('secure'),
            httpOnly: other.includes('httponly'),
        }
    })
    return result
}
