import {openDatabase} from "~/store/db";


export interface Info {
    fakeid: string
    completed: boolean
    count: number
    articles: number
}

/**
 * 更新 info 缓存
 * @param infoStore
 * @param info
 */
export async function updateInfoCache(infoStore: IDBObjectStore, info: Info): Promise<boolean> {
    console.log(info)
    return new Promise((resolve, reject) => {
        const request = infoStore.get(info.fakeid)
        request.onsuccess = () => {
            let infoCache: Info | undefined = request.result
            if (infoCache) {
                if (info.completed) {
                    infoCache.completed = info.completed
                }
                infoCache.count += info.count
                infoCache.articles += info.articles
            } else {
                infoCache = {
                    fakeid: info.fakeid,
                    completed: info.completed,
                    count: info.count,
                    articles: info.articles,
                }
            }

            const updateRequest = infoStore.put(infoCache)
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
 * 获取 info 缓存
 * @param fakeid
 */
export async function getInfoCache(fakeid: string): Promise<Info | undefined> {
    const db = await openDatabase()

    return new Promise((resolve, reject) => {
        const request = db.transaction('info').objectStore('info').get(fakeid)
        request.onsuccess = () => {
            const info: Info | undefined = request.result
            resolve(info)
        }
        request.onerror = (evt) => {
            reject(evt)
        }
    })
}
