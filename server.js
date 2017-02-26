'use strict';

const {routes, controllers} = require('./api');
const middlewares = require('./middlewares');

function server(app) {
    const config = app.config;
    
    app.use(require('./modules/server.js')(config.http));
    app.use(require('./modules/controllers.js')({controllers}));
    app.use(middlewares.before);
    app.use(require('./modules/routes.js')({routes}));
    app.use(middlewares.after);
    
    return app;
}


module.exports = server;