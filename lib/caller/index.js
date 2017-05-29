'use strict';

const path = require('path').resolve();
const ViewRender = require('./results/view-render');
const JsonRender = require('./results/json');
const Redirect = require('./results/redirect');
const Status = require('./results/status');
const Content = require('./results/content');
const RedirectTo = require('./results/redirect-to');

const co = require('co');
const query = require('./query.js');


/**
 * Базовый класс контроллера
 */
class Controller {
    constructor (req, res, next, directory) {
        this.req = req;
        this.res = res;
        this.next = next;
        this.directory = directory;
        this.p = query(req);
    }

    /**
     * Отрисовать шаблон
     * @param {String} name название шаблона
     * @param {Object} model модель данных
     * @param {Object} opt опциональные аргументы
     * @returns {ViewRender} ViewRender класс отрисовывающий шаблон
     */
    view (name, model, opt = {}) {
        const viewPath = `${path}/${this.directory}/views/`;
        return new ViewRender(viewPath, name, model, opt);
    }
    /**
     * Вернуть json
     * @param {Object} model модель данных
     * @returns {JsonRender} JsonRender класс выводящий json
     */
    json (model) {
        return new JsonRender(model);
    }

    /**
     * 302 редирект
     * @param {String} url название шаблона
     * @returns {Redirect} Redirect
     */
    redirect (url) {
        return new Redirect(url);
    }


    /**
     * Вернуть пустой ответ с заданным кодом
     * @param {Integer} status название шаблона
     * @returns {Status} Status
     */
    status (status) {
        return new Status(status);
    }

    /**
     * Вернуть пустой ответ с заданным кодом
     * @param {Integer} status название шаблона
     * @param {*} data контекст
     * @returns {Status} Status
     */
    content (status, data) {
        return new Content(status, data);
    }

    redirectTo (route, ...params) {
        return new RedirectTo(route, ...params);
    }
}


/**
 * Класс осуществляющий вызовы методов контроллера
 */
class Caller {
    /**
     * @constructor
     * @param {Constructor} Cl конструктор контроллера
     * @param {String} method название метода который необходимо вызвать
     * @param {String} directory директория
     */
    constructor (Cl, method, directory) {
        this.Cl = Cl;
        this.name = method;
        this.directory = directory;
    }

    static isGenerator (fn) {
        return fn.constructor && fn.constructor.name === 'GeneratorFunction';
    }

    /**
     * Создать middleware в котором будет вызываться метод контроллера
     * @returns {undefined}
     */
    toMiddleware () {
        return (req, res, next) => {
            let alive = true;
            const start = Date.now();
            const isAlive = () => alive = false;
            req.connection.on('close', isAlive);
            req.connection.on('finish', isAlive);
            const clear = () => {
                req.connection.removeListener('close', isAlive);
                req.connection.removeListener('finish', isAlive);
            };
            const contr = new this.Cl(req, res, next, this.directory);
            co(this._call(contr))
                .then(data => {
                    if (!alive) {
                        return;
                    }
                    if (Date.now() - start > 30000) {
                        const message = `Method '${this.name}' of controller '${this.Cl.name}' ` +
                        `timeout: ${Date.now() - start}ms`;
                        throw new Error(message);
                    }
                    if (!data) {
                        const message = `Method '${this.name}' of controller '${this.Cl.name}' ` +
                        `returned bad answer: ${data}`;
                        throw new Error(message);
                    }
                    if (!data.result) {
                        const message = `Method '${this.name}' of controller '${this.Cl.name} ` +
                        "returned answer that doesn't implement method 'result'.";
                        throw new Error(message);
                    }
                    data.result(res);
                })
                .catch(next)
                .then(clear)
                .catch(clear);
        };
    }
   /**
     * Вызов метода
     * @param {Controller} contr экземпляр класса для которого происходит вызов
     * @returns {undefined}
     */
    *_call (contr) {
        return yield *contr[this.name]();
    }

    /**
     * Фабричный метод
     * @param {constructor} Cl конструктор контроллера
     * @param {String} method название метода который необходимо
     * @param {String} directory директория
     * @returns {Error} Middleware в котором будет происходить вызов метода контроллера
     */
    static create (Cl, method, directory) {
        if (typeof Cl === 'undefined') {
            throw new Error('Передан пустой контроллер');
        }
        const contr = new Cl();
        if (typeof contr[method] == 'undefined') {
            throw new Error(`Контроллер ${Cl.name} не реализует метод ${method}`);
        }
        const caller = new Caller(Cl, method, directory);
        return caller.toMiddleware();
    }
}

module.exports.Controller = Controller;
module.exports.call = Caller.create;
module.exports.create = Caller.create;
