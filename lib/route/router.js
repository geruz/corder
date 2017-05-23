'use strict';

const Route = require('./route');

/**
 * Класс работы с коллекцией роутов
 */
class Router {
    /**
     * @constructor
     * роуты
     */
    constructor () {
        this._table = {};
        this._methods = {};
    }

    /**
     * Добавляем роут
     * @param {String} name название роута
     * @param {Method} method метод которым идёт запрос
     * @param {Method} domain домен запроса
     * @param {Method} path обслуживаемый путь
     * @returns {Void} void
     */
    add (name, method, domain, path) {
        const route = new Route(name, domain, path, method);
        this._addRoute(name, method, route);
    }

    /**
     * Получить роут по имени и методу
     * @param {String} name название роута
     * @param {String} method метод запроса (если не передавать то get)
     * @returns {Route|null} роут или null если не удалось найти
     */
    find (name) {
        if (!this._table[name]) {
            return null;
        }
        return this._table[name] || null;
    }


    /**
     * @param {String} method метод которым идёт запрос
     * @param {String} fullUrl url запроса
     * @returns {[Route, Object]|[null, null]} роут или null
     */
    match (method, fullUrl) {
        const byMethods = this._methods[method.toLowerCase()] || [];
        for (const route of byMethods) {
            const params = route.match(fullUrl);
            if (params !== null) {
                return [route, params];
            }
        }
        return [null, null];
    }

    /**
     * Добавить правила другого роута
     * @param {Router} router роутер правила которого добавляем
     * @returns {Void} void
     */
    join (router) {
        Object.keys(router._table).forEach(
            name => {
                const r = router._table[name];
                this._addRoute(name, r.method, r);
            }
        );
    }
    /**
     * Добавить правила другого роута
     * @private
     * @param {String} name название роута
     * @param {String} method http метод
     * @param {Route} route роут
     * @returns {Void} void
     */
    _addRoute (name, method, route) {
        if (this._table[name]) {
            throw new Error(`Duplicate route ${name}`);
        }
        this._table[name] = route;
        this._methods[method] = this._methods[method] || [];
        this._methods[method].push(route);
    }
    /**
     * Генерация url по имени роута
     * @param {String} name название роута
     * @param {Object} params объект параметров запроса
     * @param {String} method метод запроса (по умолчанию get)
     * @returns {String} url запроса
     */
    build (name, params) {
        if (!this._table[name]) {
            throw new Error(`No route found with the name: ${name}`);
        }
        const route = this._table[name];
        return route.generate(params);
    }
}



module.exports = Router;
