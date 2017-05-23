'use strict';

class AppConfig {
    constructor () {
        if (process.env.APPS) {
            this.appsRedExp = new RegExp(process.env.APPS);
        }
    }
    isEnable (dir) {
        if (!this.appsRedExp) {
            return true;
        }
        return this.appsRedExp.test(dir);
    }
}
const appConfig = new AppConfig();

//this.domains = domains;
/**
    _prepeare (middleware, name) {
        if (!name) {
            return middleware;
        }
        if (!process.env.USE_LOG_MIDDLEWARE) {
            return middleware;
        }
        return (req, res, next) => {
            log(`next middleware: ${name}`);
            middleware(req, res, next);
        };
    } */


    /**    static getDomains (domains) {
        return function (name){
            if (name === 'root') {
                return domains.root;
            }
            const getSubDomain = name => name && domains[name] || name || null;
            const sd = getSubDomain(name);
            if (sd.startsWith('//')) {
                return sd;
            }
            return `${sd ? `${sd}.` : ''}${domains.root}`;
        }
    } */
    
module.exports = appConfig;