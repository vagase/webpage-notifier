const util = require("util");
const {httpHandler, getRequestBody} = require("../common/httpHandler");
const Site = require("../models/Site");
const Joi = require("joi");

const validationSchema = Joi.object( {
    url: Joi.string().max(1024).required(),
    selector: Joi.string().max(1024).required(),
    email: Joi.string().email().required(),
});

exports.index = httpHandler(
    validationSchema,
    async function (request, response, context) {    
        const body = await getRequestBody(request);
        const url = body.url;
        const selector = body.selector;
        const email = body.email;

        const id = await Site.addOne(url, selector, email);

        return {id};
    }
);