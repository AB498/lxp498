
const { Server } = require("socket.io");
const { v4: uuidv4 } = require('uuid');

const { createProxy, rjmod, rjget, rjwatch } = require('./ReactiveJSON');
const user = require("../models/user");
const jwtUtil = require("./jwt");
const models = require("../models");
const { default: axios } = require("axios");

const path = require('path');
const fs = require('fs');
const { join } = require('path');
const findPackageJson = require('find-package-json');
const nearestPackageJson = findPackageJson(join(__dirname));
const rootDirectory = path.dirname(nearestPackageJson.next().filename);

const { videoAPIServices } = require(join(rootDirectory, 'utils', 'SubtitleServices'));

makeServer = (server) => {
    let connections = []
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    })
    io.on('connection', async (socket) => {
        let blockemit = null;
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
        console.log(typeof user.createdAt, user.createdAt instanceof Date);
        delete user.password;
        delete user.jwts;
        connections.push({ user, socket });


        console.log(user.email + " connected");
        var syncerObj = createProxy({});
        let localChange = true;

        rjwatch(syncerObj, null, async (o, n, p, k, v) => { //(oldval, newval, modpath, key, value)
            try {
                if (blockemit == p) {
                    blockemit = null;
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
                    let msg = await models.Message.findByPk(v);
                    if (msg.UserId == user.id) await msg.destroy();
                    else return syncerObj.error = "You can only delete your own messages";
                    syncerObj.openChat.messages = (await models.Message.findAll({ where: { ConversationId: syncerObj.openChat.conversationId } })).map(m => m.dataValues);
                }
                if (p == '/openYTVideo/id') {
                    let vid = (await models.Video.findOne({ where: { ytId: v } }));
                    if (!vid) {
                        let vidInfo = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${v}&key=AIzaSyBOKyTuKxZ7JsseOhXzLvQ5ChVkYmtgG8Y`)
                        let inf = vidInfo.data.items[0].snippet
                        vid = (await models.Video.create({ ytId: v, title: inf.title, description: inf.description, thumbnailUrl: inf.thumbnails.default.url, info: inf }));
                    }
                    const plainData = vid.get({ plain: true });
                    syncerObj.openYTVideo.videoInfo = plainData;

                    videoAPIServices.addCallback(v, async ({ status, progress }) => {
                        syncerObj.openYTVideo.subtitlesStatus = status;
                        syncerObj.openYTVideo.subtitlesGenerationProgress = progress;
                        if (progress == 100) syncerObj.openYTVideo.subtitleWords = (await models.Video.findOne({ where: { ytId: v } })).get({ plain: true }).subtitleWords; b
                    })
                    videoAPIServices.generateSubtitles(v, 'en', 'zh')

                }
            } catch (e) {
                console.log(e)
            }
        }); //onchange

        socket.on('updateObj', ({ path, value }) => {
            try {
                console.log(`${'foreign change: '}: ${path} changed `)
                blockemit = path;
                rjmod(syncerObj, path, value);
            } catch (e) {
                console.log(e)
            }

        }); //onreceive

        socket.on('disconnect', () => {
            console.log('user disconnected');
            connections = connections.filter(c => c.socket.id != socket.id);

        });
    })
    return { io, connections }
}
module.exports = { makeServer }
