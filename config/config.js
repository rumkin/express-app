exports.http = {
    host: 'localhost',
    port: 8080, 
};

exports.logger = {
    level: process.env.DEBUG ? 'debug' : 'info',
};

exports.mongoose = {
    host: 'localhost',
    port: 27017,
    base: 'test',
};