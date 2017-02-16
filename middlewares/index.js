const bodyParser = require('body-parser');
const loggerMiddleware = require('./logger.js');

exports.before = function(app, server) {
    server.use(loggerMiddleware(app.logger));
    server.use(bodyParser.json());
};

exports.after = function(app, server) {
    
};