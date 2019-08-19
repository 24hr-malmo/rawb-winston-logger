const fetch = require('node-fetch');
const { generateRandomId } = require('./index');

const createMiddleware = (root, headers, path, logger, httpLogger) => {

    root.rawb = root.rawb || {};
    root.rawb.logger = {};

    let requestId = headers['x-rawb-request-id'];
    if (!requestId) {
        requestId = generateRandomId(10);
    }

    root.rawb.requestId = requestId;

    Object.keys(logger.levels).forEach(level => {
        root.rawb.logger[level] = (...args) => {
            if (args.length > 0) {
                let last = args[args.length - 1];
                if (typeof last === 'object') {
                    last.requestId = requestId;
                } else {
                    args.push({requestId});
                }
            }
            logger[level](...args);
            if (httpLogger) {
                httpLogger[level](...args);
            }
        };
    });

    let requestTraceId = headers['x-rawb-request-trace-id'];
    if (requestTraceId) {
        root.rawb.logger.info(`Incoming ${root.method} ${path}`, { rri: requestTraceId });
    }

    root.rawb.fetch = (url, options = {} ) => {

        if (!options.headers) {
            options.headers = {};
        }

        options.headers['x-rawb-request-id'] = requestId;

        let requestTraceId = generateRandomId(10);
        options.headers['x-rawb-request-trace-id'] = requestTraceId;
        root.rawb.logger.info(`${options.method || 'GET'} ${url}`, { rsi: requestTraceId });

        return fetch(url, options);

    };

};

module.exports = createMiddleware;
