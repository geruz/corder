'use strict';

/**
 * Класс описывающий осуществлюящий редирект
 */
module.exports = class RedirectTo {
    constructor (route, ...params) {
        this.route = route;
        this.params = params;
    }
    /**
     * рендер
     * @param {Response} res объет ответа пользователю
     * @returns {undefined}
     */
    result (res) {
        res.redirect(res.locals.route(this.route, ...this.params));
    }
};
