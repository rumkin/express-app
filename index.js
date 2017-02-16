'use strict';

const config = require('./config.js');
const Logger = require('./lib/logger.js');
const server = require('./server.js');

const logger = new Logger(config.logger);

server(config, logger)
.listen(config.http.port, () => {
    logger.info('Server is listening %s', config.http.port);
});