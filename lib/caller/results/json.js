'use strict';

/**
 * Класс выполнящий рендер в json
 */
module.exports = class JsonRender {
    /**
     * @constructor
     * @param {Object} model данные которые необходимло вернуть в формате json
     * @param {Number} status http статус response ответа
     */
    constructor (model, status = 200) {
        this.model = model;
        this.status = status;
    }
    /**
     * Рендер результат
     * @param {Response} res объет ответа
     * @returns {undefined}
     */
    result (res) {
        res.status(this.status).json(this.model);
    }
};
