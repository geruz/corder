'use strict';
class Methods {
    constructor(mountPoint, domain){
        this.domain = domain;
        this.mountPoint = mountPoint;
    }
    get (path, name) {
        return this._add('get', path, name);
    }
    post (path, name) {
        return this._add('post', path, name);
    }
    put (path, name) {
        return this._add('put', path, name);
    }
    head (path, name) {
        return this._add('head', path, name);
    }
    delete (path, name) {
        return this._add('delete', path, name);
    }
    options (path, name) {
        return this._add('options', path, name);
    }
    _add (httpMethod, path, name) {
        this.router.add(name, httpMethod, this.domain, `${this.mountPoint}${path}`);
        return this;
    }
}

module.exports = class Registrator {
    constructor (router, getDomain) {
        this.router = router;
        this.getDomain = getDomain;
    }
    mount (domain, mountPoint) {
        return new Methods(mountPoint, this.getDomain(domain));
    }
};
