const { create, generateRandomId } = require('./create');

module.exports = {
    generateRandomId,
    create,
    middlewareKoa: require('./middleware-koa'),
    middlewareExpress: require('./middleware-express'),
    middlewareRestify: require('./middleware-restify'),
}

