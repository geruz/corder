'use strict';

class RouteBuilder {
    constructor (router, port) {
        this.port = port || '';
        this.router = router;
    }
    route (name, ...params) {
        const route = this._find(name);
        return route.generate(this.port, ...params || []);
    }
    _find (name, method) {
        if (!name) {
            throw new Error(`Bad routes name: '${name}'`);
        }
        const route = this.router.find(name, method);
        if (route === null) {
            throw new Error(`No route found with the name: '${name}'`);
        }
        return route;
    }
}

const urlReg = /^(\/)|(http[s]?:\/\/)/;
module.exports = router => {
    if (typeof router === 'undefined') {
        throw new Error('router is undefined');
    }
    return (req, res, next) => {
        const builder = new RouteBuilder(router, req.port);
        const route = function (name, ...params) {
            if (urlReg.test(name)) {
                return name;
            }
            return builder.route(name, ...params);
        };
        res.locals.route = route;
        next();
    };
};