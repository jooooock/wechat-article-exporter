export function openDatabase() {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = window.indexedDB.open('wechat-article-exporter')
        request.onerror = (evt) => {
            reject(evt)
        }
        request.onsuccess = () => {
            resolve(request.result)
        }
        request.onupgradeneeded = () => {
            const db = request.result

            // 主键需要通过组合 fakeid:appmsgid 显式设置
            const articleStore = db.createObjectStore('article')
            articleStore.createIndex('fakeid', 'fakeid')
            articleStore.createIndex('create_time', 'create_time')
            articleStore.createIndex('fakeid_create_time', ['fakeid', 'create_time'])


            db.createObjectStore('asset', {keyPath: 'url'})
            db.createObjectStore('info', {keyPath: 'fakeid'})
        }
    })
}
