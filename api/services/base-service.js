'use strict';

const _ = require('lodash');

module.exports = class BaseService {
    constructor(app, options) {
        this.app = app;
        this.options = _.merge({}, options);
    }
};