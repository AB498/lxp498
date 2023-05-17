const path = require('path');
const fs = require('fs');
const { join } = require('path');
const findPackageJson = require('find-package-json');
const nearestPackageJson = findPackageJson(join(__dirname));
const rootDirectory = path.dirname(nearestPackageJson.next().filename);
const { createProxy } = require(join(rootDirectory, 'tests', 'Proxify.js'));
(async () => {

    let userProxy = createProxy({ name: "John", age: 30 }, null, ['df'], [(path, value) => console.log(path, value)]);

    userProxy.name = "Jack";

})();