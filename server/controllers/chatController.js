const fsentence = require("../fsentence");
const models = require("../models");
const jwtUtil = require("../utils/jwt");
const { Op } = require("sequelize");

module.exports.listChats = async (req, res) => {
    const chats = await models.Conversation.findAll();
    return res.send(chats);
}

module.exports.createChat = async (req, res) => {
    const user1 = req.user;
    const user2 = req.body.user2;
    const newChat = await models.Conversation.create({

    });
    await newChat.addUsers([user1, user2]);
    await newChat.save();
    return res.send(newChat);
}