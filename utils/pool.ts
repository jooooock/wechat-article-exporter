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

interface DownloadResult {
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

export async function run() {
    const urls = [
        '1',
        '2',
        '3',
        '4',
        '5',
        // '6',
        // '7',
        // '8',
        // '9',
        // '10'
    ];

    // 下载函数
    const downloadFn: DownloadFn<string> = async (url: string, proxy: string) => {
        // 模拟下载操作
        return new Promise((resolve, reject) => {
            console.log(`Downloading ${url} using ${proxy}...`);

            setTimeout(() => {
                if (Math.random() > 0.3) {
                    resolve()
                } else {
                    reject(new Error('Download failed'))
                }
            }, Math.random() * 3000)
        });
    }

    const startTime = Date.now()
    const downloadTasks = urls.map(url => downloadWithRetry(pool, url, downloadFn));
    const results = await Promise.all(downloadTasks)

    console.log('================ 下载完毕 =====================')

    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;

    // 打印所有资源的总耗时
    console.log(`Total time taken for all downloads: ${totalTime.toFixed(2)} seconds`);

    // 打印下载耗时明细
    const downloadResults = results.map((result, index) => ({
        URL: urls[index],
        '总耗时(s)': result.totalTime.toFixed(2),
        '重试次数': result.attempts,
        '是否下载成': result.success ? 'Yes' : 'No',
    }))
    console.table(downloadResults)


    // 打印代理使用次数
    pool.printProxyUsage();
}

/**
 * 使用代理池下载单个资源
 * @param url
 * @param downloadFn
 */
export async function download<T>(url: T, downloadFn: DownloadFn<T>) {
    return await downloadWithRetry<T>(pool, url, downloadFn)
}

export function usage() {
    pool.printProxyUsage();
}
