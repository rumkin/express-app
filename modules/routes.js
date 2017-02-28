'use strict';

const _ = require('lodash');
const express = require('express');

module.exports = function(options = {}) {
    _.defaults(options, {
        routes: {},
    });
    
    return function(app) {
        const logger = app.logger;
        let router = express.Router();
    
        _.forOwn(options.routes, (fn, key) => {
            logger.debug('Init "%s" router', key);
            router.use(fn(app));
        });
        
        router.use((err, req, res, next) => {
            // Process error
            if (err) {
                req.format({
                    json() {
                        res.status(500).json({
                            error: {
                                code: 'e_unknown',
                                message: err.message,
                            }
                        });
                    },
                    other() {
                        res.status(500).send('Server error:\n' + err.stack);
                    },
                });
                
                logger.error(err);
            }
            else {
                // Nothing found...
                req.format({
                    json() {
                        res.status(404).json({
                            error: {
                                code: 'e_not_found',
                                message: 'Nothing found',
                            }
                        });
                    },
                    other() {
                        res.status(404).send('Nothing found');
                    },
                });
            }
        });
        
        app.server.use(router);
    };
};