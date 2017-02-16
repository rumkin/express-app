'use strict';

function rpad(value, pad, length) {
    let str = String(value);
    
    if (str.length > length) {
        return str;
    }
    
    return (
        str + pad.repeat(Math.ceil(length - str.length)/pad.length)
    ).slice(-length);
}

function lpad(value, pad, length) {
    let str = String(value);
    
    if (str.length > length) {
        return str;
    }
    
    return (
        pad.repeat(Math.ceil(length - str.length)/pad.length) + str
    ).slice(-length);
}

function formatDate(date) {
    return date.getFullYear()
        + '-' + lpad((date.getMonth() + 1), '0', 2)
        + '-' + lpad(date.getDate(), '0', 2)
        + ' ' + lpad(date.getHours(), '0', 2)
        + ':' + lpad(date.getMinutes(), '0', 2)
        + ':' + lpad(date.getSeconds(), '0', 2)
        + '.' + rpad(date.getMilliseconds(), '0', 3)
}

module.exports = formatDate;