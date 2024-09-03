# wechat-article-exporter
微信公众号文章导出工具

> 受 [WeChat_Article](https://github.com/1061700625/WeChat_Article) 项目的启发所写

## Features

- [x] 搜索公众号
- [x] 搜索公众号内文章
- [x] 导出文章 html (打包了图片和样式文件，能够保证100%还原文章样式)
- [x] 批量导出公众号文章 html
- [x] 缓存文章列表数据，减少接口请求次数 (关键字搜索的文章不会进入缓存)
- [x] 过滤已删除文章
- [ ] 公众号加入收藏列表
- [ ] 支持图片分享消息


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


## 关于批量导出

由于微信对相关接口有额度/频率的调用限制，所以批量导出功能并不会去批量获取新的数据，仅仅是将已缓存的数据导出。由于翻页时已经将数据进行了缓存，所以批量导出的数据即页面所显示的数据。

## 代理节点

数据的下载采用代理节点，以便可以解决跨域、防盗链等一系列问题。

目前有以下代理节点:
```
https://vproxy-01.deno.dev
https://vproxy-02.deno.dev
https://vproxy-03.deno.dev
https://vproxy-04.deno.dev
https://vproxy-05.deno.dev
https://vproxy-06.deno.dev
http://vproxy-01.jooooock.workers.dev
http://vproxy-02.jooooock.workers.dev
```

### Deno Deploy 代理节点代码
```ts
function error(msg: Error | string) {
    return new Response(msg instanceof Error ? msg.message : msg, {
        status: 403,
    });
}

async function wfetch(url: string, opt: Record<string, string> = {}) {
    if (!opt) {
        opt = {};
    }
    const options: Record<string, any> = {
        method: "GET",
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36",
        },
    };
    if (opt.referer) {
        options.headers["Referer"] = opt.referer;
    }

    return await fetch(url, options);
}

Deno.serve(async (req: Request) => {
    if (req.method.toLowerCase() !== "get") {
        return error("Method not allowed");
    }

    const origin = req.headers.get("origin")!;
    const { searchParams } = new URL(req.url);
    let url = searchParams.get("url");
    if (!url) {
        return error("url cannot empty");
    }

    url = decodeURIComponent(url);
    console.log("proxy url:", url);

    if (!/^https?:\/\//.test(url)) {
        return error("url not valid");
    }

    const response = await wfetch(url);

    return new Response(response.body, {
        headers: {
            "Access-Control-Allow-Origin": origin,
            "Content-Type": response.headers.get("Content-Type")!,
        },
    });
});
```

### Cloudflare Worker 代理节点代码
```js
function error(msg) {
    return new Response(msg instanceof Error ? msg.message : msg, {
        status: 403,
    });
}

async function wfetch(url, opt = {}) {
    if (!opt) {
        opt = {};
    }
    const options = {
        method: "GET",
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36",
        },
    };
    if (opt.referer) {
        options.headers["Referer"] = opt.referer;
    }

    return await fetch(url, options);
}


export default {
  async fetch(req, env, ctx) {
    if (req.method.toLowerCase() !== "get") {
        return error("Method not allowed");
    }

    const origin = req.headers.get("origin");
    const { searchParams } = new URL(req.url);
    let url = searchParams.get("url");
    if (!url) {
        return error("url cannot empty");
    }

    url = decodeURIComponent(url);
    console.log("proxy url:", url);

    if (!/^https?:\/\//.test(url)) {
        return error("url not valid");
    }

    const response = await wfetch(url);

    return new Response(response.body, {
        headers: {
            "Access-Control-Allow-Origin": origin,
            "Content-Type": response.headers.get("Content-Type"),
        },
    });
  },
};
```

代理节点越多，则下载速度越快。

因此欢迎大家自己搭建一些节点，并进行共享。


## 原理

在公众号后台写文章时支持搜索其他公众号的文章功能，以此来实现抓取指定公众号所有文章的目的，如下图所示:

![公众号后台搜索文章](assets/search-article.png)


## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=jooooock/wechat-article-exporter&type=Timeline)](https://star-history.com/#jooooock/wechat-article-exporter&Timeline)


## License

MIT
