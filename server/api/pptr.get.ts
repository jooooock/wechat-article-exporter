import {launchBrowserLocal} from '~/server/utils/local-puppeteer'
import {launchBrowserRemote} from '~/server/utils/remote-puppeteer'


// 运行环境
const isDev = process.env.NODE_ENV === "development";

export default defineEventHandler(async (event) => {
    // Launch the browser and open a new blank page
    let browser = isDev ? await launchBrowserLocal() : await launchBrowserRemote();
    const page = await browser.newPage();

    // Navigate the page to a URL.
    await page.goto('https://developer.chrome.com/');

    // Set screen size.
    await page.setViewport({width: 1080, height: 1024});

    // Type into search box.
    await page.locator('.devsite-search-field').fill('automate beyond recorder');

    // Wait and click on first result.
    await page.locator('.devsite-result-item-link').click();

    // Locate the full title with a unique string.
    const textSelector = await page
        .locator('text/Customize and automate')
        .waitHandle();
    const fullTitle = await textSelector?.evaluate(el => el.textContent);

    // Print the full title.
    console.log('The title of this blog post is "%s".', fullTitle);

    await browser.close();

    return fullTitle
})
