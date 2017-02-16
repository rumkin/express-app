'use strict';

const _ = require('lodash');

module.exports = class BaseController {
    constructor(app, options) {
        this.app = app;
        this.options = _.merge({}, options);
    }
};