
const imppath = require('path')

const fs = require('fs');
const { join } = require('path');
const findPackageJson = require('find-package-json');
const nearestPackageJson = findPackageJson(join(__dirname));
const rootDirectory = imppath.dirname(nearestPackageJson.next().filename);


const handlerMain = {
    set: function (target, key, value) {
        console.log(key)
        if (key.slice(0, 1) == '_') {
            target[key] = value
            return;
        }
        target[key] = value
        console.log([...this._path, key]);
        let targetPath = [...this._path, key].join('/');
        console.log(targetPath)
        for (let keyval in this._root._callbacks) {
            console.log(this._root._callbacks, targetPath.slice(0, keyval.length))
            if (this._root._callbacks[targetPath.slice(0, keyval.length)]) {
                console.log(keyval, targetPath)
                this._root._callbacks[targetPath.slice(0, keyval.length)].forEach(cb => {
                    cb(targetPath.slice(0, keyval.length), value)
                });
            }
        }
        if (typeof target[key] == 'object')
            target[key] = createProxy(target[key], this, false, target, key)
    },
    _path: [],
    _root: null,
    _parent: null,
    _callbacks: {},
    get(target, prop) {
        if (prop == "[[handler]]") {
            return this;
        }
        return target[prop];
    }
}

function createProxy(obj, handlerInc = handlerMain, isRoot = true, parent, key) {
    let handler;
    handler = { ...handlerMain }
    if (isRoot) {
        handler._root = handler
        handler._parent = null
        handler._path = [''];
        handler._callbacks = {}
    } else {
        handler._root = handlerInc._root
        handler._parent = handlerInc
        handler._path = [...handlerInc._path, key];
        handler._callbacks = {}
    }
    console.log(handler)
    for (let key in obj) {
        if (key.slice(0, 1) == '_') continue;
        if (typeof obj[key] == 'object')
            obj[key] = createProxy(obj[key], handler, false, obj, key)
    }
    return new Proxy(obj, handler);
}



const rjwatch = (obj, key, cb) => {
    let objHandler = obj['[[handler]]'];
    console.log(objHandler)
    console.log(objHandler._path)
    let targetPath;
    targetPath = [...objHandler._path, key].join('/');
    if (!key) {
        key = ''
        targetPath = [...objHandler._path].join('/');
    }
    console.log(targetPath)

    if (!objHandler._root._callbacks[targetPath])
        objHandler._root._callbacks[targetPath] = [];
    objHandler._root._callbacks[targetPath].push((path, value) => {
        console.log(targetPath, value)
        console.log(obj)
        if (key)
            cb(obj[key]);
        else
            cb(obj)
    })
}
// let rjson = createProxy({ hello: 'world', deep: { deep1: 'hi', deep2: 23454 } });
// console.log(rjson)

// rjson.deep.deep1 = 'hello'

// rjson.deep.deep1 = {}
// rjwatch(rjson.deep, 'deep1', (e) => { console.log(e) })
// rjson.deep.deep1.rtewt = 323
// console.log(rjson)


module.exports = { createProxy, rjwatch }