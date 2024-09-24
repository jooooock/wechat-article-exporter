import {useKv} from "~/server/utils/kv";


export interface UsageEntry {
    uuid: string
    usageCount: number
    successCount: number
    failureCount: number
    traffic: number
    time: number
}

export async function updateUsage(usage: UsageEntry): Promise<void> {
    const kv = await useKv();
    const res = await kv.atomic()
        .set(["usage", usage.uuid, usage.time], usage)
        .commit();
    if (!res.ok) {
        console.warn('统计数据写入失败')
    }
    kv.close();
}

export async function logUsage(uuid: string, originalID: string, usage: any) {
    const kv = await useKv();
    kv.set(['old', uuid, originalID, Date.now()], usage)
    kv.close()
}
