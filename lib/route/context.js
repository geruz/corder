'use strict';

module.exports = class RouteContext {
    constructor (...objs) {
        this._params = Object.assign({}, ...objs);
    }
    get params () {
        return Object.assign({}, this._params);
    }
    static create (...objs) {
        const arr = objs.filter(obj => obj).map(obj => obj.routeParams ? obj.routeParams : obj);
        return new RouteContext(...arr);
    }
};
