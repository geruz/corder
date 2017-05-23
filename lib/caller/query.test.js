'use strict';

const [UnitTest, Assert] = require('ruban').Full;
const Query = require('./query');

exports.AuthControllerTests = class AuthControllerTests extends UnitTest {
    *'Проверяем заполнение body' () {
        const req = {
            body: {
                id: 12,
            },
        };
        const q = new Query(req);
        Assert.equal(q.p.id, 12);
    }
    *'Проверяем заполнение param' () {
        const req = {
            params: {
                id: 12,
            },
        };
        const q = new Query(req);
        Assert.equal(q.p.id, 12);
    }
    *'Проверяем заполнение query' () {
        const req = {
            query: {
                id: 12,
            },
        };
        const q = new Query(req);
        Assert.equal(q.p.id, 12);
    }
    *'Проверяем приоритет body над query' () {
        const req = {
            body: {
                name: 'body',
            },
            query: {
                name: 'query',
            },
        };
        const q = new Query(req);
        Assert.equal(q.p.name, 'body');
    }
    *'Проверяем приоритет body над params' () {
        const req = {
            body: {
                name: 'body',
            },
            params: {
                name: 'params',
            },
        };
        const q = new Query(req);
        Assert.equal(q.p.name, 'body');
    }
    *'Проверяем приоритет params над query' () {
        const req = {
            query: {
                name: 'query',
            },
            params: {
                name: 'params',
            },
        };
        const q = new Query(req);
        Assert.equal(q.p.name, 'params');
    }
};
