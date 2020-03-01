const puppeteer = require('puppeteer');


const crawlPage = async () => {
    // console.debug(`> start crawl page: ${url} [${selector}]`);

    console.debug('  launch browser...');
    // const ldLibraryPath = `${process.env['FC_FUNC_CODE_PATH']}/lib/usr/lib/x86_64-linux-gnu/`;
    // const browser = await puppeteer.launch({
    //     headless: true,
    //     // executablePath: '/code/lib/headless-chromium',
    //     executablePath: '/code/lib/headless_shell',
    //     args: ['--no-sandbox', '--disable-setuid-sandbox'],
    //     env: {
    //         //chrome headless 的第三方依赖库安装到项目的 lib 目录下面，
    //         //所以需要设置 LD_LIBRARY_PATH 环境变量，告诉系统如何加载这部分的动态库
    //         LD_LIBRARY_PATH: `${process.env['LD_LIBRARY_PATH']}:${ldLibraryPath}`
    //     }
    // });
    const ldLibraryPath = `${process.env['FC_FUNC_CODE_PATH']}/lib/usr/lib/x86_64-linux-gnu/`;
    const browser = await puppeteer.launch({
        // headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    console.debug('  goto url...');
    const page = await browser.newPage();
    const response = await page.goto('https://developers.weixin.qq.com/miniprogram/dev/framework/release/', {
        waitUntil: "domcontentloaded",
        timeout: 10000
    });

    const element = await page.waitForSelector('#docContent', {timeout: 10000 });
    const elementText = await element.evaluate(node => node.innerText)
    console.log(`> waitForSelector: `,  elementText);
    
    await browser.close();

    return "hahha";
};

crawlPage().then()