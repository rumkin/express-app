'use strict';

const Promise = require('bluebird');

function promisifyMiddleware(middleware) {
    return function(req, res, next) {
        Promise.try(function(){
            return middleware(req, res);
        })
        .then(() => {
            if (! res.finished) {
                setImmediate(next);
            }
        })
        .catch(next);
    };
}

module.exports = promisifyMiddleware;