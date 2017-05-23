'use strict';

const Router = require('./router');
const Route = require('./route');

const [UnitTest, assert] = require('ruban').Full;

class RouterTests extends UnitTest {

    *'Получение роута по названию' () {
        const router = new Router();
        router.addN('test.router', 'get', '', '/test/');

        assert.instanceOf(router.find('test.router', 'get'), Route);
    }
    *'При получении роута по названию по умолчанию метод get' () {
        const router = new Router();
        router.addN('test.router', 'get', '', '/test/');

        assert.instanceOf(router.find('test.router'), Route);
    }
    *'При получении несуществующего роута должен вернуться null' () {
        const router = new Router();
        const domain = 'test.t.ru';
        router.addN('test.router', 'get', domain, '/test/');

        const route = router.find('test.location');

        assert.isNull(route);
    }
    *'Метод match без переменных' () {
        const domain = 'test.t.ru';
        const router = new Router();
        router.addN('test.router', 'get', domain, '/area/test/');

        const [route] = router.match('get', 'http://test.t.ru/area/test/');

        assert.match(route.path, /^\/area\/test\//);
    }
    *'Метод match c параметрами' () {
        const domain = ':area.t.ru';
        const router = new Router();
        router.addN('test.router', 'get', domain, '/area/:id/');

        const [route] = router.match('get', 'http://test.t.ru/area/12/');

        assert.instanceOf(route, Route);
    }
    *'Если mount path равен `/` то он приравнивается к ``' () {
        const domain = ':area.t.ru';
        const router = new Router();
        router.addN('test.router', 'get', domain, '/');

        const [route] = router.match('get', 'http://test.t.ru/');

        assert.instanceOf(route, Route);
    }
    *'Пропустить роут, если параметр не соответсвует регулярке' () {
        const domain = 'test.t.ru';
        const router = new Router();
        router.addN('test.a', 'get', domain, '/:id<\\d+>');
        router.addN('test.b', 'get', domain, '/area/:id?');

        const [route] = router.match('get', 'http://test.t.ru/area/');

        assert.equal(route.name, 'test.b');
    }
    *'Попадание под роут с регуляркой' () {
        const domain = 'test.t.ru';
        const router = new Router();
        router.addN('test', 'get', domain, '/:id<\\d+>');

        const [route] = router.match('get', 'http://test.t.ru/123/');

        assert.instanceOf(route, Route);
    }
}

exports.RouterTests = RouterTests;
