'use strict';

const promisifyMiddleware = require('./promisify-middleware.js');

function controllerMiddleware(ctrl, method) {
    if (typeof ctrl[method] !== 'function') {
        throw new Error('Argument #1 should be a function');
    }
    
    return promisifyMiddleware(ctrl[method].bind(ctrl));
}

module.exports = controllerMiddleware;