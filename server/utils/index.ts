import {H3Event, parseCookies} from "h3";

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
    event: H3Event
    endpoint: string
    method: Method
    query?: Record<string, string | number>
    body?: Record<string, string | number>
    parseJson?: boolean
}

export function proxyMpRequest(options: RequestOptions) {
    const cookies = parseCookies(options.event)
    const cookie = Object.keys(cookies).map(key => `${key}=${cookies[key]}`).join(';')

    const fetchInit: RequestInit = {
        method: options.method,
        headers: {
            Referer: 'https://mp.weixin.qq.com/',
            Cookie: cookie,
        },
    }

    if (options.query) {
        options.endpoint += '?' + new URLSearchParams(options.query as Record<string, string>).toString()
    }
    if (options.method === 'POST' && options.body) {
        fetchInit.body = new URLSearchParams(options.body as Record<string, string>).toString()
    }

    const response = fetch(options.endpoint, fetchInit)
    if (!options.parseJson) {
        return response
    } else {
        return response.then(resp => resp.json())
    }
}
