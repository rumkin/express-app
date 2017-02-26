'use strict';

const Logger = require('./lib/logger.js');
const Store = require('./lib/store.js');
const baseApp = require('./app.js');
const serverApp = require('./server.js');

const config = require('./config.js');

const logger = new Logger(config.logger);
const app = new Store();

app.config = config;
app.logger = logger;

app.use(baseApp);
app.use(serverApp);

app.server.start(config.http.port, () => {
    logger.info('Server is listening %s', config.http.port);
});

process.on('uncaughtException', (err) => {
    logger.error(err.message, err.stack);
    process.exit(1);
});