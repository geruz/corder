'use strict';

/**
 * Класс реализующий ответ с заданным статусом и пустым ответом
 */
module.exports = class Content {
    /**
     * @constructor
     * @param {Integer} status статус ответа
     * @param {Buffer} content тело ответа
     */
    constructor (status, content) {
        this.status = +status || 200;
        this.content = content;
    }
    /**
     * рендер
     * @param {Response} res объект ответа
     * @returns {undefined}
     */
    result (res) {
        res.status(this.status).send(this.content).end();
    }
};
