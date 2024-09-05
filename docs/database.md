# 缓存数据库设计

数据库名: `wechat-article-exporter`

## version: 1

### `article` store

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


需要的索引:

- fakeid
- fakeid_create_time (复合索引)


### `asset` store

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


### `info` store

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

## version: 2

### `api` store

用于统计接口调用情况，帮助分析微信接口频率限制规则。

该项目涉及到的可能会被微信限制调用频率的有如下接口:

- `/api/searchbiz` 公众号列表 (调用频次相对较低，不容易出现限制)
- `/api/appmsgpublish` 历史文章列表 (调用频次高，很容易出现限频)

### 注意

1. 文章下载不涉及到微信接口调用，因为文章链接是公开可访问的，不需要携带cookie
2. 即使`/api/appmsgpublish`接口被限频，仍可以通过带关键字进行调用


对象数据结构如下:

```ts
type ApiName = 'searchbiz' | 'appmsgpublish'


interface APICall {
    /**
     * 接口名称
     */
    name: ApiName

    /**
     * 调用账号(nickname)
     */
    account: string

    /**
     * 调用时间
     */
    call_time: number

    /**
     * 调用结果是否正常
     * 
     * true: 正常
     * false: 被封禁
     */
    is_normal: boolean

    /**
     * 请求参数
     */
    payload: Record<string, any>
}
```

需要的索引:

- account
- account_call_time (复合索引)


## version: 3

### `proxy` store

用于统计代理使用情况。

对象数据结构如下:

```ts
interface Proxy {
    // 代理地址 (keyPath)
    address: string

    // 是否正在被使用
    busy: boolean

    // 是否处于冷静期
    cooldown: boolean

    // 使用次数
    usageCount: number

    // 成功次数
    successCount: number

    // 失败次数
    failureCount: number

    // 下载流量
    traffic: number
}
```
