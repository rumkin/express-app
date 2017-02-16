'use strict';

const BaseController = require('./base-controller.js');

class GreetController extends BaseController {
    hello(req, res) {
        res.render('index.jade');
    }
}

module.exports = GreetController;