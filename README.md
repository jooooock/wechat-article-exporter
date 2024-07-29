# wechat-article-exporter
微信公众号文章导出工具

> 受 [WeChat_Article](https://github.com/1061700625/WeChat_Article) 项目的启发所写

## Features

- [x] 公众号搜索
- [x] 公众号内文章搜索
- [x] 文章导出 html，打包了图片和样式文件，保证100%还原度
- [x] 公众号文章批量导出 html (**目前请慎用，原因请参考[微信接口频率限制](docs/微信接口频率限制.md)**)
- [x] 缓存文章列表数据，减少接口请求次数
- [x] 缓存样式文件，加快文章导出速度
- [x] 过滤已删除文章
- [ ] 公众号加入收藏列表
- [ ] 一键抓取收藏的公众号最新文章


## 如何使用？

### 1. 注册一个微信公众号 (已有账号的话跳过)

前往 [微信公众平台](https://mp.weixin.qq.com/cgi-bin/registermidpage?action=index&lang=zh_CN) 注册，服务号和订阅号皆可。

### 2. 二维码扫码登录

进入 [登录页面](https://wechat-article-exporter.deno.dev/login)，用微信扫描页面上的二维码，然后选择自己的公众号进行登录。

### 3. 搜索目标公众号，开始下载文章

通过左上角的公众号切换按钮，搜索自己感兴趣的公众号，如下图所示：

![切换账号](assets/switch-account.png)

搜索示例：

![搜索公众号](assets/search-account-sample.png)


## 原理

在公众号后台写文章时支持搜索其他公众号的文章功能，以此来实现抓取指定公众号所有文章的目的，如下图所示:

![公众号后台搜索文章](assets/search-article.png)

## License

MIT
