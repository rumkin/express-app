'use strict';

const _ = require('lodash');
const {models, services} = require('./api');
const mongoose = require('./modules/mongoose.js');

function baseApp(app) {
    const {config, logger} = app;
    
    _.forOwn(models, (model, name) => {
        app.set(name, model);
        logger.debug('Model "%s" added', name);
    });
    
    mongoose(config.mongoose)
    .then(() => {
        logger.info('Mongodb connected');
    })
    .catch((err) => {
        logger.error(err);
        process.exit(1);
    });
    
    let services_ = {};
    
    _.forOwn(services, (service, name) => {
        services_[name] = app.set(name + 'Srv', new service(app));
    });
    
    app.services = services_;
    app.models = models;
}

module.exports = baseApp;