const { create, generateRandomId } = require('./create');

module.exports = {
    generateRandomId,
    create,
    middlewareKoa: require('./middleware-koa'),
    middlewareRestify: require('./middleware-restify'),
}

