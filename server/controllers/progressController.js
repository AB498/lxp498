const fsentence = require("../fsentence");
const models = require("../models");
const jwtUtil = require("../utils/jwt");
const { Op } = require("sequelize");

module.exports.listProgress = async (req, res) => {
    const progress = await models.Progress.findAll();
    return res.send(progress);
}

module.exports.createProgress = async (req, res) => {
    const user = req.user;
    const { language } = req.body;
    if (!language) return res.status(400).send({ message: "Language is required." });
    let progresses = await models.Progress.findAll({ where: { UserId: user.id, language: global.glb.iso1to3(language) } });
    console.log(user.id)
    if (progresses.length >= 6) return res.send(progresses);

    await fsentence.init();
    if (!fsentence.tables[global.glb.iso1to3(language)])
        return res.status(400).send({ message: `Language ${language} not supported.` });
    for (let difficulty = 1; difficulty <= 6; difficulty++) {
        let sentences = await fsentence.tables[global.glb.iso1to3(language)].findAll({
            where: {
                ['difficulty' + difficulty]: {
                    [Op.gt]: 0
                }
            },
            order: fsentence.sequelize.random(),
            limit: 10,
        });
        if (sentences.length < 10) {
            console.log("Trying to add traslated sentences for " + global.glb.iso1to3(language));
            await fsentence.addSentencesForLang(global.glb.iso1to3(language));
            sentences = await fsentence.tables[global.glb.iso1to3(language)].findAll({
                where: {
                    ['difficulty' + difficulty]: {
                        [Op.gt]: 0
                    }
                },
                order: fsentence.sequelize.random(),
                limit: 10,
            });
            if (sentences.length < 10) {
                console.log("Failed to add traslated sentences for " + global.glb.iso1to3(language));
                return res.status(400).send("Not enough quizzes");
            }
        }
        const progress = await models.Progress.create({
            UserId: user.id,
            language: global.glb.iso1to3(language),
            difficulty,
            words: [],
            quizzes: sentences
        });

    }
    await user.save();
    return res.send(await models.Progress.findAll({ where: { UserId: user.id } }));
}

module.exports.deleteAllProgress = async (req, res) => {
    const progress = await models.Progress.destroy({ where: {} });
    return res.send("Success");
}

module.exports.deleteProgress = async (req, res) => {
    const progress = await models.Progress.destroy({ where: { id: req.params.id } });
    return res.status(200).json(progress);
}

module.exports.updateProgress = async (req, res) => {
    const progress = await models.Progress.update(req.body, { where: { id: req.params.id } });
    return res.send(progress);
}

module.exports.getProgress = async (req, res) => {

    const user = req.user;
    const { language } = req.body;
    let progresses = await models.Progress.findAll({ where: { UserId: user.id, language: global.glb.iso1to3(language) } });
    res.send(progresses);
}

module.exports.getProgressByUser = async (req, res) => {
    const { jwt } = req.body;
    const email = jwtUtil.decode(jwt);
    const user = await models.User.findOne({ where: { email } });
    if (!user.jwts.includes(jwt)) return res.status(401).send("Unauthorized");
    const progress = await models.Progress.findAll({ where: { UserId: user.id } });
    return res.send(progress);
}

module.exports.submitLearnedWords = async (req, res) => {
    const user = req.user;
    
    console.log( { UserId: user.id, language: (req.body.language), difficulty: req.body.difficulty , words: req.body.words});
    const progress = await models.Progress.findOne({ where: { UserId: user.id, language: global.glb.iso1to3(req.body.language), difficulty: req.body.difficulty } });
    if (!progress) return res.status(400).send("Progress not found");
    progress.words = req.body.words;
    await progress.save();
    return res.send(progress);
}