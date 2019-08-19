const winston = require('winston');
const url = require('url');
const os = require('os');

const create = (loggerOptions, dontCreateProxyLogger) => {

    const logger = winston.createLogger({
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.splat(),
                    winston.format(function (info) {
                        if (!info.requestId) {
                            info.message = `[system] ${info.message}`;
                        } else {
                            info.message = `[${info.requestId}] ${info.message}`;
                            delete info.requestId;
                            delete info.rri;
                            delete info.rsi;
                        }
                        return info;
                    })(),
                    // winston.format.colorize({ all: true }),
                    winston.format.simple(),
                )
            })
        ],
    });

    logger.level = loggerOptions.logLevel;

    if (loggerOptions.transports) {
        loggerOptions.transports.forEach(transport => logger.add(transport));
    }


    // SEPARATE HTTP LOGGER BECAUSE OF WINSTON BUG THAT MUTATES THE INFO OBJECT
    // https://github.com/winstonjs/winston/issues/1430

    let httpLogger;

    if (loggerOptions.logServerUrl) {

        let urlConfig = url.parse(loggerOptions.logServerUrl);

        httpLogger = winston.createLogger({
            transports: [
                new winston.transports.Http({
                    host: urlConfig.hostname,
                    path: urlConfig.path,
                    port: parseInt(urlConfig.port, 10),
                    ssl: urlConfig.protocol === 'https:',
                    format: winston.format.combine(
                        winston.format.json(),
                        winston.format.splat(),
                        winston.format(function (info, ...args) {

                            let reference = info.reference || info.requestId;
                            if (!reference) {
                                reference = 'orphan';
                            }

                            info.reference = reference;
                            info.hostname = os.hostname();
                            info.version = loggerOptions.version;
                            info.name = loggerOptions.name.replace(/-/g, '_');

                            // SPECIAL DATA
                            // info.session;
                            // info.start;
                            // info.end;
                            // info.rri;
                            // info.rsi;

                            return info;

                        })(),
                    )
                })
            ]
        });
        httpLogger.level = loggerOptions.logLevel;

    }

    if (dontCreateProxyLogger) {
        return {
            logger,
            httpLogger
        };
    }

    // A proxy to all logs so we can go around the bug mentioned above
    const customLogger = () => {
        const proxy = {};
        Object.keys(logger.levels).forEach(level => {
            proxy[level] = (...args) => {
                logger[level](...args);
                if (httpLogger) {
                    httpLogger[level](...args);
                }
            };
        });
        return proxy;
    };

    return customLogger();

};

const generateRandomId = (length = 10) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

module.exports = {
    generateRandomId,
    create,
}

