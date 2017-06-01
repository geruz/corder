'use strict';

const path = require('path');
const http = require('http');
const express = require('express');
const SubApp = require('./subapp');
const Router = require('./route/router');
const Registrator = require('./route/registrator.js');
const log = require('./log')('aurum:core').debug;

const Scheduler = require('./scheduler');
const currentUrlMddl = require('./mddls/current-url');

/**
 * Класс большого приложения aurum состоящего из маленьких
 */
class Aurum {
    /**
     * @constructor
     */
    constructor (config) {
        this.app = express();
        this.app.use(currentUrlMddl);
        this.config = config;
        this.router = new Router();
        this.scheduler = new Scheduler();
    }

    /**
     * Добавить промежуточный обработчик
     * @param {Middleware|Array<Middleware>} middleware промежуточный обработчик
     * @param {String=} name название обработчика
     * @returns {undefined} void
     */
    use (path, middleware) {
        if (!middleware) {
            throw new Error(`middleware is ${middleware}`);
        }
        if (middleware instanceof Array) {
            middleware.forEach((mddl, index) => this.use(mddl, `${name}[${index}]`));
        } else {
            this.app.use(path, middleware);
        }
    }

    /**
     * Примонтировать микроприложение
     * @param {String} dir папка где находится приложение
     * @returns {Void} void
     */
    mount (...parts) {
        const dir = path.join(...parts);
        if (this.config.enableApp(dir)) {
            const subapp = new SubApp(dir, this.config.getDomain);
            this.router.join(subapp.router);
            this.app.use(subapp.mount());
            log(`Приложение примонтировано: ${dir}`);
        } else {
            this.router.join(SubApp.onlyRouter(dir, this.config.getDomain));
            log(`Приложение проигнорировано: ${dir}`);
        }
    }
    addRoutes (f) {
        f(new Registrator(this.router, this.config.getDomain));
    }
    /**
     * Старт приложения
     * @param {Number} port номер порта на котором стартуем
     * @returns {Void} void
     */
    run (port) {
        this.app.set('view engine', 'pug');
        const server = http.createServer(this.app);
        server.listen(port || 3000);
        this.scheduler.run();
    }

    /**
     * Добавление задачи в планировщик
     * @param {Generator} task - задача
     * @param {Integer} interval - переодичность запуска в минутах
     * @param {String} name - название задачи
     * @returns {undefined}
     */
    scheduler (task, interval, name) {
        this.scheduler.add(task, interval, name);
    }
}

module.exports = Aurum;
