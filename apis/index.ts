interface AuthorInfoResponse {
    base_resp: {ret: number}
    identity_name: string
    is_verify: number
    original_article_count: number
}

export async function authorInfo(biz: string) {
    return await $fetch<AuthorInfoResponse>('/api/authorinfo', {
        method: 'GET',
        query: {
            biz: biz,
        }
    })
}
