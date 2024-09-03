import JSZip from "jszip";
import mime from "mime";
import {AVAILABLE_PROXY_LIST} from "~/config";


let vproxy: string[] = JSON.parse(JSON.stringify(AVAILABLE_PROXY_LIST));

async function downloadImage(img: HTMLImageElement, proxy: string, zip: JSZip) {
    try {
        const imgData = await $fetch<Blob>(`${proxy}?url=${encodeURIComponent(img.src)}`, {
            retry: 0,
        })
        const uuid = new Date().getTime() + Math.random().toString()
        const ext = mime.getExtension(imgData.type)
        zip.file(`assets/${uuid}.${ext}`, imgData)

        // 改写html中的引用路径，指向本地图片文件
        img.src = `./assets/${uuid}.${ext}`
    } catch (e) {
        console.info('图片下载失败: ', img.src)
        console.info('proxy: ', proxy)
        throw e
    }
}

async function downloadBackgroundImage(url: string, proxy: string, zip: JSZip, url2pathMap: Map<string, string>) {
    try {
        const imgData = await $fetch<Blob>(`${proxy}?url=${encodeURIComponent(url)}`, {
            retry: 0,
        })
        const uuid = new Date().getTime() + Math.random().toString()
        const ext = mime.getExtension(imgData.type)

        zip.file(`assets/${uuid}.${ext}`, imgData)
        url2pathMap.set(url, `assets/${uuid}.${ext}`)
    } catch (e) {
        console.info('背景图片下载失败: ', url)
        console.error(e)
    }
}

let _resolve: (value: string) => void

// 获取代理资源
function acquireProxyResource(): Promise<string> {
    return new Promise((resolve) => {
        if (vproxy.length > 0) {
            resolve(vproxy.shift()!)
        } else {
            _resolve = resolve
        }
    })
}
// 释放代理资源
function releaseProxyResource(proxy: string) {
    if (_resolve) {
        _resolve(proxy)
    } else {
        vproxy.push(proxy)
    }
}
function reset() {
    vproxy = JSON.parse(JSON.stringify(AVAILABLE_PROXY_LIST))
}

// 并发下载图片
export async function downloadImages(imgs: HTMLImageElement[], zip: JSZip): Promise<boolean> {
    const errors = new Map<HTMLImageElement, number>()
    const total = imgs.length

    reset()

    return new Promise(async (resolve, reject) => {
        let count = 0
        let stop = false

        for (const img of imgs) {
            if (stop) {
                break
            }
            img.src = img.src || img.dataset.src!

            if (!img.src) {
                console.warn('img元素的src为空')
                continue
            }
            errors.set(img, errors.get(img) || 0)

            const proxy = await acquireProxyResource()
            downloadImage(img, proxy, zip).then(() => {
                // 归还 resource
                count++
                releaseProxyResource(proxy)
            }).catch(() => {
                errors.set(img, errors.get(img)! + 1)

                if (errors.get(img)! >= 3) {
                    // 该图片已经失败了3次，则结束整个过程
                    stop = true
                    console.warn('img: 失败3次已停止')
                    reject(new Error('图片下载失败'))
                    return
                }

                imgs.push(img)

                // 失败，延迟2s再归还该资源
                setTimeout(() => {
                    releaseProxyResource(proxy)
                }, 3000)
            }).finally(() => {
                // console.log(`${count}/${total}`)
                if (count === total) {
                    resolve(true)
                }
            })
        }
    })
}

export async function downloadBgImages(bgImgUrls: string[], zip: JSZip): Promise<Map<string, string>> {
    const url2pathMap = new Map<string, string>()
    const errors = new Map<string, number>()
    const total = bgImgUrls.length

    reset()

    return new Promise(async (resolve, reject) => {
        let count = 0
        let stop = false

        for (const url of bgImgUrls) {
            if (stop) {
                break
            }
            errors.set(url, errors.get(url) || 0)

            const proxy = await acquireProxyResource()
            downloadBackgroundImage(url, proxy, zip, url2pathMap).then(() => {
                // 归还 resource
                count++
                releaseProxyResource(proxy)
            }).catch(() => {
                errors.set(url, errors.get(url)! + 1)

                if (errors.get(url)! >= 3) {
                    // 该图片已经失败了3次，则结束整个过程
                    stop = true
                    console.warn('bg: 失败3次已停止')
                    reject(new Error('背景图片下载失败'))
                    return
                }

                bgImgUrls.push(url)
                // 失败，延迟2s再归还该资源
                setTimeout(() => {
                    releaseProxyResource(proxy)
                }, 3000)
            }).finally(() => {
                if (count === total) {
                    resolve(url2pathMap)
                }
            })
        }
    })
}
