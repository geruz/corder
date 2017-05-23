'use strict';

module.exports = req => req ? Object.assign({}, req.query, req.params, req.body) : {};
