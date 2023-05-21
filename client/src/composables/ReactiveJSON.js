
const handlerMain = {
    set: function (target, key, value) {
        if (key.slice(0, 1) == '_') {
            target[key] = value
            return;
        }
        let oldtarget = fastObjCopy(target);
        if (typeof target[key] == 'object')
            target[key] = createProxy(target[key], this, false, target, key)
        else
            target[key] = value
        let newtarget = target;

        let targetPath = [...this._path, key].join('/');
        for (let keyval in this._root._callbacks) {
            let oldval = oldtarget[key]
            if (typeof target[key] == 'object')
                target[key] = createProxy(target[key], this, false, target, key)
            else
                target[key] = value
            let modpath = targetPath
            let newval = newtarget[key]
            if (keyval == targetPath.slice(0, keyval.length)) {
                this._root._callbacks[targetPath.slice(0, keyval.length)].forEach(cb => {

                    cb(oldval, newval, modpath, key, value)
                });
            }
        }
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
    objHandler._root._callbacks[targetPath].push((oldval, newVal, modpath, key, value) => {
        if (key)
            cb(oldval, newVal, modpath, key, value);
        else
            cb(oldval, newVal, modpath, key, value)
    })
}
// let rjson = createProxy({ deep: 'deephello', deep2: 'deep2hello', deep3: { deep4: 'deep4hello' } });

// rjwatch(rjson.deep3, null, (old, newval, pth, key, value) => {
//     // rjson.deep.deep2 = 'hello'
//     rjmod(rjson, '', 'hello2dsad')


// })
// rjson.a = 232432
// rjmod(rjson, '/a', 27)


// rjson.deep3.deep4 = 'helinnlo23'


function rjmod(root, path, value) {
    let pathArr = path.split('/').slice(1,)
    let obj = root

    if (pathArr.length == 0) {
        Object.assign(root['[[handler]]']._root._obj, typeof value == 'object' ? value : { [value]: value })
        return
    }
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
    return fastObjCopy(obj)
}

function fastObjCopy(obj) {
    if (obj === null) return null;
    if (typeof obj !== 'object') return obj;
    if (obj.constructor === Date) return new Date(obj);
    if (obj.constructor === RegExp) return new RegExp(obj);
    let newObj = new obj.constructor();  //保持继承链
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {   //不遍历其原型链上的属性
            let val = obj[key];
            newObj[key] = typeof val === 'object' ? fastObjCopy(val) : val; // 使用arguments.callee解除与函数名的耦合
        }
    }
    return newObj;
}
// rjmod(rjson, '/deep/deep1', 'hello2ds2')


// rjson.deep.deep1 = 'hello3'

// rjmod(rjson, '/deep/deep1', 'hello2')



let obj = { createProxy, rjwatch, rjmod, rjget }
if (typeof window != 'undefined') {
    window.rjexport = obj
    window.createProxy = createProxy
    window.rjwatch = rjwatch
    window.rjmod = rjmod
    window.rjget = rjget
}
if (module) {
    module.exports.createProxy = createProxy;
    module.exports.rjwatch = rjwatch;
    module.exports.rjmod = rjmod;
    module.exports.rjget = rjget;
} else {
}