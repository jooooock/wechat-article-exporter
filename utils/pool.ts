import {sleep} from "@antfu/utils";
import dayjs from "dayjs";
import {AVAILABLE_PROXY_LIST} from '~/config'

interface ProxyInstance {
    address: string
    busy: boolean
    cooldown: boolean
    usageCount: number
    successCount: number
    failureCount: number
}

type DownloadFn<T> = (url: T, proxy: string) => Promise<void>

export interface DownloadResult {
    // 总耗时 (s)
    totalTime: number

    // 是否成功
    success: boolean

    // 重试次数
    attempts: number
}

function now() {
    return dayjs(new Date()).format("HH:mm:ss.SSS")
}

class ProxyPool {
    proxies: ProxyInstance[] = []

    constructor(proxyUrls: string[]) {
        this.proxies = proxyUrls.map(url => ({
            address: url,
            busy: false,
            cooldown: false,
            usageCount: 0,
            successCount: 0,
            failureCount: 0,
        }));
    }

    async getAvailableProxy() {
        while (true) {
            for (const proxy of this.proxies) {
                if (!proxy.busy && !proxy.cooldown) {
                    proxy.busy = true
                    proxy.usageCount++
                    return proxy
                }
            }
            // 如果没有可用代理，稍微等待一下
            await sleep(100)
        }
    }

    releaseProxy(proxy: ProxyInstance, success: boolean) {
        proxy.busy = false

        if (success) {
            proxy.successCount++
        } else {
            proxy.failureCount++
            proxy.cooldown = true

            // 2秒冷却时间
            setTimeout(() => {
                proxy.cooldown = false;
            }, 2000);
        }
    }

    printProxyUsage() {
        console.debug('代理使用情况:')
        const usageData = this.proxies.map(proxy => ({
            '代理': proxy.address,
            '使用次数': proxy.usageCount,
            '成功次数': proxy.successCount,
            '失败次数': proxy.failureCount,
            '成功率': proxy.usageCount === 0 ? '-' : ((proxy.successCount / proxy.usageCount) * 100).toFixed(2) + '%',
        }));
        console.table(usageData);
    }
}

/**
 * 使用代理 proxy 下载资源
 * @param proxy
 * @param url
 * @param downloadFn
 */
async function downloadResource<T>(proxy: ProxyInstance, url: T, downloadFn: DownloadFn<T>) {
    try {
        // 执行下载任务
        await downloadFn(url, proxy.address)
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * 使用代理池下载资源
 * @param pool
 * @param url
 * @param downloadFn
 * @param maxRetries
 */
async function downloadWithRetry<T>(pool: ProxyPool, url: T, downloadFn: DownloadFn<T>, maxRetries = 3): Promise<DownloadResult> {
    let attempts = 0;
    let isSuccess = false;

    const startTime = Date.now()

    while (attempts < maxRetries) {
        const proxy = await pool.getAvailableProxy();
        const success = await downloadResource<T>(proxy, url, downloadFn);
        pool.releaseProxy(proxy, success);

        if (success) {
            isSuccess = true
            break
        } else {
            attempts++;
            await sleep(200)
            console.log(`[${now()}] Retrying ${url} (attempt ${attempts}/${maxRetries})`);
        }
    }

    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;

    if (!isSuccess) {
        console.warn(`[${now()}] Failed to download ${url} after ${maxRetries} attempts`);
    }
    return {
        totalTime,
        success: isSuccess,
        attempts,
    }
}


const pool = new ProxyPool(AVAILABLE_PROXY_LIST);

/**
 * 使用代理池下载单个资源
 * @param url
 * @param downloadFn
 */
export async function download<T>(url: T, downloadFn: DownloadFn<T>) {
    return await downloadWithRetry<T>(pool, url, downloadFn)
}

/**
 * 使用代理池下载多个资源
 * @param urls
 * @param downloadFn
 */
export async function downloads<T>(urls: T[], downloadFn: DownloadFn<T>) {
    const tasks = urls.map(url => download<T>(url, downloadFn))
    return await Promise.all(tasks)
}

/**
 * 打印代理使用次数
 */
export function usage() {
    pool.printProxyUsage();
}

export function formatDownloadResult(label: string, results: DownloadResult | DownloadResult[], total: number) {
    if (!Array.isArray(results)) {
        results = [results]
    }

    console.debug(label)
    console.debug(`总耗时: ${total.toFixed(2)}s`);

    // 打印下载耗时明细
    const downloadResults = results.map((result, index) => ({
        '总耗时': result.totalTime,
        '重试次数': result.attempts,
        '是否下载成': result.success,
    }))
    console.table(downloadResults)
}
