'use strict';

const BaseController = require('./base-controller.js');

class GreetController extends BaseController {
    pass(req, res) {
        this.app.logger.debug('Pass');
    }
    
    hello(req, res) {
        this.app.logger.debug('Greet middleware');
        res.render('index.jade');
    }
}

module.exports = GreetController;