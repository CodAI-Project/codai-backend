import Response from '../types/Response';
import functions from 'firebase-functions';

const middleware = 'REQUEST-MIDDLWARE';

export default (result) => async (req, res, next) => {
    const hasBusinessResponse = result instanceof Response;
    const responseBody = hasBusinessResponse ? result : result ? result.toString() : 500;

    if (result instanceof Error) {
        functions.logger.error(`[${middleware}] REPORT ERROR`, result);
    }
    
    res.status(responseStatus).json(responseBody);
};
