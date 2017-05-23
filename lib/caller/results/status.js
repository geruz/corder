'use strict';

/**
 * Класс реализующий ответ с заданным статусом и пустым ответом
 */
module.exports = class Status {
    /**
     * @constructor
     * @param {Integer} status статус ответа
     */
    constructor (status) {
        this.status = +status || 200;
    }
    /**
     * рендер
     * @param {Response} res объект ответа
     * @returns {undefined}
     */
    result (res) {
        res.status(this.status).end();
    }
};
