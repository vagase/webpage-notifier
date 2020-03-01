const puppeteer = require('puppeteer');
const Joi = require("joi");
const {httpHandler, getRequestBody} = require("../common/httpHandler");
const {ClientError} = require('../common/error');
const Site = require("../models/Site");
const CrawlHistory = require("../models/CrawlHistory");


const validationSchema = Joi.object( {
    siteId: Joi.objectId(),
    format: Joi.string().valid('', "text", "html")
});

const crawlPage = async (url, selector, format = 'text') => {
    console.group();

    if (!format) {
        format = 'text';
    }

    try {
        console.debug(`start crawl page: ${url} [${selector}]`);

        console.debug('launch browser...');
        const ldLibraryPath = `${process.env['FC_FUNC_CODE_PATH']}/lib/usr/lib/x86_64-linux-gnu/`;
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            env: {
                //chrome headless 的第三方依赖库安装到项目的 lib 目录下面，
                //所以需要设置 LD_LIBRARY_PATH 环境变量，告诉系统如何加载这部分的动态库
                LD_LIBRARY_PATH: `${process.env['LD_LIBRARY_PATH']}:${ldLibraryPath}`
            }
        });

        console.debug('create new page...')
        const page = await browser.newPage();
        page.setDefaultTimeout(15000);

        console.debug('page goto url...');
        const response = await page.goto(url);

        console.debug('query selector...');
        const element = await page.waitForSelector(selector);
        
        let result;
        if (format === 'text') {
            result = await element.evaluate(node => node.innerText);
        }
        else {
            result = await element.evaluate(node => node.innerHTML);
        }
        console.debug('query selector success');
        
        await browser.close();

        return result;
    } catch (error) {
        if (error instanceof puppeteer.errors.TimeoutError) {
            throw new ClientError(-1, `error occured while crawling page: ${url} [${selector}]`, error);
        }
        else {
            throw error;
        }
    }
    finally {
        console.groupEnd();
    }
};

exports.index = httpHandler(
    validationSchema,
    async function (request, response, context) {    
        const body = await getRequestBody(request);
        const siteId = body.siteId;
        const format = body.format || 'text';

        const site = await Site.findOneById(siteId);
        const url = site.url;
        const selector = site.selector;

        const payload = await crawlPage(url, selector, format);
        const id = await CrawlHistory.addOne(siteId, format, payload);
        return {id};
    }
);