import type {AppMsgExWithHTML} from "~/types/types";
import {downloadArticleHTMLs, packHTMLAssets} from "~/utils";
import JSZip from "jszip";
import {saveAs} from "file-saver";
import {uploadProxy} from "~/store/proxy";
import {format} from 'date-fns'


/**
 * 批量下载文章
 * @param articles
 * @param filename
 */
export default function useBatchDownload(articles: Ref<AppMsgExWithHTML[]>, filename: Ref<string>) {
    const loading = ref(false)
    const phase = ref()

    // 已下载的文章列表
    const downloadedArticles = computed(() => articles.value.filter(article => !!article.html))
    // 已打包的文章列表
    const packedArticles = computed(() => articles.value.filter(article => !!article.packed))

    async function download() {
        loading.value = true

        phase.value = '下载文章内容'
        await downloadArticleHTMLs(articles.value)

        phase.value = '打包'
        const zip = new JSZip()
        for (const article of downloadedArticles.value) {
            try {
                await packHTMLAssets(article.html!, article.title.replaceAll('.', '_'), zip.folder(format(new Date(article.update_time * 1000), 'yyyy-MM-dd') + ' ' + article.title.replace(/\//g, '_'))!)
                article.packed = true
            } catch (e: any) {
                console.info('打包失败:')
                console.warn(e.message)
            }
        }

        const blob = await zip.generateAsync({type: 'blob'})
        saveAs(blob, `${filename.value}.zip`)

        await uploadProxy()

        loading.value = false
    }

    return {
        loading,
        phase,
        downloadedArticles,
        packedArticles,
        download,
    }
}
