'use strict';

const {Router} = require('express');

module.exports = function(app, controller) {
    const router = Router();
    
    router.get('/hello', controller.hello.bind(controller));
    
    return router;
};