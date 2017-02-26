'use strict';

const {Router} = require('express');
const mw = require('../../lib/controller-middleware.js');

module.exports = function(app) {
    const controller = app.greetCtrl;
    const router = Router();
    
    
    router.get('/hello', mw(controller, 'pass'));
    router.get('/hello', mw(controller, 'hello'));
    
    return router;
};