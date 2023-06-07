const models = require("../models");
const jwtUtil = require("../utils/jwt");
const bcrypt = require("bcrypt");

const { v4: uuidv4 } = require("uuid");

const path = require("path");
const fs = require("fs");
const { join } = require("path");
const findPackageJson = require("find-package-json");
const nearestPackageJson = findPackageJson(join(__dirname));
const rootDirectory = path.dirname(nearestPackageJson.next().filename);
const {
  generateFromEmail,
  generateUsername,
} = require("unique-username-generator");
const { Op } = require("sequelize");

module.exports.registerUser = async (req, res) => {
  let { email, password, username, firstName, lastName } = req.body;
  const existingUser = await models.User.findOne({
    where: {
      [Op.or]: [{ email: email }, { username: username || "" }],
    },
  });

  if (existingUser) return res.status(400).send("User already exists");

  let usernameRollIteration = 1;
  while (
    !username ||
    (await models.User.findOne({ where: { username: username } }))
  ) {
    username = generateUsername("-");
    usernameRollIteration++;
    if (usernameRollIteration % 10)
      console.log(
        "Warning: username roll iteration exceeded " + usernameRollIteration
      );
  }
  if (!firstName && !lastName) {
    firstName = generateFromEmail(email);
  }
  // let tempName = uuidv4();
  const user = await models.User.create({
    email,
    password: password ? bcrypt.hashSync(password, 10) : null,
    username,
    firstName,
    lastName,
  });
  let newJwt = await jwtUtil.encode({ id: user.id, email: user.email });
  user.jwts = [newJwt, ...(user.jwts ??= [])];
  let pfpUrl = await global.glb.savePng(
    ((firstName || "")[0] || "") + ((lastName || "")[0] || ""),
    join(rootDirectory, "static", "pfps", user.id + ".png")
  );
  user.pfpUrl ="/" + join("static", "pfps", user.id + ".png");

  await user.save();
  return res.json({ user, jwt: newJwt, username, firstName, lastName });
};
module.exports.getSelf = async (req, res) => {
  const user = await models.User.findOne({
    where: { email: req.user.email },
    include: [
      { model: models.Progress, attributes: ["id", "language"] },
      { model: models.Conversation },
    ],
  });
  if (!user) return res.status(401).send("Unauthorized");
  return res.send({ user, jwt: req.jwt });
};

module.exports.loginUser = async (req, res) => {
  console.log("loginUser");
  const { email, password } = req.body;
  const user = await models.User.findOne({
    where: { email },
    include: [
      { model: models.Progress, attributes: ["id", "language"] },
      { model: models.Conversation },
    ],
  });
  if (!user) return res.status(401).send("Unauthorized");
  if (user.loginType === "google")
    return res.status(401).json({
      lxerrormessage: "User has no password. Please login in some other way.",
    });
  if (!bcrypt.compareSync(password, user.password))
    return res.status(401).send("Unauthorized");
  let newJwt = await jwtUtil.encode({ id: user.id, email: user.email });
  user.jwts = [newJwt, ...(user.jwts ??= [])];
  await user.save();
  return res.json({ user, jwt: newJwt });
};

module.exports.getUserByEmail = async (req, res) => {
  const user = await models.User.findOne({
    where: { email: req.params.email },
  });
  return res.send(user);
};

module.exports.getUser = async (req, res) => {
  const user = await models.User.findOne({
    where: { id: req.params.id },
    include: [{ model: models.Progress, attributes: ["id", "language"] }],
  });
  if (!user) return res.status(401).send("Unauthorized");
  return res.send(user);
};
module.exports.deleteAllUsers = async (req, res) => {
  const users = await models.User.destroy({ where: {} });
  return res.send("Success");
};

module.exports.deleteUser = async (req, res) => {
  const user = await models.User.destroy({ where: { id: req.params.id } });
  console.log(req.params.id);
  return res.status(200).json(user);
};

module.exports.updateUser = async (req, res) => {
  const user = await models.User.update(req.body, {
    where: { id: req.params.id },
  });
  return res.send(user);
};

module.exports.listUsers = async (req, res) => {
  const users = await models.User.findAll();
  return res.send(users);
};

module.exports.updateSelf = async (req, res) => {
  let infoToUpdate = ({
    firstName,
    lastName,
    username,
    password,
    email,
    learningLanguages,
    nativeLanguages,
    country,
  } = req.body);

  let pfpFile = req.file;

  if (pfpFile) {
     global.glb.moveSync(
       join(rootDirectory, "uploads", pfpFile.filename),
       join(rootDirectory, "static", "pfps", req.user.id + ".png")
     );
    infoToUpdate.pfpUrl = "/" + join("static", "pfps", req.user.id + ".png");
  }

  let foundUser =
    (await models.User.findAll({
      where: {
        [Op.or]: [{ email: email || "" }, { username: username || "" }],
      },
      raw: true,
    })) || null;
  console.log(
    foundUser.map((e) => e.id),
    req.user.id,
    password
  );
  if (password && password != "") {
    password = bcrypt.hashSync(password, 10);
    infoToUpdate.password = password;
    infoToUpdate.loginType = "password";
  }
  if (foundUser && foundUser.some((user) => user.id != req.user.id)) {
    console.log("foundUser");
    return res.status(400).send("Email/username already exists");
  }
  console.log(infoToUpdate);
  infoToUpdate = Object.fromEntries(
    Object.entries(infoToUpdate).filter(([_, v]) => v != null && v != "")
  );
  const user = await models.User.update(infoToUpdate, {
    where: { id: req.user.id },
  });
  console.log(user);
  return res.send(user);
};
