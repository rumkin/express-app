'use strict';

const mongoose = require('mongoose');
const bluebird = require('bluebird');

mongoose.Promise = bluebird;

module.exports = function(config) {
    return mongoose.connect(`mongodb://${config.host}:${config.port}/${config.base}`);
};