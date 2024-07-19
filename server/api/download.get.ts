import {launchBrowserLocal} from "~/server/utils/local-puppeteer";
import {launchBrowserRemote} from "~/server/utils/remote-puppeteer";

const isDev = process.env.NODE_ENV === "development";

interface DownloadQuery {
    url: string
}

export default defineEventHandler(async (event) => {
    const query = getQuery<DownloadQuery>(event)

    let browser = isDev ? await launchBrowserLocal() : await launchBrowserRemote();
    const page = await browser.newPage();
    await page.setViewport({width: 1080, height: 1024});

    await page.goto(query.url, {
        waitUntil: 'load',
    });
    await autoScroll(page);

    const fileElement = await page.waitForSelector('#page-content');
    const screenshot = await fileElement!.screenshot({
        encoding: 'base64',
    });
    await browser.close();

    return screenshot;
})

async function autoScroll(page: any){
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                // @ts-ignore
                var scrollHeight = document.body.scrollHeight;
                // @ts-ignore
                window.scrollBy(0, distance);
                totalHeight += distance;

                // @ts-ignore
                if(totalHeight >= scrollHeight - window.innerHeight){
                    clearInterval(timer);
                    resolve(true);
                }
            }, 100);
        });
    });
}
