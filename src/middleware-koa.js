const { create } = require('./index');

const createMiddleware = require('./middleware');

const middleware = (options) => {

    const { logger, httpLogger } = create(options, true);

    return async (ctx, next) => {

        createMiddleware(ctx, ctx.request.headers, ctx.path, logger, httpLogger);

        await next();

    };

};

module.exports = middleware;
