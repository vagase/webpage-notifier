const util = require('util');
const jsonBody = util.promisify(require("body/json"));

class ClientError {
    constructor(code, description, internalError) {
        this.code = code;
        this.description = description;
        this.internalError = internalError;
    }

    toString() {
        return `ClientError[${this.code}] ${this.description} ${this.internalError && this.internalError.toString()}`
    }
}

function _writeResponse (response, httpCode, json) {
    response.setStatusCode(httpCode);
    response.setHeader('content-type', 'application/json');
    if(json instanceof String) {
        response.send(json);
    }
    else {
        response.send(JSON.stringify(json))
    }
}

function writeResponseSuccess (response, json) {
    _writeResponse(response, 200, json);
}

function writeResponseError(response, httpCode, errorCode, errorDescription) {
    _writeResponse(response, httpCode, {
        code: errorCode,
        description: errorDescription
    });
}

/**
 * 
 * @param {*} schema: use joi to validate request payload, supply NULL to skip validation
 * @param {*} handler 
 */
function httpHandler (schema, handler) {
    return async (request, response, context) => {
        if (schema) {
            let data = null;
            if (request.method === "POST" || request === "PUT") {
                data = await jsonBody(request, {cache: true});
            }
            else {
                data = request.queries;
            }

            const {error} =  schema.validate(data);
            if (error) {
                writeResponseError(response, 400, -1, error.message);
                return;
            }
        };

        try {
            const json = await handler(request, response, context);
            writeResponseSuccess(response, json);
        }
        catch(e) {
            console.error(e);
            
            if (e instanceof ClientError) {
                writeResponseError(response, 400, e.code, e.description);
            }
            else {
                writeResponseError(response, 500, -1, 'internal server error');
            }
        }
    }
}

/**
 * 如果调用 jsonBody 没有提供 cache 参数，程序会卡在 jsonBody 处
 * @param {*} requset 
 */
async function getRequestBody(request) {
    return jsonBody(request, {cache: true})
}

exports.ClientError = ClientError;
exports.httpHandler = httpHandler;
exports.getRequestBody = getRequestBody;