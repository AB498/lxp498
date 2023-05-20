const path = require('path');
const fs = require('fs');
const { join } = require('path');
const findPackageJson = require('find-package-json');
const nearestPackageJson = findPackageJson(join(__dirname));
const rootDirectory = path.dirname(nearestPackageJson.next().filename);

module.exports.renderAdminPage = async (req, res) => {
    return res.sendFile(join(rootDirectory, 'views', 'index.html'));
}

module.exports.listAPIs = async (req, res) => {
    const apis = [...(await global.glb.apiEndpoints)];
    return res.send(apis);
}