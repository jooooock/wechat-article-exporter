import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export async function launchBrowserRemote() {
    const browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
    });
    return browser
}
