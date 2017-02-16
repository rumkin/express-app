'use strict';

const express = require('express');
const _ = require('lodash');
const {routes, controllers, models, services} = require('./api');
const middlewares = require('./middlewares');
const Store = require('./lib/store.js');
const mongoose = require('./modules/mongoose.js');

function server(config, logger) {
    const store = new Store();
    
    store.set('config', config);
    store.set('logger', logger);
    
    let services_ = {};
    
    _.forOwn(controllers, (controller, name) => {
        store.set(name + 'Ctrl', new controller(store));
        logger.debug('Init "%s" controller', name);
    });
    
    _.forOwn(models, (model, name) => {
        store.set(name, model);
        logger.debug('Model "%s" added', name);
    });
    
    _.forOwn(services, (service, name) => {
        services_[name] = store.set(name + 'Srv', new service(store));
    });
    
    store.set('services', services_);
    store.set('models', models);
    
    mongoose(config.mongoose)
    .then(() => {
        logger.info('Mongodb connected');
    })
    .catch((err) => {
        logger.error(err);
        process.exit(1);
    });
    
    const app = express();
    app.set('view engine', 'pug')
    
    middlewares.before(store, app);
    
    let router = express.Router();
    
    // API Controllers
    
    _.forOwn(routes, (fn, key) => {
        router.use('/' + key, fn(store, store.get(key + 'Ctrl')));
        logger.debug('Init "%s" controller router', key);
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
    
    app.use(config.http.urlPrefix || '/', router);
    
    middlewares.after(store, app);
    
    return app;
}


module.exports = server;