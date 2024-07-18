const SCAN_LOGIN_TYPE = {
    0: '等待扫码',
    1: '扫码成功，可登录账号=1',
    2: '扫码成功，可登录账号>1',
    3: '没有可登录账号',
    4: '登录失败',
    5: '二维码已过期',
    6: '二维码加载失败',
    7: 'qq号需要绑定邮箱',
}


export interface BaseResp {
    err_msg: string
    ret: number
}

export interface StartLoginResult {
    base_resp: BaseResp
}

export interface ScanLoginResult {
    base_resp: BaseResp
    status: number
    acct_size: number
    binduin: string
}

export interface BizLoginResult {
    base_resp: BaseResp
    redirect_url: string
}

export interface AccountInfo {
    alias: string
    fakeid: string
    nickname: string
    round_head_img: string
    service_type: number
    signature: string
}

export interface SearchBizResponse {
    base_resp: BaseResp
    list: AccountInfo[]
    total: number
}

export interface AppMsgPublishResponse {
    base_resp: BaseResp
    publish_page: string
}

export interface PublishListItem {
    publish_type: number
    publish_info: string
}

export interface PublishPage {
    featured_count: number
    masssend_count: number
    publish_count: number
    publish_list: PublishListItem[]
    total_count: number
}

export interface PublishInfo {
    type: number
    new_publish: number
    msgid: number
    copy_type: number
    copy_appmsg_id: number
    sent_info: ArticleSentInfo
    sent_result: ArticleSentResult
    sent_status: ArticleSentStatus
    appmsg_info: AppMsgInfo[]
    appmsgex: AppMsgEx[]
}

export interface ArticleSentInfo {
    func_flag: number
    is_published: number
    is_send_all: boolean
    time: number
}

export interface ArticleSentResult {
    msg_status: number
    refuse_reason: string
    update_time: number
    reject_index_list: any[]
}

export interface ArticleSentStatus {
    fail: number
    progress: number
    succ: number
    total: number
    userprotect: number
}

export interface AppMsgInfo {
    appmsg_like_type: number
    appmsgid: number
    is_from_transfer: number
    is_pay_subscribe: number
    itemidx: number
    open_fansmsg: number
    share_type: number
    smart_product: number
}

export interface AppMsgEx {
    aid: string
    album_id: string
    appmsgid: number
    author_name: number
    ban_flag: number
    checking: number
    copyright_stat: number
    copyright_type: number
    cover: string
    cover_img: string
    create_time: number
    digest: string
    has_red_packet_cover: number
    is_deleted: boolean
    is_pay_subscribe: number
    item_show_type: number
    itemidx: number
    link: string
    media_duration: string
    mediaapi_publish_status: number
    pic_cdn_url_1_1: string
    pic_cdn_url_3_4: string
    pic_cdn_url_16_9: string
    pic_cdn_url_235_1: string
    title: string
    update_time: number
}
