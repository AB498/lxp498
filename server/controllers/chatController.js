const fsentence = require("../fsentence");
const models = require("../models");
const user = require("../models/user");
const jwtUtil = require("../utils/jwt");
const { Op } = require("sequelize");

module.exports.listChats = async (req, res) => {
    const chats = await models.Conversation.findAll();
    return res.send(chats);
}

module.exports.createChat = async (req, res) => {
    const user1 = req.user;
    const user2 = await models.User.findOne({ where: { id: req.body.otherUserId } });
    if (!user2) return res.status(400).send("User not found");
    const user1Id = user1.id;
    const user2Id = user2.id;

    const existingChat = await models.Conversation.findAll({
        include: [
            {
                model: models.User,
                where: {
                    id: {
                        [Op.or]: [user1Id, user2Id],
                    },
                },
                through: {
                    attributes: [], // Exclude join table attributes from the result
                    where: {
                        UserId: {
                            [Op.or]: [user1Id, user2Id],
                        },
                    },
                },
            },
        ],
        group: ['Conversation.id'], // To avoid duplicate conversations
        having: models.sequelize.literal(`COUNT(DISTINCT Users.id) = 2`), // Only include conversations with both users
    });

    if (existingChat && existingChat.length > 0) {
        const fetchedConversation = await models.Conversation.findOne({
            where: { id: existingChat[0].id },
            include: { model: models.User }
        });
        return res.send(fetchedConversation.toJSON());
    }

    const conversation = await models.Conversation.create({ name: user1.username + " - " + user2.username });
    await conversation.addUsers([user1, user2]);

    const fetchedConversation = await models.Conversation.findOne({
        where: { id: conversation.id },
        include: { model: models.User }
    });

    return res.send(fetchedConversation.toJSON());
}

module.exports.getAllUsers = async (req, res) => {
    const users = await models.User.findAll({
        where: {
            id: {
                [Op.not]: req.user.id,
            },
        },
    });
    return res.send(users.map((user) => user.toJSON()));
}
module.exports.openConversation = async (req, res) => {
    const conversationId = req.body.id;
    const conversation = await models.Conversation.findOne({
        where: { id: conversationId },
        include: { model: models.User }
    });
    return res.send(JSON.parse(JSON.stringify(conversation.toJSON())));
}