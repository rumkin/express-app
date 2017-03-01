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
        
        router.use((error, req, res, next) => {
            // Process error
            if (error) {
                req.format({
                    json() {
                        // TODO send error in dev mode
                        res.status(500).json({
                            error: {
                                code: 'unknown',
                                message: error.message,
                                details: {},
                            }
                        });
                    },
                    other() {
                        res.status(500).send('Server error:\n' + error.stack);
                    },
                });
                
                logger.error(error);
            }
            else {
                // Nothing found...
                req.format({
                    json() {
                        res.status(404).json({
                            error: {
                                code: 'not_found',
                                message: 'Nothing found',
                                details: {
                                    url: req.url,
                                },
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