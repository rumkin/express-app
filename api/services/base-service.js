'use strict';

const _ = require('lodash');

class BaseService {
    constructor(app, options) {
        this.app = app;
        this.options = _.merge({}, options);
    }
};

class ServiceOptions {
    getDefaults() {
        return {};
    }
    
    constructor(options = {}) {
        let defaults = this.getDefaults();
        Object.assign(this, defaults);
    
        this.append(options);
    }
    
    append(options) {
        for(let k of Object.getOwnPropertyNames(this)) {
            let method = 'set' + k[0].toUpperCase() + k.slice(1);
            if (typeof this[method] === 'function') {
                this[method](options[k]);
            }
            else if (options.hasOwnProperty(k)) {
                this[k] = options[k];
            }
        }
    }
    
    valueOf() {
        let result = {};
        
        for(let k of Object.getOwnPropertyNames(this)) {
            let method = 'get' + k[0].toUpperCase() + k.slice(1);
            if (typeof this[method] === 'function') {
                result[k] = this[method]();
            }
            else {
                result[k] = this[k];
            }
        }
        
        return result;
    }
}

module.exports = BaseService;
BaseService.Options = ServiceOptions