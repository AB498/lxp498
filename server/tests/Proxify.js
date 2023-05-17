
const imppath = require('path')

const fs = require('fs');
const { join } = require('path');
const findPackageJson = require('find-package-json');
const nearestPackageJson = findPackageJson(join(__dirname));
const rootDirectory = imppath.dirname(nearestPackageJson.next().filename);


function createProxy(obj, handler, path, clb) {
    if (!path || path.length == 0) {
        path = ['root']
    }
    if (!handler) {
        handler = handlerMain
    }
    const newHandler = { ...handler, path: path, callbacks: clb || [] };
    const proxy = new Proxy(obj, newHandler);
    for (let key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            obj[key] = createProxy(obj[key], handler, [...path, key], clb || []);
        }
    }
    // if (typeof obj != 'object') {
    //     console.log(path, obj)
    // }
    // newHandler.callbacks.forEach((callback) => callback(path, obj));
    return proxy;
}

let handlerMain = {
    set: function (target, key, value) {
        const pathString = [...this.path, key].join('.');
        if (typeof value === "object") {
            value = createProxy(value, this, [...this.path, key], this.callbacks);
        }
        target[key] = value;
        this.callbacks.forEach((callback) => callback([...this.path, key], value));
        return true;
    },
    get: function (target, key) {
        if (typeof key === "symbol") {
            // console.log(key);
        }
        else {
            // console.log(key);
            if (!target[key]) {
                // console.log(this.path, key)
                // target[key] = createProxy({}, this, [...this.path, key], this.callbacks);
                return target[key];
            }
        }
        return target[key];

    },
    path: [],
    callbacks: []
};


function createDirectoryRecursive(dirPath) {
    // Check if the directory already exists
    if (fs.existsSync(dirPath)) {
        if (fs.statSync(dirPath).isFile()) {
            console.log(`Cannot create directory ${dirPath}. The parent path is a file.`);
            fs.rmSync(dirPath);
            fs.mkdirSync(dirPath);
            createDirectoryRecursive(dirPath);
            return;
        } else {
            return;
        }
    }

    // Get the parent directory path
    const parentDir = imppath.dirname(dirPath);

    if (fs.existsSync(parentDir)) {
        console.log(parentDir)
        if (fs.statSync(parentDir).isFile()) {
            console.log(`Cannot create directory ${dirPath}. The parent path is a file.`);
            fs.rmSync(parentDir);
            fs.mkdirSync(parentDir);
            createDirectoryRecursive(parentDir);
        }
    } else {
        // Recursively create the parent directory
        createDirectoryRecursive(parentDir);
    }


    fs.mkdirSync(dirPath);

    console.log(`Created directory ${dirPath}.`);
}

// Start creating directories recursively
let cb = (path, value) => {
    console.log(`${path} -> ${value}`);
    createDirectoryRecursive(imppath.dirname(imppath.join(rootDirectory, 'glb', ...path)));
    if (fs.existsSync(imppath.join(rootDirectory, 'glb', ...path))) {
        if (fs.statSync(imppath.join(rootDirectory, 'glb', ...path)).isFile()) {
            fs.rmSync(imppath.join(rootDirectory, 'glb', ...path));
        }
        else {
            fs.rmdirSync(imppath.join(rootDirectory, 'glb', ...path), { recursive: true });
        }
    }
    fs.writeFileSync(imppath.join(rootDirectory, 'glb', ...path), value + "")
}
module.exports = { createProxy, handlerMain }

// let testProxy = createProxy({ hello: 'world', deep: { deep1: 434 } }, null, ['root'], [cb])
// testProxy.dee.p.d.z.tes = 432
