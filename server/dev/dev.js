const { Op } = require("sequelize");
const s = require('../s');
const fs = require('fs');
const path = require('path');
const { join } = require('path');
const readline = require('readline');
const tsv = require('tsv');
const fword = require("../fword");
const fsentence = require("../fsentence");

const findPackageJson = require('find-package-json');
const nearestPackageJson = findPackageJson(join(__dirname));
const rootDirectory = path.dirname(nearestPackageJson.next().filename);

const spt = require('../utils/SpacyTokenizer');
const translationService = require('../utils/TranslationServices');


(async () => {

    // await initWordsToDB();
    // await getTranslationsToDB();
    // await getSentencesToDB();
    // await getSentencesTranslationsToDB();
    // obsolete: await addSentencesForLang('ara');
    await fsentence.addSentencesForLang('ben');

})();

async function initWordsToDB() {

    await fword.init({ force: true });

    let levelMap = {
        "A1": 1,
        "A2": 2,
        "B1": 3,
        "B2": 4,
        "C1": 5,
        "C2": 6
    }
    let engWords = global.glb.tryParseJSON(global.glb.tryReadFile(path.join(rootDirectory, 'dictionaries', 'eng_dictionary.json')));
    let langsDatas = [];
    for (let i = 0; i < engWords.length; i++) {
        let word = engWords[i];
        // if (await fword.Word.findOne({ where: { eng: word[0] } })) {
        //     if (i % 1000 == 0) console.log("Exists: " + i);
        //     continue;
        // }
        let langsData = {
            eng: word[0].split(' ')[0].trim(),
            relatable: word[1],
            difficulty: levelMap[word[2]],
            partOfSpeech: word[3],
            topic: word[4],
        }
        if (!langsData.eng || langsData == '') continue;
        langsDatas.push(langsData)
        if (i % 1000 == 0) {
            await fword.Word.bulkCreate(langsDatas, { updateOnDuplicate: ['eng'] });
            langsDatas = [];
            console.log(i);
        }
    }
    await fword.Word.bulkCreate(langsDatas, { updateOnDuplicate: ['eng'] });

    console.log(await fword.Word.count());
}

async function getTranslationsToDB() {
    await fword.init();

    let googleSupportedLangs = [];
    try {
        googleSupportedLangs = JSON.parse(fs.readFileSync(join(rootDirectory, '..', 'googleSupportedLangs.json')));
    } catch (e) {
        console.log(e);
        googleSupportedLangs = await translationService.getSupportedLanguages();
        fs.writeFileSync(join(rootDirectory, 'googleSupportedLangs.json'), JSON.stringify(googleSupportedLangs));
    }

    let langs = JSON.parse(fs.readFileSync(join(rootDirectory, 'langs.json')));
    global.glb.accessToken = await global.glb.getAccessToken();
    // console.log(global.glb.accessToken);

    for (let i = 0; i < langs.length; i++) {
        let langCode = langs[i];

        if (langCode == "eng") continue;
        let targetLang = global.glb.iso3to1(langCode);
        if (!googleSupportedLangs.includes(targetLang)) continue;
        let engwords = (await fword.Word.findAll({
            attributes: ['eng'], where: {
                [langCode]: null
            }
        })).map(w => w.get('eng'));
        if (engwords.length <= 0) continue;

        console.log(langCode, targetLang);
        console.log(engwords.length);
        console.log(await fword.Word.count({ where: { [langCode]: null } }));

        let tltd = (await translationService.getTranslation(engwords, "en", targetLang));

        if (await fword.Word.count({ where: { [langCode]: null } }) > 0) {
            i--;
            continue;
        }

        // break;

    }

}

async function getSentencesToDB() {
    let levelMap = {
        "A1": 1,
        "A2": 2,
        "B1": 3,
        "B2": 4,
        "C1": 5,
        "C2": 6
    }
    spt.init()

    let levelWords = Object.fromEntries(await Promise.all(Object.entries(levelMap).map(async ([key, value]) => {
        const difw = (await fword.Word.findAll({
            attributes: ['eng'],
            where: {
                difficulty: value
            }
        })).map(w => w.get('eng'));
        // global.glb.log(value + " " + difw.length)
        return [value, difw];
    })))
    let langs = JSON.parse(fs.readFileSync(join(rootDirectory, 'langs.json')));
    global.glb.accessToken = await global.glb.getAccessToken();
    // console.log(join(rootDirectory, '..', 'langs.json'));
    // console.log(global.glb.accessToken);

    await fsentence.init({ force: true });

    console.log("Done init")
    for (let i = 0; i < langs.length; i++) {
        let langCode = langs[i];
        let tables = fsentence.tables;
        const chunkSize = 100000;
        const fileStream = fs.createReadStream(join(rootDirectory, 'sentences', 'sentences.tsv'));

        var stats = fs.statSync(join(rootDirectory, 'sentences', 'sentences.tsv'));
        var fileSizeInBytes = stats.size;

        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        const parsedData = [];
        let parsedBytes = 0;
        const columns = ['id', 'language', 'text'];

        let batchLines = [];
        let visited = {
            ["" + 1]: new Set(),
            ["" + 2]: new Set(),
            ["" + 3]: new Set(),
            ["" + 4]: new Set(),
            ["" + 5]: new Set(),
            ["" + 6]: new Set(),
        };
        for await (const line of rl) {
            // Each line in input.txt will be successively available here as `line`.
            batchLines.push(line);
            parsedBytes += line.length;
            if (parsedBytes % 1000000 == 0)
                console.log('Parsed ' + parsedBytes / fileSizeInBytes * 100 + '%');

            if (batchLines.length % chunkSize == 0) {
                let data = batchLines.join('\n');

                parsedData.push(...tsv.parse(columns.join('\t') + '\n' + data));
                batchLines.length = 0;

                if (parsedData.length > 1000000) {
                    await addSentences(parsedData, tables, levelMap, levelWords, visited);
                    parsedData.length = 0;
                }
            }
        }
        console.log('Parsed tsv file ' + parsedData.length);


        break;

    }

    spt.exit();

}

async function addSentences(parsedData, tables, levelMap, levelWords, visited) {



    // console.log(levelWords['1'].length);
    // return;


    const sentencesToAdd = {};
    for (let i = 0; i < parsedData.length; i++) {
        try {
            if (parsedData[i].language != 'eng') continue;
            if (!sentencesToAdd[parsedData[i].language])
                sentencesToAdd[parsedData[i].language] = [];
            let diffs = Object.fromEntries(await Promise.all(Object.entries(levelMap).map(async ([key, value]) => (
                [['difficulty' + value], await idxWordOfDiff(parsedData[i].text, levelWords, value, null, null, visited)]
            ))));
            // console.log(diffs)
            if (Object.values(diffs).every(d => d == -1)) {
                if (i % 1000 == 0)
                    console.log("no words found: " + i / parsedData.length * 100 + "%")
                // console.log(diffs)
                continue;
            }
            sentencesToAdd[parsedData[i].language].push({
                text: parsedData[i].text,
                ...diffs,
                ...Object.fromEntries(Object.entries(levelMap).map(([key, value]) => (
                    [['difficulty' + value + 'word'], diffs['difficulty' + value] == -1 ? null : parsedData[i].text.split(' ')[diffs['difficulty' + value]]]
                )))
            });
            if (sentencesToAdd[parsedData[i].language].length % 1000 == 0) {
                await tables[parsedData[i].language].bulkCreate(sentencesToAdd[parsedData[i].language]);
                sentencesToAdd[parsedData[i].language].length = 0;
            }

        } catch (e) {
            console.log(e);
            break;
        }
    }
    for (let lang in sentencesToAdd) {
        global.glb.log(lang, sentencesToAdd[lang].length);
        await tables[lang].bulkCreate(sentencesToAdd[lang]);
    }

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

let languagesWithoutSpace = ['tha', 'lao', 'khm', 'zho', 'mya', 'kor', 'vie', 'dzo', 'khg', 'jpn']
async function getSentencesTranslationsToDB() {
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
        if (langCode == "eng") continue;
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
                order: Sequelize.literal('rand()'),
                limit: 100,
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
                    [['difficulty' + value], await idxWordOfDiff(tltd[i], levelWords, value, langCode)]
                ))));
                let langSentenceToAdd = {
                    text: tltd[i],
                    ...diffs
                }
                // console.log(langSentenceToAdd);
                await tables[langCode].create(langSentenceToAdd);
            }
            console.log('data added');


            let countAtDiff = await fsentence.tables[langCode].count({ where: { ['difficulty' + diff]: { [Op.ne]: -1 } } });
            console.log(countAtDiff);
            if (countAtDiff < 10) {
                diff--;
                continue;
            }

        }

    }
    console.log('done all');
    spt.exit();


}

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