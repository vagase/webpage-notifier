const util = require("util");
const {httpHandler, getRequestBody} = require("../common/httpHandler");
const Site = require("../models/Site");
const Joi = require("joi");

const validationSchema = Joi.object( {
    url: Joi.string().max(1024).required(),
    cssSelector: Joi.string().max(1024),
    xpath: Joi.string().max(1024),
    email: Joi.string().email().required(),
}).xor('cssSelector', 'xpath');

exports.index = httpHandler(
    validationSchema,
    async function (request, response, context) {    
        const body = await getRequestBody(request);
        const url = body.url;
        const cssSelector = body.cssSelector;
        const xpath = body.xpath;
        const email = body.email;

        const id = await Site.addOne(url, cssSelector || xpath, cssSelector ? 'css-selector' : 'xpath', email);
        return {id};
    }
);