const axios = require("axios");
const { resolve } = require("path");
const s = require('../s');
const fs = require('fs');
const path = require('path');
const { join } = require('path');
const fword = require("../fword");
// const rootDirectory = path.dirname(require.main.filename);
const findPackageJson = require('find-package-json');

const nearestPackageJson = findPackageJson(join(__dirname));

const rootDirectory = path.dirname(nearestPackageJson.next().filename);

class TranslationServices {

  constructor() {
    this.progress = 0;
  }
  async getTranslation(words, sourceLang, targetLang) {
    //googel translate api

    let sourceLangHash = {};
    (await fword.Word.findAll({
      attributes: [global.glb.iso1to3(sourceLang), global.glb.iso1to3(targetLang)],
    })).map((x) => {
      sourceLangHash[x[global.glb.iso1to3(sourceLang)]] = x[global.glb.iso1to3(targetLang)];
    });

    let translatedWords = Array(words.length).fill(null);
    let toTranslate = [];
    for (let [index, word] of words.entries()) {
      if (sourceLangHash[word]) {
        translatedWords[index] = sourceLangHash[word];
      }
      else {
        toTranslate.push([index, word]);
      }
    }

    if (toTranslate.length == 0) {
      return translatedWords;
    }

    global.glb.log(words.length - toTranslate.length + " words already translated. Translating " + toTranslate.length + " words from " + sourceLang + " to " + targetLang);

    if (toTranslate.length > 1000) {
      let chunkSize = 1000;
      let chunks = Math.ceil(toTranslate.length / chunkSize);
      let promises = [];
      for (let i = 0; i < chunks; i++) {
        let chunk = toTranslate.slice(i * chunkSize, (i + 1) * chunkSize);
        promises.push(this.getTrsl(translatedWords, chunk, sourceLang, targetLang));
      }
      await Promise.all(promises);
    } else {
      await this.getTrsl(translatedWords, toTranslate, sourceLang, targetLang);
    }


    let bulk = [];
    for (let i = 0; i < translatedWords.length; i++) {
      if (!translatedWords[i]) translatedWords[i] = '_unknown_';
      // if (await fword.Word.findOne({
      //   where: { [global.glb.iso1to3(sourceLang)]: words[i] }
      // })) {
      // if (i % 1000 == 0)
      //   console.log(i);
      bulk.push({
        [global.glb.iso1to3(sourceLang)]: words[i],
        [global.glb.iso1to3(targetLang)]: translatedWords[i],
      });

    }
    await fword.Word.bulkCreate(bulk, { updateOnDuplicate: [global.glb.iso1to3(targetLang)] });

    return translatedWords;
  }
  async getTranslationSentences(sentences, sourceLang, targetLang) {

    let translatedSentences = Array(sentences.length).fill(null);
    let toTranslate = [];

    for (let [index, word] of sentences.entries()) {
      toTranslate.push([index, word]);
    }
    if (toTranslate.length > 1000) {
      let chunkSize = 1000;
      let chunks = Math.ceil(toTranslate.length / chunkSize);
      let promises = [];
      for (let i = 0; i < chunks; i++) {
        let chunk = toTranslate.slice(i * chunkSize, (i + 1) * chunkSize);
        promises.push(this.getTrsl(translatedSentences, chunk, sourceLang, targetLang));
      }
      await Promise.all(promises);
    } else {
      await this.getTrsl(translatedSentences, toTranslate, sourceLang, targetLang);
    }
    return translatedSentences;
  }
  async getTrsl(translatedWords, toTranslate, sourceLang, targetLang) {
    let endpoint = 'https://translation.googleapis.com/v3/projects/lxp498:translateText';
    let [err, res] = await s.safeAsync(
      axios.post(endpoint, {
        "sourceLanguageCode": sourceLang,
        "targetLanguageCode": targetLang,
        "contents": toTranslate.map((x) => x[1]),
        "mimeType": "text/plain"
      }, {
        headers: {
          Authorization: `Bearer ${global.glb.accessToken}`,
          "Content-Type": "application/json",
        }
      }), "axios");
    if (err || !res) return;


    let data = res.data;

    let result = [];
    for (let [index, word] of toTranslate.entries()) {
      translatedWords[word[0]] = data.translations[index].translatedText;
    }
  }
  async getSupportedLanguages() {
    let endpoint = 'https://translation.googleapis.com/v3/projects/lxp498/locations/global/supportedLanguages';
    let [err, res] = await s.safeAsync(
      axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${global.glb.accessToken}`,
          "Content-Type": "application/json",
        }
      }), "axios");
    if (err || !res) return;

    let data = res.data;

    let result = [];
    for (let lang of data.languages) {
      if (lang.supportSource && lang.supportTarget)
        result.push(lang.languageCode);
    }
    return result;

  }

}



let translationServices;

global.__translationServices;
if (!global.__translationServices) {
  global.__translationServices = new TranslationServices();
}
translationServices = global.__translationServices;


module.exports = translationServices