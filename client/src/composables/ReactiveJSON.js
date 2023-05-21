
const handlerMain = {
    set: function (target, key, value) {
        if (key.slice(0, 1) == '_') {
            target[key] = value
            return;
        }
        let targetPath = [...this._path, key].join('/');
        for (let keyval in this._root._callbacks) {
            let oldval = rjget(this, targetPath.slice(0, keyval.length))
            target[key] = value
            if (keyval == targetPath.slice(0, keyval.length)) {
                this._root._callbacks[targetPath.slice(0, keyval.length)].forEach(cb => {
                    cb(targetPath.slice(0, keyval.length), oldval, value)
                });
            }
        }
        if (typeof target[key] == 'object')
            target[key] = createProxy(target[key], this, false, target, key)

        return true;
    },
    _obj: null,
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
        handler._callbacks = {},
            handler._obj = obj
    } else {
        handler._root = handlerInc._root
        handler._parent = handlerInc
        handler._path = [...handlerInc._path, key];
        handler._callbacks = {}
        handler._obj = obj
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
    objHandler._root._callbacks[targetPath].push((path, oldval, newVal) => {
        if (key)
            cb(oldval, newVal, path, key);
        else
            cb(oldval, newVal, path, key)
    })
}
// let rjson = createProxy({ hello: 'world', deep: { deep1: 'hi', deep2: 23454 } });

// rjwatch(rjson.deep, null, (k, v, p, v2) => {
//     rjson.deep.deep2 = 'hello'
//     console.log(k, v, p, v2)
// })
// rjwatch(rjson.deep, 'deep2', (k, v) => {
// })

// rjson.deep = 'hello23'


const rjmod = (root, path, value) => {
    let pathArr = path.split('/').slice(1,)
    let obj = root
    for (let i = 0; i < pathArr.length - 1; i++) {
        obj = obj[pathArr[i]]
    }
    obj[pathArr[pathArr.length - 1]] = value  // might error?
}
function rjget(root, path) {
    let pathArr = path.split('/').slice(1,)
    let obj = root._root._obj;
    for (let i = 0; i < pathArr.length; i++) {
        obj = obj[pathArr[i]]
    }
    return obj
}

// rjmod(rjson, '/deep/deep1', 'hello2ds2')
// console.log(rjget(rjson.deep, '/deep/deep1'))

// rjson.deep.deep1 = 'hello3'

// rjmod(rjson, '/deep/deep1', 'hello2')

// console.log(rjson.deep.deep1)

let obj = { createProxy, rjwatch, rjmod, rjget }
if (window) {
    window.rjexport = obj
    window.createProxy = createProxy
    window.rjwatch = rjwatch
    window.rjmod = rjmod
    window.rjget = rjget
}
// if (module) {
//     module.exports = { createProxy, rjwatch, rjmod }
// }
export default obj