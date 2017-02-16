const chalk = require('chalk');

module.exports = function(logger) {
    return function (req, res, next) {
        res.on('finish', () => {
            let status = res.statusCode;
            let method = req.method;
            let url = req.url;
            
            if (status > 399) {
                method = chalk.red(method);
            }
            else if (status > 299) {
                method = chalk.yellow(method);
            }
            else {
                method = chalk.green(method);
            }
            
            logger.info('%s %s %s', status, method, url);
        });
        next();
    }
}