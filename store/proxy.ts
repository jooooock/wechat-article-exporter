import {openDatabase} from "~/store/db";
import type {ProxyInstance} from "~/utils/pool";


/**
 * 更新 proxy 缓存
 * @param db
 * @param proxy
 */
async function updateProxyCache(db: IDBDatabase, proxy: ProxyInstance): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const proxyStore = db.transaction('proxy', 'readwrite').objectStore('proxy')
        const request = proxyStore.get(proxy.address)
        request.onsuccess = () => {
            let proxyCache: ProxyInstance | undefined = request.result
            if (proxyCache) {
                proxyCache.usageCount += proxy.usageCount
                proxyCache.successCount += proxy.successCount
                proxyCache.failureCount += proxy.failureCount
                proxyCache.traffic += proxy.traffic
            } else {
                proxyCache = proxy
            }
            const updateRequest = proxyStore.put(proxyCache)
            updateRequest.onsuccess = () => {
                resolve(true)
            }
            updateRequest.onerror = (evt) => {
                reject(evt)
            }
        }
        request.onerror = (evt) => {
            reject(evt)
        }
    })
}

/**
 * 更新 proxy 缓存
 * @param proxies
 */
export async function updateProxiesCache(proxies: ProxyInstance[]): Promise<void> {
    const db = await openDatabase()

    for (const proxy of proxies) {
        await updateProxyCache(db, proxy)
    }
}

/**
 * 获取 proxy 缓存
 */
export async function getProxyCache(): Promise<ProxyInstance[] | undefined> {
    const db = await openDatabase()
    const proxies: ProxyInstance[] = []

    return new Promise((resolve, reject) => {
        const proxyStore = db.transaction('proxy').objectStore('proxy')
        const request = proxyStore.openCursor()
        request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result
            if (cursor) {
                proxies.push(cursor.value)
                cursor.continue()
            } else {
                resolve(proxies)
            }
        }
        request.onerror = (evt) => {
            reject(evt)
        }
    })
}

/**
 * 清空 proxy 缓存
 */
async function clearProxyCache(): Promise<boolean> {
    const db = await openDatabase()

    return new Promise((resolve, reject) => {
        const proxyStore = db.transaction('proxy', 'readwrite').objectStore('proxy')
        const request = proxyStore.clear()
        request.onsuccess = () => {
            resolve(true)
        }
        request.onerror = (evt) => {
            reject(evt)
        }
    })
}

const loginAccount = useLoginAccount()

/**
 * 上报 proxy 数据
 */
export async function uploadProxy() {
    const proxies = await getProxyCache()

    // 上报统计数据
    if (proxies && proxies.length > 0) {
        await $fetch('/api/stat', {
            method: 'POST',
            body: JSON.stringify({
                proxies,
                uuid: loginAccount.value.uuid || loginAccount.value.nickname || (loginAccount.value as any).nick_name,
            }),
        })

        // 清空缓存
        await clearProxyCache()
    }
}
