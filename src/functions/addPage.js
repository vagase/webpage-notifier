const util = require("util");
const {httpHandler, getRequestBody} = require("../common/httpHandler");
const mongo = require("../common/mongo");
const Joi = require("joi");

const validationSchema = Joi.object( {
    url: Joi.string().max(1024).required(),
    email: Joi.string().email().required(),
});

exports.index = httpHandler(
    validationSchema,
    async function (request, response, context) {    
        const body = await getRequestBody(request);
        const url = body.url;
        
        const sites = await mongo.collection("sites");
        const ret = await sites.insertOne({
            url
        });

        return body;
    }
);