const rawbLoggerMiddleware = require('../src/middleware-restify');
const restify = require('restify');

const server = restify.createServer({
    name: 'Server 4',
    version: '1.0.0'
});

server.use(rawbLoggerMiddleware({
    version: '1.0',
    name: 'server4',
    logServerUrl: 'http://localhost:7777/log/123345',
}));

server.get('/', (req, res) => {
    req.rawb.logger.info('datamaskin');
    res.send('datamaskin');
});


exports.init = function start() {

    return new Promise((resolve, reject) => {
        server.listen(6000, async (err) => {

            if (err) {
                return reject(err);
            }

            resolve();

        });
    });

}
