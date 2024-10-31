import type {
    AccountInfo,
    AppMsgEx,
    AppMsgPublishResponse,
    PublishInfo,
    PublishPage,
    SearchBizResponse
} from "~/types/types";
import {ACCOUNT_LIST_PAGE_SIZE, ARTICLE_LIST_PAGE_SIZE} from "~/config";
import {updateAPICache} from "~/store/api";
import {updateArticleCache} from "~/store/article";
import type {CommentResponse} from "~/types/comment";

interface AuthorInfoResponse {
    base_resp: {ret: number}
    identity_name: string
    is_verify: number
    original_article_count: number
}

const loginAccount = useLoginAccount()

/**
 * 获取公众号主体信息
 * @param biz
 */
export async function authorInfo(biz: string) {
    return await $fetch<AuthorInfoResponse>('/api/authorinfo', {
        method: 'GET',
        query: {
            biz: biz,
        }
    })
}

/**
 * 获取文章列表
 * @param fakeid
 * @param token
 * @param begin
 * @param keyword
 */
export async function getArticleList(fakeid: string, token: string, begin = 0, keyword = ''): Promise<[AppMsgEx[], boolean, number]> {
    const resp = await $fetch<AppMsgPublishResponse>('/api/appmsgpublish', {
        method: 'GET',
        query: {
            id: fakeid,
            token: token,
            begin: begin,
            size: ARTICLE_LIST_PAGE_SIZE,
            keyword: keyword,
        },
        retry: 0,
    })

    // 记录 api 调用
    await updateAPICache({
        name: 'appmsgpublish',
        account: loginAccount.value.nickname!,
        call_time: new Date().getTime(),
        is_normal: resp.base_resp.ret === 0 || resp.base_resp.ret === 200003,
        payload: {
            id: fakeid,
            begin: begin,
            size: ARTICLE_LIST_PAGE_SIZE,
            keyword: keyword,
        }
    })

    if (resp.base_resp.ret === 0) {
        const publish_page: PublishPage = JSON.parse(resp.publish_page)
        const publish_list = publish_page.publish_list.filter(item => !!item.publish_info)

        // 返回的文章数量与请求的文章数量不一致就说明已结束
        const isCompleted = publish_list.length === 0

        // 更新缓存，注意搜索的结果不能写入缓存
        if (!keyword) {
            try {
                await updateArticleCache(publish_list, isCompleted, fakeid)
            } catch (e) {
                console.info('缓存失败')
                console.error(e)
            }
        }

        const articles = publish_list.flatMap(item => {
            const publish_info: PublishInfo = JSON.parse(item.publish_info)
            return publish_info.appmsgex
        })
        return [articles, isCompleted, publish_page.total_count]
    } else if (resp.base_resp.ret === 200003) {
        throw new Error('session expired')
    } else {
        throw new Error(`${resp.base_resp.ret}:${resp.base_resp.err_msg}`)
    }
}

/**
 * 获取公众号列表
 * @param token
 * @param begin
 * @param keyword
 */
export async function getAccountList(token: string, begin = 0, keyword = ''): Promise<[AccountInfo[], boolean]> {
    const resp = await $fetch<SearchBizResponse>('/api/searchbiz', {
        method: 'GET',
        query: {
            keyword: keyword,
            begin: begin,
            size: ACCOUNT_LIST_PAGE_SIZE,
            token: token,
        },
        retry: 0,
    })

    // 记录 api 调用
    await updateAPICache({
        name: 'searchbiz',
        account: loginAccount.value.nickname!,
        call_time: new Date().getTime(),
        is_normal: resp.base_resp.ret === 0 || resp.base_resp.ret === 200003,
        payload: {
            begin: begin,
            size: ACCOUNT_LIST_PAGE_SIZE,
            keyword: keyword,
        }
    })

    if (resp.base_resp.ret === 0) {
        // 公众号判断是否结束的逻辑与文章不太一样
        // 当第一页的结果就少于5个则结束，否则只有当搜索结果为空才表示结束
        const isCompleted = begin === 0 ? resp.total < ACCOUNT_LIST_PAGE_SIZE : resp.total === 0

        return [resp.list, isCompleted]
    } else if (resp.base_resp.ret === 200003) {
        throw new Error('session expired')
    } else {
        throw new Error(`${resp.base_resp.ret}:${resp.base_resp.err_msg}`)
    }
}

/**
 * 获取评论
 * @param commentId
 */
export async function getComment(commentId: string) {
    try {
        // 本地设置的 credentials
        const credentials = JSON.parse(window.localStorage.getItem('credentials')!)
        if (!credentials || !credentials.__biz || !credentials.pass_ticket || !credentials.key || !credentials.uin) {
            console.log('credentials not set')
            return null
        }
        const response = await $fetch<CommentResponse>('/api/comment', {
            method: 'get',
            query: {
                comment_id: commentId,
                ...credentials,
            },
            retry: 0,
        })
        if (response.base_resp.ret === 0) {
            return response
        } else {
            return null
        }
    } catch (e) {
        console.warn('credentials parse error', e)
        return null
    }
}
