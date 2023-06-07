const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const { createProxy, rjmod, rjget, rjwatch } = require("./ReactiveJSON");
const user = require("../models/user");
const jwtUtil = require("./jwt");
const models = require("../models");
const { default: axios } = require("axios");

const path = require("path");
const fs = require("fs");
const { join } = require("path");
const findPackageJson = require("find-package-json");
const nearestPackageJson = findPackageJson(join(__dirname));
const rootDirectory = path.dirname(nearestPackageJson.next().filename);

const { videoAPIServices } = require(join(
  rootDirectory,
  "utils",
  "SubtitleServices"
));
const { ubVideoAPIServices } = require(join(
  rootDirectory,
  "utils",
  "UBSubtitleServices"
));
const videoController = require(join(
  rootDirectory,
  "controllers",
  "videoController"
));
const ubVideoController = require(join(
  rootDirectory,
  "controllers",
  "ubController"
));

makeServer = (server, connections) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  io.on("connection", async (socket) => {
    let blockemit = null;
    let user = null;
    let inititalMessagesLimit = 100;
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
      // if (connections.find((c) => c.user.id == user.id)) {
      //   // console.log("Already connected");
      //   // return socket.disconnect();
      // }
      user = user.toJSON();
      console.log(typeof user.createdAt, user.createdAt instanceof Date);
      delete user.password;
      delete user.jwts;

      console.log(user.email + " connected", socket.id);
      var syncerObj = createProxy({});

      connections[socket.id] = { user, socket, syncerObj };
      console.log("connections", Object.keys(connections).length);
      console.log("connections", Object.keys(connections));
      let localChange = true;

      rjwatch(syncerObj, null, async (o, n, p, k, v) => {
        //(oldval, newval, modpath, key, value)
        try {
          if (blockemit == p) {
            blockemit = null;
          } else {
            socket.emit("updateObj", { path: p, value: v });
          }

          if (p == "/openChat/conversationId") {
            syncerObj.openChat.messages = (
              await models.Message.findAll({
                where: { ConversationId: v },
                limit: inititalMessagesLimit,
                order: [["createdAt", "DESC"]],
              })
            )
              .map((m) => m.dataValues)
              .sort((a, b) => a.createdAt - b.createdAt);
            syncerObj.openChat.messagesResponded = true;
          }
          if (p == "/openChat/addMessage") {
            await models.Message.create({
              ConversationId: syncerObj.openChat.conversationId,
              UserId: user.id,
              text: v,
            });
            syncerObj.openChat.messages = (
              await models.Message.findAll({
                where: {
                  ConversationId: syncerObj.openChat.conversationId,
                },
                limit: inititalMessagesLimit,
                order: [["createdAt", "DESC"]],
              })
            )
              .map((m) => m.dataValues)
              .sort((a, b) => a.createdAt - b.createdAt);
          }
          if (p == "/openChat/deleteMessage") {
            let msg = await models.Message.findByPk(v);
            if (msg.UserId == user.id) await msg.destroy();
            else
              return (syncerObj.error =
                "You can only delete your own messages");
            syncerObj.openChat.messages = (
              await models.Message.findAll({
                where: {
                  ConversationId: syncerObj.openChat.conversationId,
                },
                limit: inititalMessagesLimit,
                order: [["createdAt", "DESC"]],
              })
            )
              .map((m) => m.dataValues)
              .sort((a, b) => a.createdAt - b.createdAt);
          }
          if (p == "/openYTVideo/id") {
            let res = await videoController.getYTCommentsFunc(v);
            if (!res)
              syncerObj.openYTVideo.commentsError = "Comments Unavailable";
            else syncerObj.openYTVideo.commentsError = null;

            syncerObj.openYTVideo.comments = res;

            let vid = await models.Video.findOne({ where: { ytId: v } });
            if (!vid) {
              let vidInfo = await axios.get(
                `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${v}&key=AIzaSyBOKyTuKxZ7JsseOhXzLvQ5ChVkYmtgG8Y`
              );
              let inf = vidInfo.data.items[0].snippet;
              vid = await models.Video.create({
                ytId: v,
                title: inf.title,
                description: inf.description,
                thumbnailUrl: inf.thumbnails.default.url,
                info: inf,
              });
            }
            const plainData = vid.get({ plain: true });
            syncerObj.openYTVideo.videoInfo = plainData;

            videoAPIServices.addCallback(v, async ({ status, progress }) => {
              syncerObj.openYTVideo.subtitlesStatus = status;
              syncerObj.openYTVideo.subtitlesGenerationProgress = progress;
              if (progress == 100) {
                syncerObj.openYTVideo.subtitlesStatus = 1;
                syncerObj.openYTVideo.subtitlesGenerationProgress = 100;
              }
            });
          }
          if (p == "/openYTVideo/generateSubtitles") {
            let mostVoted = await videoController.getMostVotedLanguageFunc(v);
            console.log(mostVoted);
            if (!mostVoted) {
              syncerObj.error = "No votes yet";
              return;
            }
            videoAPIServices.generateSubtitles(v, mostVoted);
          }
          if (p == "/openUBVideo/generateSubtitles") {
            let mostVoted = await ubVideoController.getMostVotedLanguageFunc(v);
            console.log(mostVoted);
            if (!mostVoted) {
              syncerObj.error = "No votes yet";
              return;
            }
            ubVideoAPIServices.generateSubtitles(v, mostVoted);
          }

          if (p == "/openUBVideo/id") {
            let vid = await models.UBVideo.findOne({ where: { id: v } });
            const plainData = vid.get({ plain: true });
            syncerObj.openUBVideo.videoInfo = plainData;
            ubVideoAPIServices.addCallback(v, async ({ status, progress }) => {
              syncerObj.openUBVideo.subtitlesStatus = status;
              syncerObj.openUBVideo.subtitlesGenerationProgress = progress;
              if (progress == 100) {
                syncerObj.openUBVideo.subtitlesStatus = 1;
                syncerObj.openUBVideo.subtitlesGenerationProgress = 100;
              }
            });
          }
          if (p == "/openUBVideo/voteLanguage") {
            syncerObj.openUBVideo.voteDone =
              await ubVideoController.voteLanguageFunc(
                syncerObj.openUBVideo.id,
                user.id,
                v
              );
            syncerObj.openUBVideo.mostVoted =
              await ubVideoController.getMostVotedLanguageFunc(
                syncerObj.openUBVideo.id
              );
          }
          if (p == "/openUBVideo/getMostVotedLanguage") {
            syncerObj.openUBVideo.mostVoted =
              await ubVideoController.getMostVotedLanguageFunc(v);
          }
          if (p == "/openYTVideo/voteLanguage") {
            syncerObj.openYTVideo.voteDone =
              await videoController.voteLanguageFunc(
                syncerObj.openYTVideo.id,
                user.id,
                v
              );
            syncerObj.openYTVideo.mostVoted =
              await videoController.getMostVotedLanguageFunc(
                syncerObj.openYTVideo.id
              );
          }
          if (p == "/openYTVideo/getMostVotedLanguage") {
            syncerObj.openYTVideo.mostVoted =
              await videoController.getMostVotedLanguageFunc(v);
          }

          if (p == "/userSettings") {
            let [key, value] = Object.entries(v)[0];
            let userGot = await models.User.findByPk(user.id);
            userGot[key] = value;
            console.log(userGot, key, value);
            await userGot.save();
          }
        } catch (e) {
          console.log(e);
        }
      }); //onchange
      socket.emit("updateObj", { path: "/", value: syncerObj });
      socket.on("updateObj", ({ path, value }) => {
        try {
          console.log(`${"foreign change: "}: ${path} changed `);
          blockemit = path;
          rjmod(syncerObj, path, value);
        } catch (e) {
          console.log(e);
        }
      }); //onreceive

      socket.on("disconnect", () => {
        console.log("user disconnected", socket.id, Object.keys(connections));
        delete connections[socket.id];
      });
    } catch (e) {
      delete connections[socket.id];
      socket.disconnect();

      console.log(e);
    }
  });
  return { io, connections };
};
module.exports = { makeServer };
