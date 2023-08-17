const middleware = 'REQUEST-MIDDLWARE';

const status = require('http-status-code')
const Response = require('../types/Response')
const functions = require('firebase-functions')

module.exports = result => (result, req, res, next) => {
    const hasBusinessResponse = result instanceof Response;
    const responseBody = hasBusinessResponse ? result : result ? result.toString() : status.getStatusText(500);
    const responseStatus = hasBusinessResponse ? result.status : status.INTERNAL_SERVER_ERROR

    if (result instanceof Error) {
        functions.logger.error(`[${middleware}] REPORT ERROR`, result)
    }
    res.status(responseStatus).json(responseBody)
}