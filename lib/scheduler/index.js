'use strict';

const co = require('co');
const log = require('../log')('aurum:scheduler');

/**
 * Класс запускающий задачи по расписанию
 */
class Scheduler {
    /**
     * @constructor
     */
    constructor () {
        this.tasks = [];
    }
    /**
     * Добавить задачу (задача запуститься после старта шедулера)
     * @param {Generator} task задача которую необходимо выполнить
     * @param {int} interval интервал в минутах между запусками задачи
     * @param {String} name название задачи
     * @returns {undefined}
     */
    add (task, interval, name) {
        this.tasks.push({task: task, interval: interval, name: name || task.constructor.name});
    }
    /**
     * Старт шедулера
     * @returns {undefined}
     */
    run () {
        const minute = 1000 * 60;
        const runner = [];
        for (const t of this.tasks) {
            runner.push(setTimeout(function work () {
                co(t.task)
                    .catch(log.error)
                    .then(() => setTimeout(work, t.interval * minute));
            }, t.interval * minute));
        }
    }
}

module.exports = Scheduler;
