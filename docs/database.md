# 缓存数据库设计

数据库名: `wechat-article-exporter`

## `article` store

用于存储文章列表接口的数据，减少接口请求次数。

对象数据结构如下:

```ts
import {AppMsgEx} from "../types";

declare const article: AppMsgEx


// key 采用【公众号id】与【文章id】组合的形式
const key = `${fakeid}:${article.aid}`

// value 除了文章相关字段外，增加了 fakeid 字段
type StoreObjectValue = AppMsgEx & {
    fakeid: string
}
```


索引:

- fakeid
- create_time
- fakeid_create_time (复合索引)


## `asset` store

用于存储 css 文件，因为大部分文章的样式文件都相同，所以缓存该文件对于减少下载速度有重要意义。

对象数据结构如下:

```ts
interface Asset {
    /**
     * css文件路径 (keyPath)
     */
    url: string

    /**
     * 文件对象
     */
    file: File
}
```


## `info` store

用于统计公众号已缓存信息。

对象数据结构如下:

```ts
interface Info {
    /**
     * 公众号id (keyPath)
     */
    fakeid: string
    
    /**
     * 文章是否已全部加载
     * 
     * 公众号文章的加载逻辑是从最新的文章开始往前加载，越早的文章越靠后
     */
    completed: boolean

    /**
     * 缓存的消息数
     * 
     * 一条消息可能会包含多篇文章
     * 分页查询采用的是消息条数，而不是文章条数
     */
    count: number

    /**
     * 缓存的文章数
     */
    articles: number
}
```
