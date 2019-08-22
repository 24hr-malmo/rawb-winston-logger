const ms = require('rawb-microservice-base');
const rawbLoggerMiddleware = require('../src/middleware-restify');

const options = {
    name: 'Bank api',
    version: '1.0',
    port: 7000,
    maxParamLength: 360,
};

exports.init = async () => {

    const server = await ms.start(options);

    server.use(rawbLoggerMiddleware({
        version: '1.0',
        name: 'server5',
        logServerUrl: 'http://localhost:7777/log/123345',
    }));

    server.get('/', async (req, res) => {
        req.rawb.logger.error('hej', { test: 1 } );
        res.send('tjena');
    });


};
