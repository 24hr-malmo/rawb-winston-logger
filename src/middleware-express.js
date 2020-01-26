const { create } = require('./create');

const createMiddleware = require('./middleware');

const middleware = (options) => {

    const { logger, httpLogger } = create(options, true);

    return (req, res, next) => {

        createMiddleware(req, req.headers, req.path, logger, httpLogger);

        next();

    };

};

module.exports = middleware;
