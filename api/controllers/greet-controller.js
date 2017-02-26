'use strict';

const BaseController = require('./base-controller.js');

class GreetController extends BaseController {
    pass(req, res) {
        console.log('Pass');
    }
    
    hello(req, res) {
        console.log('Greet middleware');
        res.render('index.jade');
    }
}

module.exports = GreetController;