'use strict';

/**
 * Middleware собирающий полный текущий URL запроса
 * Получать порт из запроса и в дальнейшем использовать его при генерации ссылок
 * Нужно для корректной работы нескольких сборок на одном домене и разных портах
 * @param {Request} req - объект запроса
 * @param {Response} res - объект ответа
 * @param {Function} next - следующий шаг
 * @returns {void}
 */
module.exports = (req, res, next) => {
    var protocol = req.connection.encrypted ? 'https' : 'http';
    req.currentUrl = `${protocol}://${req.get('host')}${req.originalUrl}`;
    req.port = req.get('host').split(':')[1] || 80;
    next();
};