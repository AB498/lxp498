const fs = require('fs');
const path = require('path');
const { join } = require('path');
const { DataTypes } = require('sequelize');
const iso6391 = require('iso-639-language').default.getType(1);
const iso6393 = require('iso-639-language').default.getType(3).getFullLanguageAll();
// const rootDirectory = path.dirname(require.main.filename);
const findPackageJson = require('find-package-json');
const nearestPackageJson = findPackageJson(join(__dirname));
const rootDirectory = path.dirname(nearestPackageJson.next().filename);

const langs = {};
let langsList = [];
if (!fs.existsSync(join(rootDirectory, 'langs.json'))) {
    for (let i = 0; i < iso6393.length; i++) {
        let lCode = iso6393[i].iso639_1 ? iso6393[i].iso639_3 : null;
        if (lCode == null) continue;
        langsList.push(lCode)
    }
    fs.writeFileSync(join(rootDirectory, 'langs.json'), JSON.stringify(langsList));
    console.log(langsList)
}
langsList = JSON.parse(fs.readFileSync(join(rootDirectory, 'langs.json')));

module.exports = sequelize => {
    for (let i = 0; i < langsList.length; i++) {
        const Sentence = sequelize.define(langsList[i] + 'Sentence', {
            text: {
                type: DataTypes.STRING,
            },
            difficulty1: DataTypes.INTEGER,
            difficulty2: DataTypes.INTEGER,
            difficulty3: DataTypes.INTEGER,
            difficulty4: DataTypes.INTEGER,
            difficulty5: DataTypes.INTEGER,
            difficulty6: DataTypes.INTEGER,
            difficulty1word: {
                type: DataTypes.TEXT,
                unique: true
            },
            difficulty2word: {
                type: DataTypes.TEXT,
                unique: true
            },
            difficulty3word: {
                type: DataTypes.TEXT,
                unique: true
            },
            difficulty4word: {
                type: DataTypes.TEXT,
                unique: true
            },
            difficulty5word: {
                type: DataTypes.TEXT,
                unique: true
            },
            difficulty6word: {
                type: DataTypes.TEXT,
                unique: true
            },
            data: {
                type: DataTypes.STRING,
                get: function () {
                    return JSON.parse(this.getDataValue('data'));
                },
                set: function (value) {
                    this.setDataValue('data', JSON.stringify(value));
                }
            }
        });
        langs[langsList[i]] = Sentence;

    }
    // console.log(Object.values(langs));
    return langs;
};
