import {useKv} from "~/server/utils/kv";

export interface BizEntry {
    alias: string
    fakeid: string
    nickname: string
    round_head_img: string
    service_type: number
    signature: string
}


export async function getBizEntry(fakeid: string): Promise<BizEntry | null> {
    const kv = await useKv()
    const {value: bizEntry} = await kv.get(["biz", fakeid])
    kv.close()
    return bizEntry
}
