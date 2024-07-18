import {proxyMpRequest} from "~/server/utils";

interface ArticleQuery {
    url: string
}

export default defineEventHandler(async (event) => {
    const query = getQuery<ArticleQuery>(event)

    const response: Response = await proxyMpRequest({
        event: event,
        method: 'GET',
        endpoint: query.url,
    })
    if (response.status === 200) {
        await sendRedirect(event, '/login', 302)
    } else {
        return {
            statusCode: response.status,
            statusText: response.statusText,
        }
    }
})
