const puppeteer = require('puppeteer');
const Joi = require("joi");
const {httpHandler, getRequestBody} = require("../common/httpHandler");
const {ClientError} = require('../common/error');
const Site = require("../models/Site");
const CrawlHistory = require("../models/CrawlHistory");
const nodemailer = require("nodemailer");
const config = require("../common/config");


const validationSchema = Joi.object( {
    siteId: Joi.objectId(),
    format: Joi.string().valid('', "text", "html")
});

const crawlPage = async (url, selector, selectorType, format = 'text') => {
    console.group();

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
        // FIXME: 15秒看起来可能太短，timeout很常见
        // page.setDefaultTimeout(15000);

        console.debug('page goto url...');
        const response = await page.goto(url);

        console.debug('query selector...');
        let element;
        if (selectorType === 'xpath') {
            element = await page.waitForXPath(selector);
        }
        else {
            element = await page.waitForSelector(selector);
        }
        
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

const checkChanges = async (siteId) => {
    const histories = await CrawlHistory.findLatestTwoHistoriesForSiteId(siteId);
    if (histories.length !== 2) {
        return true;
    }

    return histories[0].payload !== histories[1].payload;
};

const sendEmail = async (to, subject, text) => {
    try {
        let transporter = nodemailer.createTransport({
            host: config.resolve("email.host"),
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: config.resolve("email.user"),
                pass: config.resolve("email.pass"),
            }
        });

        await transporter.sendMail({
            from: `"no-reply" ${config.resolve("email.user")}`,
            to: to,
            subject: subject,
            text: text
        });

        console.log(`send email success, to:${to} subject:${subject} text:${text}`);
    }
    catch (e) {
        console.error(`send email failed, to:${to} subject:${subject} text:${text}`, e);
    }
}

const sendEmailForSiteChange = async(siteId) => {
    const site = await Site.findOneById(siteId);
    const history = await CrawlHistory.findLatestHistoryForSiteId(siteId);

    let payload = history.payload;
    if (payload.length > 140) {
        payload = payload.substring(0, 140) + '...'
    }

    await sendEmail(site.email, '网站有更新', `url: ${site.url}\nselector: ${site.selector}\n\n最新内容预览\n\n${payload}`);
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
        const selectorType = site.selectorType;

        const payload = await crawlPage(url, selector, selectorType, format);
        const newRecordId = await CrawlHistory.addOne(siteId, format, payload);
        const changed = await checkChanges(siteId);

        let mailSent = false;
        if (changed) {
            sendEmailForSiteChange(siteId);
            mailSent = true;
        }
        
        return {
            new_history_id: newRecordId,
            changed,
            mail_sent: mailSent
        };
    }
);