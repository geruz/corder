'use strict';

const debug = require('debug');

const currLevel = function () {
    try {
        //return settings.get('log-level');
    } catch (e) {
        return 0;
    }
};
const print = (level, l, data) => {
    if (level < currLevel()) {
        return;
    }
    l(data);
};
/*eslint-disable no-console*/
const jsonStyle = label => data => {
    if (data instanceof Error) {
        const res = Object.assign({
            '@label': label,
            '@text': data.message,
            '@type': 'error',
            stack: data.stack,
        }, data);
        delete res.message;
        console.log(JSON.stringify(res));
    } else {
        console.log(JSON.stringify({
            '@label': label,
            '@text': data,
            '@type': 'debug',
        }));
    }
};
const logF = process.env.LOG_TYPE === 'json' ? jsonStyle : debug;

module.exports = name => {
    const l = logF(name);
    const defaultLog = data => print(3, l, data);
    return Object.assign(defaultLog, {
        debug: data => print(0, l, data),
        info: data => print(1, l, data),
        message: data => print(2, l, data),
        warning: data => print(2, l, data),
        error: data => print(3, l, data),
        critical: data => print(4, l, data),
        emerge: data => print(5, l, data),
    });
};
