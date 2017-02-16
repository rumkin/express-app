'use strict';

const {format,inspect} = require('util');
const chalk = require('chalk');
const Logger = require('../logger.js');
const formatDate = require('../format-date.js');

function setColour(level, text) {
    switch (level) {
        case 'debug':
        return chalk.bold.blue(text);
        case 'info':
        return chalk.bold.cyan(text);
        case 'warn':
        return chalk.bold.yellow(text);
        case 'error':
        return chalk.bold.red(text);
        case 'fatal':
        return chalk.bgRed.white(text);
        default:
        return chalk.grey(text);
    };
}

module.exports = function(options = {}) {
    const out = options.out || process.stdout;
    const err = options.err || process.stderr;
    const logLevel = options.level || 'ERROR';
    const marker = options.marker || '=>';

    return {
        getMessage(date, level, ...params) {
            let time = formatDate(date);
            let marker_ = setColour(level, marker);
            
            return `[${time}] ${marker_} ${format(...params)}\n`;
        },
        
        log({date, level, params}) {
            if (Logger.compare(level, logLevel) < 0) {
                return;
            }
    
            let msg = this.getMessage(date, level, ...params);
            if (level === 'info') {
                out.write(msg);
            }
            else {
                err.write(msg);
            }
        },
        inspect({date, value}) {
            if (Logger.compare('debug', logLevel) < 0) {
                return;
            }
            
            let message = this.getMessage(date, 'debug', inspect(value, {colors: true}));
            
            err.write(message);
        }
    };
};
