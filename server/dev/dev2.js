const { Op } = require("sequelize");
const s = require('../s');
const fs = require('fs');
const path = require('path');
const { join } = require('path');
const readline = require('readline');
const tsv = require('tsv');
const fword = require("../fword");
const fsentence = require("../fsentence");
const models = require('../models');

const findPackageJson = require('find-package-json');
const nearestPackageJson = findPackageJson(join(__dirname));
const rootDirectory = path.dirname(nearestPackageJson.next().filename);

const spt = require('../utils/SpacyTokenizer');
const translationService = require('../utils/TranslationServices');
const { where } = require('sequelize');


(async () => {

    await initTables();

})();



async function initTables() {
    await models.sequelize.sync({ force: true });

}
