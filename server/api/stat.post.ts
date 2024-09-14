import {formatTraffic} from "~/server/utils";

/**
 * 统计代理使用情况
 */
interface ProxyInstance {
    // 代理地址
    address: string

    // 是否正在被使用
    busy: boolean

    // 是否处于冷静期
    cooldown: boolean

    // 使用次数
    usageCount: number

    // 成功次数
    successCount: number

    // 失败次数
    failureCount: number

    // 下载流量
    traffic: number
}

interface ProxyUsageReport {
    fakeId: string
    nickname: string
    account: string
    proxies: ProxyInstance[]
}

export default defineEventHandler(async (event) => {
    const body = await readBody<ProxyUsageReport>(event)

    let totalCount = 0
    let totalTraffic = 0
    for (const proxy of body.proxies) {
        totalCount += proxy.usageCount
        totalTraffic += proxy.traffic
    }

    console.log(
        `%c${body.account}%c use %c${totalCount}%c proxy, total traffic is %c${formatTraffic(totalTraffic)}%c`,
        "color: green; font-weight: bold;",
        "color: black; font-weight: normal;",
        "color: red; font-weight: bold;",
        "color: black; font-weight: normal;",
        "color: red; font-weight: bold;",
        "color: black; font-weight: normal;",
    )

    const kv = await useKv()
    const op = kv.atomic()
    op.set(['proxy', body.account, body.nickname, Date.now()], body)
    await op.commit()
    kv.close()
})
