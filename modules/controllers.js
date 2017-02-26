'use strict';

const _ = require('lodash');

module.exports = function(options = {}) {
    _.defaults(options, {
        controllers: {},
    });
    
    let controllers = options.controllers;
    
    return function(app) {
        app.controllers = {};
        
        _.forOwn(controllers, (controller, name) => {
            app.logger.debug('Init "%s" controller', name);
            
            let instance = new controller(app);
            app.set(name + 'Ctrl', instance);
            app.controllers[name] = instance;
        });
    };
};