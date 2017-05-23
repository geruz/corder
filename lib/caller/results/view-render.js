'use strict';

/**
 * Класс осуществляющий рендер jade шаблонов
 */
module.exports = class JadeRender {
    /**
     * @constructor
     * @param {String} path путь до папки с шаблоном
     * @param {String} name название шаблона
     * @param {Object} model модель данных
     * @param {Integer} status код HTTP ответа
     */
    constructor (path, name, model, {status = 200} = {}) {
        this.path = path;
        this.model = model;
        this.name = name;
        this.status = status;
    }
    /**
     * Рендер результата
     * @param {Response} res объект запроса
     * @returns {undefined}
     */
    result (res) {
        if (this.status !== 200) {
            res.status(this.status);
        }
        res.render(`${this.path}${this.name}`, this.model);
    }
};
