'use strict';

const Route = require('./route');

const [UnitTest, assert] = require('ruban').Full;
const empty = function () { };

/*eslint-disable require-jsdoc */

class RouteTest extends UnitTest {
    *'Проверяем определение переменных из маски' () {
        const route = new Route('test.router', 't.test.ru', '/:var/', empty);
        assert.equal(route.vars[0], 'var');
    }
    *'Проверяем определение c двумя переменными переменных из маски' () {
        const route = new Route('test.router', 't.test.ru', '/:var/id/:id', empty);
        assert.include(route.vars, 'var');
        assert.include(route.vars, 'id');
        assert.lengthOf(route.vars, 2);
    }
    *'Проверяем что переменные с доменом тоже учитываются' () {
        const route = new Route('test.router', ':area.test.ru', '/:var/id/:id', empty);
        assert.include(route.vars, 'var');
        assert.include(route.vars, 'id');
        assert.include(route.vars, 'area');
        assert.lengthOf(route.vars, 3);
    }
    *'Если не передать параметры то они будут восприниматься как пустой объект' () {
        const route = new Route('test.router', 't.test.ru', '/', empty);
        const url = route.generate();
        assert.equal(url, '//t.test.ru/');
    }
    *'Генерация url с необязательным параметром' () {
        const route = new Route('test.router', 't.test.ru', '/:data?', empty);
        const url = route.generate(80, {data: 12});
        assert.equal(url, '//t.test.ru/12/');
    }
    *'Генерация url без необязательным параметром' () {
        const route = new Route('test.router', 't.test.ru', '/:data?', empty);
        const url = route.generate(80, {});
        assert.equal(url, '//t.test.ru/');
    }

    *'Добавление слеша если он не был передан в path' () {
        const route = new Route('test.router', 't.test.ru', ':var/', empty);
        const url = route.generate(80, {var: 12});
        assert.equal(url, '//t.test.ru/12/');
    }
    *'Проверяем что пустой path равен /' () {
        const route = new Route('test.router', 't.test.ru', '', empty);
        const url = route.generate(80, {});
        assert.equal(url, '//t.test.ru/');
    }
    *'Проверяем генерацию url' () {
        const route = new Route('test.router', 't.test.ru', '/:var/', empty);
        const url = route.generate(80, {var: 12});
        assert.equal(url, '//t.test.ru/12/');
    }
    *'Проверяем что компоненты url проходят через encode' () {
        const route = new Route('test.router', 't.test.ru', '/:var/', empty);
        const url = route.generate(80, {var: 'Русский'});
        assert.equal(url, '//t.test.ru/%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9/');
    }
    *'Проверяем что компоненты домена проходят через encode' () {
        const route = new Route('test.router', ':var.test.ru', '/', empty);
        const url = route.generate(80, {var: 'Русский'});
        assert.equal(url, '//%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9.test.ru/');
    }

    *'Проверяем генерацию с портом' () {
        const route = new Route('test.router', ':var.test.ru', '/:id', empty);
        const url = route.generate(3000, {var: 'Русский', id: 12});
        assert.equal(url, '//%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9.test.ru:3000/12/');
    }
    *'При отсутствии параметра кидаем exception' () {
        const route = new Route('test.router', ':var.test.ru', '/', empty);
        assert.throws(() => route.generate(80, {a: 'Русский'}));
    }
    *'Параметры что не участвуют в маске должны быть перечислены в query' () {
        const route = new Route('test.router', ':area.test.ru', '/', empty);
        const url = route.generate(80, {area: 'forum', page: 1});
        assert.equal(url, '//forum.test.ru/?page=1');
    }
    *'Query параметры должны проходить через encode' () {
        const route = new Route('test.router', ':area.test.ru', '/', empty);
        const url = route.generate(80, {area: 'forum', var: 'Русский'});
        assert.equal(url, '//forum.test.ru/?var=%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9');
    }
    *'Проверяем метод проверки на совпадение' () {
        const route = new Route('test.router', ':area.test.ru', '/', empty);
        const match = route.match('http://forum.test.ru/');
        assert.ok(match);
    }
    *'Проверяем метод проверки на совпадение c query параметрами' () {
        const route = new Route('test.router', ':area.test.ru', '/', empty);
        const match = route.match('http://forum.test.ru/?page=12');
        assert.ok(match);
    }
    *'Проверяем метод проверки на совпадение c необязательным параметром когда он есть (1)' () {
        const route = new Route('test.router', ':area.test.ru', '/:filter?/', empty);
        const match = route.match('http://forum.test.ru/qwe/');
        assert.ok(match);
    }
    *'Проверяем метод проверки на совпадение c необязательным параметром когда он есть (2)' () {
        const route = new Route('test.router', 'test.ru', '/my/dialogs/:filter?/', empty);
        const match = route.match('http://test.ru/my/dialogs/qwe/');
        assert.ok(match);
    }
    *'Проверяем получение значения необязательного параметра' () {
        const route = new Route('test.router', 'test.ru', '/my/dialogs/:filter?/', empty);
        const match = route.match('http://test.ru/my/dialogs/qwe/');
        assert.ok(match);
    }
    *'Проверяем метод проверки на совпадение c необязательным параметром когда его нет' () {
        const route = new Route('test.router', ':area.test.ru', '/:filter?', empty);
        const match = route.match('http://forum.test.ru/test/');
        assert.equal(match.filter, 'test');
    }
    *'Проверяем метод проверки на совпадение по регулярке' () {
        const route = new Route('test.router', 'test.ru', '/:id<[01]+>', empty);
        const match = route.match('http://test.ru/00011101/');
        assert.equal(match.id, '00011101');
    }
    *'Формирование ссылки с параметром с регуляркой' () {
        const route = new Route('test.router', 'test.ru', '/:id<[01]+>', empty);
        const url = route.generate(80, {id: 5});
        assert.equal(url, '//test.ru/5/');
    }
    *'Проверяем автоматическое добавление закрывающего слеша' () {
        const route = new Route('test.router', ':area.test.ru', '/my', empty);
        const url = route.generate(80, {area: 'forum', page: 1});
        assert.equal(url, '//forum.test.ru/my/?page=1');
    }
    *'Сохранение порядка параметров переданных в массиве' () {
        const route = new Route('test.router', 'test.ru', '/', empty);
        const url = route.generate(80, [{a: 1}, {b: 2}, {e: 5}, {d: 4}, {c: 3}]);
        assert.equal(url, '//test.ru/?a=1&b=2&e=5&d=4&c=3');
    }
    *'Сохранение порядка параметров переданных через аргументы' () {
        const route = new Route('test.router', 'test.ru', '/', empty);
        const url = route.generate(80, {a: 1}, {b: 2}, {e: 5}, {d: 4}, {c: 3});
        assert.equal(url, '//test.ru/?a=1&b=2&e=5&d=4&c=3');
    }
    *'Не должно быть квери параметров при параметре состоящего из пустого списка' () {
        const route = new Route('test.router', 'test.ru', '/', empty);
        const url = route.generate(80, {a: []});
        assert.equal(url, '//test.ru/');
    }
    *'Если единственным параметром является # хэш, формируется URL с хэшем' () {
        const route = new Route('test.router', 'test.ru', '/', empty);
        const url = route.generate(80, {'#': 'hash'});
        assert.equal(url, '//test.ru/#hash');
    }
    *'Если для формирования квери-парамертов остался только «#», то не ставить «?»' () {
        const route = new Route('test.router', ':area.test.ru', '/:p', empty);
        const url = route.generate(80, {p: 'action', area: 'aria', '#': 'hash'});
        assert.equal(url, '//aria.test.ru/action/#hash');
    }

    _genMatch () {
        return {
            p: [
                {domain: ':area.test.ru', location: '/', test: 'http://forum.test.ru/'},
                {domain: ':area.test.ru', location: '/:id/', test: 'http://forum.test.ru/12/'},
                {
                    domain: ':area.test.ru',
                    location: '/:id/name/:name/',
                    test: 'http://forum.test.ru/12/name/geruz/'},
            ],
            n: p => `${p.test} должен попадать под маску ${p.domain}${p.location}`,
            b: function *(p) {
                const route = new Route('test.router', p.domain, p.location, empty);
                const match = route.match(p.test);
                assert.isNotNull(match);
            },
        };
    }
    _genMatchDeep () {
        return {
            p: [
                {
                    domain: 'test.ru',
                    location: '/',
                    url: 'http://test.ru/',
                    test: { },
                },
                {
                    domain: ':area.test.ru',
                    location: '/',
                    url: 'https://forum.test.ru/',
                    test: {area: 'forum'},
                },
                {
                    domain: ':area.test.ru',
                    location: '/:id/',
                    url: 'http://forum.test.ru/12/',
                    test: {area: 'forum', id: '12'}},
                {
                    domain: ':area.test.ru',
                    location: '/:id/name/:name/',
                    url: 'https://forum.test.ru/12/name/geruz/',
                    test: {area: 'forum', id: '12', name: 'geruz'},
                },
            ],
            n: p => `p.test должен совпадать с моделью полученной из ${p.url}`,
            b: function *(p) {
                const route = new Route('test.router', p.domain, p.location, empty);
                const matches = route.match(p.url);
                assert.deepEqual(matches, p.test);
            },
        };
    }
}

exports.RouteTest = RouteTest;
