'use strict';

const nameRe = /^(([a-z_][a-z0-9_]*)(\??)(<([^>]+)>)?)/i;
/*eslint-disable complexity*/
/**
 * Класс формирования ссылки
 */
module.exports = class Route {
    /**
     * @constructor
     * @param {String} name название по которому будем получать роут
     * @param {String} domain домен который обслуживается роутом
     * @param {String} path путь обслуживаемый роутом
     * @param {String} method http method
     * @param {Middleware} mddl миддлевеер
     */
    constructor (name, domain, path, method) {
        this.path = this._normalizePath(path);
        this.name = name;
        this.domain = domain;
        this.method = method;
        if (domain.startsWith('//')) {
            this.mask = `${this.domain}${this.path}`;
        } else {
            this.mask = `//${this.domain}:___port___${this.path}`;
        }
        const parts = this.mask.split(':');
        const begin = parts[0];
        this.build = () => begin;
        this.matchRegex = `^http[s]?:${begin}`;
        this.keys = [];
        this.vars = [];
        const regexps = [];

        for (const part of parts.slice(1)) {
            const [, match, name, optional, , regexp] = part.match(nameRe);
            const ended = part.substring(match.length);
            if (name === '___port___') {
                this.keys.push('___port___');
                this.matchRegex += `(:[0-9]+)?${ended}`;
                const prev = this.build;
                this.build = (p, port) => `${prev(p, port)}${port}${ended}`;
            } else if (optional) {
                this.matchRegex += `([^/\\?&#]*)${ended}?`;
                this._addUrlPart(name, ended, false);
            } else if (regexp) {
                regexps.push(regexp);
                this.matchRegex += `(<regexp${regexps.length}>)${ended}`;
                this._addUrlPart(name, ended, true);
            } else {
                this.matchRegex += `([^/\\?&#]*)${ended}`;
                this._addUrlPart(name, ended, true);
            }
        }
        this.matchRegex = this.matchRegex.replace(/\\/g, '\\\\')
                                         .replace(/\./g, '\\.')
                                         .replace(/\//g, '\\/');
        this.matchRegex += '([\?].*)?$';
        regexps.forEach(regexp =>
            this.matchRegex = this.matchRegex.replace(`<regexp${regexps.length}>`, regexp));

        this.matchRegex = new RegExp(this.matchRegex);
    }
    _normalizePath (path) {
        const temp = path[path.length - 1] === '/' ? path : `${path}/`;
        return temp[0] === '/' ? temp : `/${temp}`;
    }

    /**
     * Декорируем функцию формирования url
     * @private
     * @param {String} name название параметра
     * @param {String} ended концовка части строки
     * @param {Boolean} required является ли параметр обязательным
     * @returns {Void} void
     */
    _addUrlPart (name, ended, required) {
        /*eslint-disable no-param-reassign */
        this.vars.push(name);
        const prev = this.build;
        this.keys.push(name);
        this.build = (p, port) => {
            const val = p[name];
            if (typeof val === 'undefined' || val === null) {
                if (required) {
                    throw new Error(`Route: ${this.name}, parameter ${name} not found`);
                }
                delete p[name];
                return prev(p, port);
            }
            delete p[name];
            /*eslint-enable no-param-reassign */
            return prev(p, port) + encodeURIComponent(val) + ended;
        };
    }
    /**
     * Функция возвращающая объект с параметрами из роута если роут
     * подходит или null если не подходит
     * @param {String} fullUrl полный url запроса
     * @returns {Object} параметры из роута или null
     */
    match (fullUrl) {
        const values = fullUrl.match(this.matchRegex);
        if (values === null) {
            return null;
        }
        const params = {};
        for (let i = 0; i < this.keys.length; i++) {
            if (this.keys[i] !== '___port___') {
                params[this.keys[i]] = decodeURIComponent(values[i + 1].replace(/\+/g, '%20'));
            }
        }
        return params;
    }

    /**
     * генерация url
     * @param {Number} port порт для которого генерируем ссылки
     * @params {[]Object} param параметры для формирования url
     * @returns {String} url
     */
    generate (port, ...params) {
        const portStr = port && port !== 80 ? `:${port}` : '';
        const p = {};
        for (const param of params) {
            if (Array.isArray(param)) {
                Object.assign(p, ...param);
            } else {
                Object.assign(p, param);
            }
        }

        const url = this.build(p, portStr);
        const queryNames = new Set(Object.keys(p));
        if (queryNames.size === 0) {
            return url;
        }

        const remains = name => queryNames.has(name);

        const addToMap = (m, param) => {
            if (!param) {
                return m;
            }

            if (Array.isArray(param)) {
                param.forEach(p => addToMap(m, p));
                return m;
            }

            Object.keys(param)
                .filter(remains)
                .forEach(name => m.set(name, param[name]));

            return m;
        };

        const m = params.reduce(addToMap, new Map());

        return `${url}${this._generateForMap(m)}`;
    }

    _generateForMap (params) {
        const query = [];
        const add = (name, value) => query.push(`${name}=${encodeURIComponent(value)}`);

        let _anc = '';
        for (const [name, value] of params) {
            if (name === '#') {
                _anc = `#${value}`;
            } else if (Array.isArray(value)) {
                value.forEach(v => add(name, v));
            } else {
                add(name, value);
            }
        }
        let result = '';
        if (query.length) {
            result += `?${query.join('&')}`;
        }
        return `${result}${_anc}`;
    }
};
