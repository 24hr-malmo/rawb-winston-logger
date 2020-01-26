const rawbLoggerMiddleware = require('../src/middleware-koa');

const Koa = require('koa');
const Router = require('koa-router');
const fetch = require('node-fetch');

const app = new Koa();
const router = new Router();

app.use(rawbLoggerMiddleware({
    version: '1.0',
    name: 'server1',
    logServerUrl: 'http://localhost:7777/log/123345',
}));
// postgres://logger:loggerpassword@192.168.88.19/logger
router.get('/foo', async (ctx, next) => {

    ctx.rawb.logger.info('Start!!!!!!!!!!!', { tjena: 1});

    let request = await ctx.rawb.fetch('http://localhost:4000/bar');
    let result = await request.text();

    let request2 = await ctx.rawb.fetch('http://localhost:5000/baq');
    let result2 = await request2.text();

    ctx.body = 'foo, ' + result + ', ' + result2;

});

app
    .use(router.routes())
    .use(router.allowedMethods());


exports.init = async () => new Promise(resolve => app.listen(3000, resolve));
