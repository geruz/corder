'use strict';
const path = require('path');
const Router = require('./route/router');
const Registrator = require('./route/registrator.js');
const caller = require('./caller');

class RouteHelper {
    constructor (factory, router, getDomain, stick) {
        this.factory = factory;
        this.router = router;
        this.mountPoint = '/';
        this.domain = 'root';
        this.getDomain = getDomain;
        this.stick = stick;
    }
    mount (domain, mountPoint) {
        this.mountPoint = mountPoint;
        this.domain = domain;
        return this;
    }
    get (path, name) {
        return this._add('get', path, name);
    }
    post (path, name) {
        return this._add('post', path, name);
    }
    put (path, name) {
        return this._add('put', path, name);
    }
    head (path, name) {
        return this._add('head', path, name);
    }
    delete (path, name) {
        return this._add('delete', path, name);
    }
    options (path, name) {
        return this._add('options', path, name);
    }
    _add (httpMethod, path, name) {
        this.router.add(name, httpMethod, this._domain(), this._fullPath(path));
        this.stick(name, this.factory.getByName(name));
        return this;
    }

    _fullPath (path) {
        return `${this.mountPoint}${path}`;
    }
    _domain () {
        return this.getDomain(this.domain);
    }
}
class CallerFactory {
    constructor (dir, ...cfgs) {
        this.cfgs = cfgs;
        this.dir = dir;
    }
    getByName (ruleName) {
        for (const cfg of this.cfgs) {
            if (cfg[ruleName]) {
                return caller.create(cfg.controller, cfg[ruleName], this.dir);
            }
        }
        throw new Error(`не найдено соответсвие роутесу ${ruleName}`);
    }
}

/**
 * Одно микроприложение, подключаемое в аурум
 */
class SubApp {

    /**
     * @constructor
     * @param {String} dir папка в которой находится приложение
     * @param {String} getDomain домен в котором находится приложение
     */
    /*eslint-disable */
    constructor (dir, getDomain) {
        this.router = new Router();
        this.stickers = [];
        this.dir = dir;
        this.getDomain = getDomain;
        this.mddls = [];
        require(path.resolve(`${dir}/app`))(this);
    }
    use(mddl) {
        const pr = this.mddls;
        this.mddls.push(mddl);
    }
    links (rules, ...cfg) {
        const stick = (name, caller) => this.stickers[name] = caller;
        const factory = new CallerFactory(this.dir, ...cfg);
        rules(new RouteHelper(factory, this.router, this.getDomain, stick));
    }
    static onlyRouter(dir, getDomain){
        const router = new Router();
        const f = require(`${dir}/app-routing`);
        f(new Registrator(router, getDomain));
        return router;
    }

    mount () {
        let middlware = (req, res, next) => this.stickers[req.route.name](req, res, next);
        for (let i = this.mddls.length - 1; i >= 0; i--) {
            const m = this.mddls[i];
            const prev = middlware;
            middlware = function (req, res, next){
                return m(req, res, function (err) {
                    if (err) {
                        return next(err);
                    }
                    prev(req, res, next);
                });
            };
        }

        return (req, res, next) => {
            const [route, params] = this.router.match(req.method, req.currentUrl);
            if (route !== null) {
                res.locals.currentRoute = route;
                Object.assign(req.params, params);
                Object.keys(params).filter(key => params[key] === "").forEach(key => params[key] = undefined)
                res.locals.currentRouteParams = params;
                req.route = route;
                return middlware(req, res, next);
            }
            return next();
        };
    }
    /*eslint-enable */
}
module.exports = SubApp;
