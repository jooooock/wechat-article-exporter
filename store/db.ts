export function openDatabase() {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = window.indexedDB.open('wechat-article-exporter', 3)
        request.onerror = (evt) => {
            reject(evt)
        }
        request.onsuccess = () => {
            resolve(request.result)
        }
        request.onupgradeneeded = () => {
            const db = request.result
            const transaction = request.transaction!


            // 创建v1版本相关的数据库
            if (!db.objectStoreNames.contains('article')) {
                // 主键需要通过组合 fakeid:appmsgid 显式设置
                const articleStore = db.createObjectStore('article')
                articleStore.createIndex('fakeid', 'fakeid')
                articleStore.createIndex('fakeid_create_time', ['fakeid', 'create_time'])
            }
            const articleStore = transaction.objectStore('article')
            if (articleStore.indexNames.contains('create_time')) {
                articleStore.deleteIndex('create_time')
            }

            if (!db.objectStoreNames.contains('asset')) {
                db.createObjectStore('asset', {keyPath: 'url'})
            }

            if (!db.objectStoreNames.contains('info')) {
                db.createObjectStore('info', {keyPath: 'fakeid'})
            }


            // 创建v2版本相关的数据库
            if (!db.objectStoreNames.contains('api')) {
                const apiStore = db.createObjectStore('api', {autoIncrement: true})
                apiStore.createIndex('account', 'account')
                apiStore.createIndex('account_call_time', ['account', 'call_time'])
            }


            // 创建v3版本相关的数据库
            if (!db.objectStoreNames.contains('proxy')) {
                db.createObjectStore('proxy', {keyPath: 'address'})
            }
        }
    })
}
