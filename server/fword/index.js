const s = require('../s');
const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
const { join } = require('path');
const findPackageJson = require('find-package-json');
const nearestPackageJson = findPackageJson(join(__dirname));

const rootDirectory = path.dirname(nearestPackageJson.next().filename);

const sequelizeWord = new Sequelize({
    dialect: 'sqlite',
    storage: join(rootDirectory, 'word_database_main.sqlite'),
    logging: false
});

const Word = require('./word')(sequelizeWord);
async function init(opts) {
    // await sequelizeWord.authenticate();
    await sequelizeWord.sync(opts);
}

module.exports = {
    init,
    Word,
    sequelize: sequelizeWord
};
