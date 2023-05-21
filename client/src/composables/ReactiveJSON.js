
const handlerMain = {
    set: function (target, key, value) {
        if (key.slice(0, 1) == '_') {
            target[key] = value
            return;
        }
        let oldval = target[key]
        target[key] = value
        let targetPath = [...this._path, key].join('/');
        for (let keyval in this._root._callbacks) {
            if (keyval == targetPath.slice(0, keyval.length)) {
                this._root._callbacks[targetPath.slice(0, keyval.length)].forEach(cb => {
                    cb(targetPath.slice(0, keyval.length), oldval)
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

const createProxy = (obj, handlerInc = handlerMain, isRoot = true, parent, key) => {
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
    for (let key in obj) {
        if (key.slice(0, 1) == '_') continue;
        if (typeof obj[key] == 'object')
            obj[key] = createProxy(obj[key], handler, false, obj, key)
    }
    return new Proxy(obj, handler);
}



const rjwatch = (obj, key, cb) => {
    let objHandler = obj['[[handler]]'];
    let targetPath;
    targetPath = [...objHandler._path, key].join('/');
    if (!key) {
        key = ''
        targetPath = [...objHandler._path].join('/');
    }

    if (!objHandler._root._callbacks[targetPath])
        objHandler._root._callbacks[targetPath] = [];
    objHandler._root._callbacks[targetPath].push((path, oldval) => {
        if (key)
            cb(oldval, obj[key], path, key);
        else
            cb(oldval, obj, path, key)
    })
}
let rjson = createProxy({ hello: 'world', deep: { deep1: 'hi', deep2: 23454 } });
// 
rjwatch(rjson.deep, 'deep1', (k, v, p, v2) => {
    rjson.deep.deep2 = 'hello'
    console.log(k, v, p, v2)
})
rjwatch(rjson.deep, 'deep2', (k, v) => {
})
const rjmod = (root, path, value) => {
    let pathArr = path.split('/').slice(1,)
    let obj = root
    for (let i = 0; i < pathArr.length - 1; i++) {
        obj = obj[pathArr[i]]
    }
    obj[pathArr[pathArr.length - 1]] = value
}

rjson.deep.deep1 = 'hello3'

rjmod(rjson, '/deep/deep1', 'hello2')

console.log(rjson.deep.deep1)

let obj = { createProxy, rjwatch, rjmod }
if (window) {
    window.rjexport = obj
    window.createProxy = createProxy
    window.rjwatch = rjwatch
    window.rjmod = rjmod
}
if (module) {
    module.exports = { createProxy, rjwatch, rjmod }
}
export default obj