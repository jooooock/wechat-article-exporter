import puppeteer, {Browser} from 'puppeteer';

export async function launchBrowserLocal() {
    const browser = await puppeteer.launch()

    return browser
}
