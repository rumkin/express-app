'use strict';

const {Router} = require('express');

module.exports = function(app) {
    const controller = app.greetCtrl;
    const router = Router();
    
    
    router.get('/hello', controller.hello.bind(controller));
    
    return router;
};