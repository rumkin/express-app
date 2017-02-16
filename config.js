'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const dir = process.env.CONFIG || 'config';

loadConfig(dir, exports);

function loadConfig(dir, config) {
    fs.readdirSync(dir).forEach((file) => {
       let ext = path.extname(file);
       
       if (ext !== '.js') {
           return;
       }
       
       let filepath = path.resolve(dir, file);
       
       if (! fs.statSync(file).isFile()) {
           return;
       }
       
       _.merge(config, require(filepath));
    });
}