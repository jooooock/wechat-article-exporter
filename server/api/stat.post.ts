import {formatTraffic} from "~/server/utils";
import {logUsage, updateUsage} from "~/server/kv/usage";
import {getUserByUUID} from "~/server/kv/user"
import {parseCookies} from "h3";


/**
 * 统计代理使用情况
 */
interface ProxyInstance {
    // 代理地址
    address: string;

    // 是否正在被使用
    busy: boolean;

    // 是否处于冷静期
    cooldown: boolean;

    // 使用次数
    usageCount: number;

    // 成功次数
    successCount: number;

    // 失败次数
    failureCount: number;

    // 下载流量
    traffic: number;
}

interface ProxyUsageReport {
    uuid: string;
    proxies: ProxyInstance[];
}

export default defineEventHandler(async (event) => {
    const body = await readBody<ProxyUsageReport>(event);

    let totalCount = 0;
    let successCount = 0;
    let failureCount = 0;
    let totalTraffic = 0;
    for (const proxy of body.proxies) {
        totalCount += proxy.usageCount;
        successCount += proxy.successCount;
        failureCount += proxy.failureCount;
        totalTraffic += proxy.traffic;
    }

    console.log(
        `%c${body.uuid}%c use %c${totalCount}%c proxy, total traffic is %c${
            formatTraffic(totalTraffic)
        }%c`,
        "color: green; font-weight: bold;",
        "color: black; font-weight: normal;",
        "color: red; font-weight: bold;",
        "color: black; font-weight: normal;",
        "color: red; font-weight: bold;",
        "color: black; font-weight: normal;",
    );

    // 检查 uuid 是否合法
    if (await getUserByUUID(body.uuid)) {
        await updateUsage({
            uuid: body.uuid,
            usageCount: totalCount,
            successCount: successCount,
            failureCount: failureCount,
            traffic: totalTraffic,
            time: Date.now(),
        })
    } else {
        // 遗留数据格式
        const cookies = parseCookies(event)
        await logUsage(body.uuid, cookies['slave_user'], body.proxies)
    }
});
