'use strict';
const encodeUrl = require('encodeurl');
/**
 * Класс описывающий осуществлюящий редирект
 */
module.exports = class Redirect {
    /**
     * @constructor
     * @param {String} url url куда нужно перевести пользователя
     */
    constructor (url) {
        this.url = url;
    }
    /**
     * рендер
     * @param {Response} res объект ответа пользователю
     * @returns {undefined}
     */
    result (res) {
        res.redirect(encodeUrl(this.url));
    }
};
