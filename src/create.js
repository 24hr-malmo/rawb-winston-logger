const pino = require('pino')
const url = require('url');
const os = require('os');
const fetch = require('node-fetch');

const prettyRequestId = value => {
    return `R: ${value}`;
};

const create = (loggerOptions, dontCreateProxyLogger) => {

    const logger = pino({ 
        prettyPrint: true,
        customLevels: {
            verbose: 35
        },
        level: loggerOptions.level || 'trace',
        customPrettifiers: {
            requestId: prettyRequestId,
        }
    });

    // if (loggerOptions.transports) {
    //     loggerOptions.transports.forEach(transport => logger.add(transport));
    // }

    let httpLogger;

    if (loggerOptions.logServerUrl) {

        let urlConfig = url.parse(loggerOptions.logServerUrl);

        // let httpQueue = [];

        const send = async (payload) => {
            console.log(payload);
            await fetch(loggerOptions.logServerUrl, {
                method: 'post',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' },
            });
        }

        //     const sendQueue = async () => {
        // 
        //         for(let i = 
        // 
        //     }
        // 
        //     setInterval(sendQueue, 1000);
        // 


        httpLogger = {};
        Object.keys(logger.levels.values).forEach(level => {
            httpLogger[level] = (...args) => {
                const info = {...args};
                let reference = info.reference || info.requestId;
                if (!reference) {
                    reference = 'orphan';
                }
                info.reference = reference;
                info.hostname = os.hostname();
                info.version = loggerOptions.version;
                info.name = loggerOptions.name.replace(/-/g, '_');
                info.localTime = new Date().getTime();
                send(info);
            }
            httpLogger.trafic = (...args) => {
                const info = {...args};
                let reference = info.reference || info.requestId;
                if (!reference) {
                    reference = 'orphan';
                }
                info.reference = reference;
                info.hostname = os.hostname();
                info.version = loggerOptions.version;
                info.name = loggerOptions.name.replace(/-/g, '_');
                info.localTime = new Date().getTime();
                send(info);
            };
        });
        httpLogger.levels = logger.levels;


        //                     host: urlConfig.hostname,
        //                     path: urlConfig.path,
        //                     port: parseInt(urlConfig.port, 10),
        //                     ssl: urlConfig.protocol === 'https:',
        //                     format: winston.format.combine(
        //                         winston.format.json(),
        //                         winston.format.splat(),
        //                         winston.format(function (info, ...args) {
        // 
        //                             let reference = info.reference || info.requestId;
        //                             if (!reference) {
        //                                 reference = 'orphan';
        //                             }
        // 
        //                             info.reference = reference;
        //                             info.hostname = os.hostname();
        //                             info.version = loggerOptions.version;
        //                             info.name = loggerOptions.name.replace(/-/g, '_');
        //                             info.localTime = new Date().getTime();
        // 
        //                             // SPECIAL DATA
        //                             // info.session;
        //                             // info.start;
        //                             // info.end;
        //                             // info.rri;
        //                             // info.rsi;
        // 
        //                             return info;
        // 
        //                         })(),
        //                     )

    }

    if (dontCreateProxyLogger) {
        return {
            logger,
            httpLogger
        };
    }
    // 
    // A proxy to all logs so we can go around the bug mentioned above
    const customLogger = () => {
        const proxy = {};
        Object.keys(logger.levels.values).forEach(level => {
            proxy[level] = (...args) => {
                logger[level](...args);
                if (httpLogger) {
                    httpLogger[level](...args);
                }
            }
            proxy.trafic = (...args) => {
                if (httpLogger) {
                    httpLogger.trafic(...args);
                }
            };
        });
        proxy.levels = logger.levels;
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

