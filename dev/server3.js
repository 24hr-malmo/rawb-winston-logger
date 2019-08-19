const rawbLoggerMiddleware = require('../src/middleware-koa');

const Koa = require('koa');
const Router = require('koa-router');
const fetch = require('node-fetch');

const app = new Koa();
const router = new Router();

app.use(rawbLoggerMiddleware({
    version: '1.0',
    name: 'server3',
    logServerUrl: 'http://localhost:7777/log/123345',
}));

let counter = 0;

router.get('/baq', async (ctx, next) => {
    ctx.rawb.logger.info('Counting %d', counter++);

    let request = await ctx.rawb.fetch('http://localhost:6000/');
    let result = await request.text();

    ctx.body = 'baq ' + result;
});

app
    .use(router.routes())
    .use(router.allowedMethods());

exports.init = async () => new Promise(resolve => app.listen(5000, resolve));
