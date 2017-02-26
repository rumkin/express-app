const bodyParser = require('body-parser');
const loggerMiddleware = require('./logger.js');

exports.before = function(app) {
    app.server.use(loggerMiddleware(app.logger));
    app.server.use(bodyParser.json());
};

exports.after = function(app, server) {
    
};