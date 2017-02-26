'use strict';

const _ = require('lodash');
const express = require('express');

module.exports = function(options = {}) {
    _.defaults(options, {
        port: 8080,
        host: '0.0.0.0',
        middlewares: [],
        engine: 'pug',
    });
    
    return function(app) {
        let server = express();
        
        server.set('view engine', options.engine);
            
        options.middlewares.forEach((middleware) => server.use(middleware));
        
        app.server = {
            express: server,
            use(...args) {
                this.express.use(...args);
                return this;
            },
            start(port, host, fn) {
                if (this._http) {
                    throw new Error('Already started');
                }
                
                let count;
                if (typeof arguments[arguments.length - 1] === 'function') {
                    count = arguments.length - 1;
                }
                else {
                    count = arguments.length;
                    fn = function() {
                        app.logger.info('Server started at %s:%s', host, port);
                    };
                }
                
                if (count === 1) {
                    host = options.host;
                }
                else if (count === 0) {
                    port = options.port;
                    host = options.host;
                }
                
                this._http = this.express.listen(port, host, fn);
                return this;
            },
            stop() {
                this._http.stop();
                this._http = null;
                return this;
            }
        };
    };
};