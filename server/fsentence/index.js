const s = require('../s');
const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
const { join } = require('path');
const findPackageJson = require('find-package-json');
const nearestPackageJson = findPackageJson(join(__dirname));
const rootDirectory = path.dirname(nearestPackageJson.next().filename);
const translationService = require(join(rootDirectory, 'utils', 'TranslationServices'));
const fword = require('../fword');
const spt = require(join(rootDirectory, 'utils', 'SpacyTokenizer'));
const { Op } = require("sequelize");
let languagesWithoutSpace = ['tha', 'lao', 'khm', 'zho', 'mya', 'kor', 'vie', 'dzo', 'khg', 'jpn']

const sequelizeSentence = new Sequelize({
    dialect: 'sqlite',
    storage: join(rootDirectory, 'sentence_database_main.sqlite'),
    logging: false
});

const tables = require('./sentence')(sequelizeSentence);
async function init(opts) {
    // await     sequelizeSentence.authenticate();
    await sequelizeSentence.sync(opts);
}

fsentence = {
    init,
    tables,
    sequelize: sequelizeSentence,
    addSentencesForLang
}
module.exports = fsentence;

async function addSentencesForLang(lng) {
    await fsentence.init();
    await fword.init();
    let levelMap = {
        "A1": 1,
        "A2": 2,
        "B1": 3,
        "B2": 4,
        "C1": 5,
        "C2": 6
    }
    let visited = {
        ["" + 1]: new Set(),
        ["" + 2]: new Set(),
        ["" + 3]: new Set(),
        ["" + 4]: new Set(),
        ["" + 5]: new Set(),
        ["" + 6]: new Set(),
    };
    spt.init();

    let googleSupportedLangs = [];
    try {
        googleSupportedLangs = JSON.parse(fs.readFileSync(join(rootDirectory, 'googleSupportedLangs.json')));
    } catch (e) {
        console.log(e);
        googleSupportedLangs = await translationService.getSupportedLanguages();
        fs.writeFileSync(join(rootDirectory, 'googleSupportedLangs.json'), JSON.stringify(googleSupportedLangs));
    }

    let langs = JSON.parse(fs.readFileSync(join(rootDirectory, 'langs.json')));
    global.glb.accessToken = await global.glb.getAccessToken();

    let tables = fsentence.tables;
    for (let i = 0; i < langs.length; i++) {

        let langCode = langs[i];
        if (langCode != lng) continue;
        let targetLang = global.glb.iso3to1(langCode);
        if (!googleSupportedLangs.includes(targetLang)) continue;

        let offs = 0;
        console.log(langCode);

        if (languagesWithoutSpace.includes(langCode)) {
            let tmRes = await spt.getWordsFromSentence(global.glb.iso3to1(langCode), "hello world")
            console.log(langCode, tmRes);

            if (tmRes == null)
                continue;
        }

        for (let diff = 1; diff <= 6; diff++) {
            let langSentences = (await tables[langCode].findAll({
                attributes: ['text'],
                where: {
                    ['difficulty' + diff]: {
                        [Op.ne]: -1
                    }
                }
            })).map(w => w.get('text'));


            if (langSentences.length >= 10)
                continue;
            console.log('diff ' + diff + ' ' + langSentences.length);
            const difw = (await fsentence.tables['eng'].findAll({
                attributes: ['text'],
                where: {
                    ['difficulty' + diff]: {
                        [Op.ne]: -1
                    },
                    text: {
                        [Op.ne]: ''
                    }
                },
                order: sequelizeSentence.random(),
                limit: 100,
                offset: offs
            })).map(w => w.get('text'));
            global.glb.log(diff + " diff " + difw.length)
            let targetLang = global.glb.iso3to1(langCode);
            // console.log(difw)
            let tltd = (await translationService.getTranslationSentences(difw, "en", targetLang));
            let levelWords = Object.fromEntries(await Promise.all(Object.entries(levelMap).map(async ([key, value]) => {
                const difw = (await fword.Word.findAll({
                    attributes: [langCode],
                    where: {
                        difficulty: value
                    }
                })).map(w => w.get(langCode));
                return [value, difw];
            })))
            for (let i = 0; i < tltd.length; i++) {
                let diffs = Object.fromEntries(await Promise.all(Object.entries(levelMap).map(async ([key, value]) => (
                    [['difficulty' + value], await idxWordOfDiff(tltd[i], levelWords, value, null, null, visited)]
                ))));
                // console.log(diffs)
                if (Object.values(diffs).every(d => d == -1)) {
                    if (i % 100 == 0)
                        console.log("no words found: " + i / tltd.length * 100 + "%")
                    // console.log(diffs)
                    continue;
                }
                let langSentenceToAdd = {
                    text: tltd[i],
                    ...diffs,
                    ...Object.fromEntries(Object.entries(levelMap).map(([key, value]) => (
                        [['difficulty' + value + 'word'], diffs['difficulty' + value] == -1 ? null : tltd[i].split(' ')[diffs['difficulty' + value]]]
                    )))
                }
                // console.log(langSentenceToAdd);
                await tables[langCode].create(langSentenceToAdd);
            }
            console.log('data added');


            let countAtDiff = await fsentence.tables[langCode].count({ where: { ['difficulty' + diff]: { [Op.ne]: -1 } } });
            console.log(countAtDiff);
            if (countAtDiff < 10) {
                diff--;
                offs += 100;
                continue;
            }

        }

    }
    console.log('done all');
    spt.exit();

    return await fsentence.tables[lng].count();

}


async function idxWordOfDiff(sentence, levelWords, diff, language = null, delimiter = ' ', visited) {

    if (!delimiter)
        delimiter = ' ';
    try {
        let words = [];
        if (languagesWithoutSpace.includes(language)) {
            words = await spt.getWordsFromSentence(global.glb.iso3to1(language), sentence);
        } else {
            words = sentence.split(delimiter);
        }
        for (let i = 0; i < levelWords[diff].length; i++) {
            const idx = words.indexOf(levelWords[diff][i]);
            if (idx != -1) {
                if (visited["" + diff].has(words[idx])) continue;
                visited["" + diff].add(words[idx]);
                return idx;
            }
        }
        return -1;
    } catch (e) {
        console.log(e);
        return -1;
    }
}
