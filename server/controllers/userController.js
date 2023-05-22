const models = require("../models");
const jwtUtil = require("../utils/jwt");
const bcrypt = require("bcrypt");
const { generateFromEmail, generateUsername } = require("unique-username-generator");

module.exports.registerUser = async (req, res) => {
    const { email, password, username, firstName, lastName } = req.body;
    const existingUser = await models.User.findOne({ where: { email: email } });
    if (existingUser) return res.status(400).send("User already exists");
    const user = await models.User.create({ email, password: bcrypt.hashSync(password, 10) });


    let usernameRollIteration = 0;
    if (!username)
        while (await models.User.findOne({ where: { username: username } })) {
            username = generateUsername("-");
            usernameRollIteration++;
            if (usernameRollIteration % 10) console.log("Warning: username roll iteration exceeded " + usernameRollIteration)
        }
    if (!firstName && !lastName) {
        firstName = generateFromEmail(email).split(" ")[0];
    }
    let newJwt = await jwtUtil.encode({ id: user.id, email: user.email });
    user.jwts = [newJwt, ...(user.jwts ??= [])];
    await user.save();
    return res.json({ user, jwt: newJwt, username });
}
module.exports.getSelf = async (req, res) => {
    const user = await models.User.findOne({
        where: { email: req.user.email },
        include: [
            { model: models.Progress, attributes: ['id', 'language'] },
            { model: models.Conversation },
        ],
    });
    if (!user) return res.status(401).send("Unauthorized");
    return res.send({ user, jwt: req.jwt });
}

module.exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await models.User.findOne({
        where: { email },
        include: [
            { model: models.Progress, attributes: ['id', 'language'] },
            { model: models.Conversation },
        ],
    });
    if (!user) return res.status(401).send("Unauthorized");
    if (user.loginType === 'google') return res.status(401).json({ lxerrormessage: "User has no password. Please login in some other way." });
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).send("Unauthorized");
    let newJwt = await jwtUtil.encode({ id: user.id, email: user.email });
    user.jwts = [newJwt, ...(user.jwts ??= [])];
    await user.save();
    return res.json({ user, jwt: newJwt });
}

module.exports.getUserByEmail = async (req, res) => {
    const user = await models.User.findOne({ where: { email: req.params.email } });
    return res.send(user);
}

module.exports.getUser = async (req, res) => {
    const user = await models.User.findOne({
        where: { id: req.params.id },
        include: [{ model: models.Progress, attributes: ['id', 'language'] }],
    });
    if (!user) return res.status(401).send("Unauthorized");
    return res.send(user);
}
module.exports.deleteAllUsers = async (req, res) => {
    const users = await models.User.destroy({ where: {} });
    return res.send("Success");
}

module.exports.deleteUser = async (req, res) => {
    const user = await models.User.destroy({ where: { id: req.params.id } });
    return res.status(200).json(user);
}

module.exports.updateUser = async (req, res) => {
    const user = await models.User.update(req.body, { where: { id: req.params.id } });
    return res.send(user);
}

module.exports.listUsers = async (req, res) => {
    const users = await models.User.findAll();
    return res.send(users);
}