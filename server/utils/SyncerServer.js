
const { Server } = require("socket.io");
const { v4: uuidv4 } = require('uuid');

const { createProxy, rjmod, rjget, rjwatch } = require('./ReactiveJSON');
const user = require("../models/user");
const jwtUtil = require("./jwt");
const models = require("../models");


makeServer = (server) => {
    let connections = []
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    })
    io.on('connection', async (socket) => {
        let user = null;
        try {
            const headers = socket.handshake.headers;
            if (!headers.authorization) {
                console.log("No authorization header");
                return socket.disconnect();
            }
            const jwt = headers.authorization.split(" ")[1];
            const decodedUser = await jwtUtil.decode(jwt);

            if (!decodedUser || !decodedUser.email || !decodedUser.id) {
                console.log("Invalid JWT", headers.authorization, decodedUser);
                return socket.disconnect();
            }
            user = await models.User.findByPk(decodedUser.id);
            if (!user || !user.jwts.includes(jwt)) {
                console.log("No user");
                return socket.disconnect();
            }
        } catch (e) {
            return console.log(e)
        }
        if (connections.find(c => c.user.id == user.id)) {
            console.log("Already connected");
            return socket.disconnect();
        }
        user = user.toJSON()
        delete user.password;
        delete user.jwts;
        connections.push({ user, socket });


        console.log(user.email + " connected");
        var syncerObj = createProxy({});
        let localChange = true;

        rjwatch(syncerObj, null, async (o, n, p, k, v) => { //(oldval, newval, modpath, key, value)
            if (syncerObj.blockemit == p) {
                syncerObj.blockemit = null;
            } else {
                socket.emit("updateObj", { path: p, value: v });
            }

            if (p == '/openChat/conversationId') {
                syncerObj.openChat.messages = (await models.Message.findAll({ where: { ConversationId: v } })).map(m => m.dataValues);
            }
            if (p == '/openChat/addMessage') {
                await models.Message.create({ ConversationId: syncerObj.openChat.conversationId, UserId: user.id, text: v });
                syncerObj.openChat.messages = (await models.Message.findAll({ where: { ConversationId: syncerObj.openChat.conversationId } })).map(m => m.dataValues);
            }
            if (p == '/openChat/deleteMessage') {
                await models.Message.destroy({ where: { id: v } });
                syncerObj.openChat.messages = (await models.Message.findAll({ where: { ConversationId: syncerObj.openChat.conversationId } })).map(m => m.dataValues);
            }
        }); //onchange

        socket.on('updateObj', ({ path, value }) => {
            try {
                console.log(`${'foreign change: '}: ${path} changed `)
                syncerObj.blockemit = path;
                rjmod(syncerObj, path, value);
            } catch (e) {
                console.log(e)
            }

        }); //onreceive

        socket.on('disconnect', () => {
            console.log('user disconnected');
            delete connections[socket.id]
        });
    })
    return { io, connections }
}
module.exports = { makeServer }
