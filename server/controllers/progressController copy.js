const fsentence = require("../fsentence");
const models = require("../models");
const jwtUtil = require("../utils/jwt");
const { Op } = require("sequelize");

module.exports.listProgress = async (req, res) => {
    const progress = await models.Progress.findAll();
    return res.send(progress);
}

module.exports.createProgress = async (req, res) => {
    const headers = req.headers;
    if (!headers.authorization) return res.status(401).send("Unauthorized");
    const jwt = headers.authorization.split(" ")[1];
    const { language } = req.body;
    const decodedUser = await jwtUtil.decode(jwt);
    const email = decodedUser.email;
    if (!email) return res.status(401).send("Unauthorized");
    const user = await models.User.findOne({ where: { email } });
    if (!user) return res.status(400).send("User does not exist");
    if (!user.jwts.includes(jwt)) return res.status(401).send("Unauthorized");
    let progresses = await models.Progress.findAll({ where: { UserId: user.id, language: global.glb.iso1to3(language) } });
    console.log(user.id)
    if (progresses.length >= 6) return res.send(progresses);

    await fsentence.init();
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
    const headers = req.headers;
    if (!headers.authorization) return res.status(401).send("Unauthorized");
    const jwt = headers.authorization.split(" ")[1];
    const { language } = req.body;
    if (!language) return res.status(400).send("Language is required");
    const decodedUser = await jwtUtil.decode(jwt);
    const email = decodedUser.email;
    if (!email) return res.status(401).send("Unauthorized");
    const user = await models.User.findOne({ where: { email } });
    if (!user) return res.status(400).send("User does not exist");
    if (!user.jwts.includes(jwt)) return res.status(401).send("Unauthorized");
    let progresses = await models.Progress.findAll({ where: { UserId: user.id, language: language } });
    return res.send(progresses);
}

module.exports.getProgressByUser = async (req, res) => {
    const { jwt } = req.body;
    const email = jwtUtil.decode(jwt);
    const user = await models.User.findOne({ where: { email } });
    if (!user.jwts.includes(jwt)) return res.status(401).send("Unauthorized");
    const progress = await models.Progress.findAll({ where: { UserId: user.id } });
    return res.send(progress);
}