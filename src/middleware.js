const fetch = require('node-fetch');
const { generateRandomId } = require('./create');

const createMiddleware = (root, headers, path, logger, httpLogger) => {

    root.rawb = root.rawb || {};
    root.rawb.logger = {};

    let requestId = headers['x-rawb-request-id'];
    if (!requestId) {
        requestId = generateRandomId(10);
        headers['x-rawb-request-id'] = requestId;
    }

    root.rawb.requestId = requestId;

    Object.keys(logger.levels.values).forEach(level => {
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
        root.rawb.logger.trafic = (...args) => {
            if (httpLogger) {
                httpLogger.trafic(...args);
            }
        };
    });

    let requestTraceId = headers['x-rawb-request-trace-id'];
    if (requestTraceId) {
        root.rawb.logger.trafic(`Incoming ${root.method} ${path}`, { rri: requestTraceId });
    }

    root.rawb.fetch = (url, options = {} ) => {

        if (!options.headers) {
            options.headers = {};
        }

        options.headers['x-rawb-request-id'] = requestId;

        let requestTraceId = generateRandomId(10);
        options.headers['x-rawb-request-trace-id'] = requestTraceId;
        root.rawb.logger.trafic(`${options.method || 'GET'} ${url}`, { rsi: requestTraceId });

        return fetch(url, options)
            .then(result => {
                result.body.on('end', () => {
                    root.rawb.logger.trafic(`RESP ${url}`, { rrri: requestTraceId })
                });
                result.body.on('close', () => {
                    root.rawb.logger.trafic(`RESP ${url}`, { rrri: requestTraceId });
                });
                result.body.on('error', () => {
                    root.rawb.logger.trafic(`RESP ${url}`, { rrri: requestTraceId });
                });
                result.body.on('data', () => { });
                return result;
            })
            .catch(err => {
                root.rawb.logger.trafic(`RESP ${url}`, { rrri: requestTraceId });
                throw err;
            });

    };

};

module.exports = createMiddleware;
