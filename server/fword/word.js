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

let langs = {};
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
for (let i = 0; i < langsList.length; i++) {
    if (langsList[i] == "eng") continue;
    langs[langsList[i]] = DataTypes.STRING;
}
// console.log(Object.entries(langs).length);

module.exports = sequelize => {
    const Word = sequelize.define('Word', {
        eng: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        difficulty: DataTypes.INTEGER,
        partOfSpeech: DataTypes.STRING,
        topic: DataTypes.STRING,
        relatable: DataTypes.STRING,
        ...langs,
    });

    return Word;
};
