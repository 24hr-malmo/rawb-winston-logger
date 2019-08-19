const rawbLoggerMiddleware = require('../src/middleware-koa');

const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

app.use(rawbLoggerMiddleware({
    version: '1.0',
    name: 'server2',
    logServerUrl: 'http://localhost:7777/log/123345',
}));

router.get('/bar', async (ctx, next) => {

    ctx.rawb.logger.info('Testing testing');

    let request = await ctx.rawb.fetch('http://localhost:5000/baq');
    let result = await request.text();

    let request2 = await ctx.rawb.fetch('http://localhost:7000/');
    let result2 = await request2.text();

    // await new Promise(resolve => setTimeout(resolve, 100));
    ctx.body = 'bar, ' + result + ', ' + result2;


});

app
    .use(router.routes())
    .use(router.allowedMethods());

exports.init = async () => new Promise(resolve => app.listen(4000, resolve));
