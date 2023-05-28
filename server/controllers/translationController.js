const jwtUtil = require("../utils/jwt");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require('uuid');
const { Op } = require("sequelize");

const fs = require("fs");
const path = require("path");
const { join } = require("path");
const findPackageJson = require('find-package-json');
const nearestPackageJson = findPackageJson(join(__dirname, "fword"));
const rootDirectory = path.dirname(nearestPackageJson.next().filename);

const fword = require(join(rootDirectory, "fword"));
const translationServices = require(join(rootDirectory, "utils", "TranslationServices"));

module.exports.getTranslation = async (req, res) => {
    const { words, sourceLang, targetLang } = req.body;
    const translatedWords = await translationServices.getTranslation(words, sourceLang, targetLang);
    if (!translatedWords) return res.status(500).send("Error");
    console.log(words, sourceLang, translatedWords);
    return res.send(translatedWords);
}

module.exports.getTranslationSentences = async (req, res) => {
    const { sentences, sourceLang, targetLang } = req.body;
    const translatedSentences = await translationServices.getTranslationSentences(sentences, sourceLang, targetLang);
    if (!translatedSentences) return res.status(500).send("Error");
    return res.send(translatedSentences);
}

module.exports.getSupportedLanguages = async (req, res) => {
    const languages = await translationServices.getSupportedLanguages();
    return res.send(languages);
}

