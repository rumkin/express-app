'use strict';

const path = require('path');

const LEVELS = [
    'debug',
    'info',
    'warn',
    'error',
    'fatal',
    'none',
];

function compare(a, b) {
    let ai = LEVELS.indexOf(a);
    let bi = LEVELS.indexOf(b);

    if (bi === ai) {
        return 0;
    }

    if (ai < 0) {
        return -1;
    }

    if (bi < 0) {
        return 1;
    }

    return ai - bi;
}

class Logger {
    static compare(a, b) {
        return compare(a, b);
    }

    constructor(options = {}) {
        this._reporters = [];
        let level;
        if ('level' in options) {
            level = options.level.toLowerCase();
        } else {
            level = 'info';
        }
        
        let reporters = options.reporters || [{
            type: 'std',
            level,
        }];

        reporters.forEach((reporter) => {
            let factory = require(path.join(__dirname, 'logger-reporters', reporter.type));
            this._reporters.push(factory(reporter));
        });
    }

    debug(...params) {
        this._log('debug', params);
    }

    info(...params) {
        this._log('info', params);
    }

    log(...params) {
        this._log('info', params);
    }

    warn(...params) {
        this._log('warn', params);
    }

    error(...params) {
        this._log('error', params);
    }

    fatal(...params) {
        this._log('fatal', params);
    }
    
    inspect(value) {
        this.reporters((reporter) => {
            reporter.inspect({date: new Date(), value});
        });
    }

    _log(level, params) {
        this.reporters((reporter) => {
            reporter.log({date: new Date(), level, params});
        });
    }
    
    reporters(fn) {
        this._reporters.forEach((r) => fn(r));
    }
}

module.exports = Logger;