const ffmpeg = require("fluent-ffmpeg");

const models = require("../models");
const jwtUtil = require("../utils/jwt");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");
const fs = require("fs");

const path = require("path");
const { join } = require("path");
const findPackageJson = require("find-package-json");
const nearestPackageJson = findPackageJson(join(__dirname, "fword"));
const rootDirectory = path.dirname(nearestPackageJson.next().filename);

module.exports.listVideos = async (req, res) => {
  const videos = await models.UBVideo.findAll();
  return res.send(videos);
};

module.exports.deleteAllVideos = async (req, res) => {
  const videos = await models.UBVideo.destroy({ where: {} });
  return res.send("Success");
};

module.exports.deleteVideo = async (req, res) => {
  const video = await models.UBVideo.destroy({ where: { id: req.params.id } });
  return res.status(200).json(video);
};

module.exports.updateVideo = async (req, res) => {
  const video = await models.UBVideo.update(req.body, {
    where: { id: req.params.id },
  });
  return res.send(video);
};

module.exports.getVideo = async (req, res) => {
  const video = await models.UBVideo.findOne({ where: { id: req.params.id } });
  return res.send(video);
};

module.exports.generateSubtitles = async (req, res) => {
  return res.send({});
};

module.exports.getSuggestedVideos = async (req, res) => {
  const videos = await models.UBVideo.findAll({
    order: models.sequelize.random(),
    limit: 50,
  });

  return res.send(videos);
};

module.exports.getHistory = async (req, res) => {
  const histories = await models.WatchHistory.findAll({
    where: {
      UserId: req.user,
    },
  });
};

module.exports.getVideoSelf = async (req, res) => {
  const videos = await models.UBVideo.findAll({
    where: { UserId: req.user.id },
    raw: true,
  });
  return res.send(videos);
};
module.exports.uploadVideos = async (req, res) => {
  if (!req.files) {
    return res.status(400).send("No file uploaded.");
  }
  let file = req.files.file[0];
  let thumbnail = req.files.thumbnail[0];

  const { title, name, description } = req.body;

  if (!title) {
    return res.status(400).send("Invalid video informations.");
  }

  // Read song.mp3 metadata
  console.log(thumbnail);
  let metadata = await getVideoMeta(file.filename);

  if (!metadata) return res.status(400).send("Invalid video informations.");
  console.log(metadata);
  const durationInSeconds = metadata.format.duration;
  const maxDuration = 10 * 60 * 60; // 10 hours in seconds

  if (durationInSeconds > maxDuration)
    return res.status(400).send("Video is too long.");

  let randName = uuidv4() + ".mp4";
  global.glb.moveSync(
    join(rootDirectory, "uploads", file.filename),
    join(rootDirectory, "ubuploadedvideos", randName)
  );
  console.log(req.user.id);
  let createdVideo = await models.UBVideo.create({
    title: title,
    description: description || "",
    fileName: randName,
    UserId: req.user.id,
  });
  
  if (thumbnail) {
    global.glb.moveSync(
      join(rootDirectory, "uploads", thumbnail.filename),
      join(rootDirectory, "static", "ubThumbnails", createdVideo.id + ".png")
    );
  }
  createdVideo.thumbnailUrl = "/static/ubThumbnails/" + createdVideo.id + ".png";
  await createdVideo.save();

  return res.status(200).send("File uploaded.");
};

async function getVideoMeta(fileName) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(
      join(rootDirectory, "uploads", fileName),
      function (err, metadata) {
        if (err) {
          console.log(err);
          return resolve(null);
        }
        return resolve(metadata);
      }
    );
  });
}

module.exports.getHistory = async (req, res) => {
  let history = await models.WatchHistory.findAll({
    where: {
      UserId: req.user.id,
      UBVideoId: {
        [Op.ne]: null,
      },
    },
    include: {
      model: models.UBVideo,
    },
  });
  return res.json(history);
};
module.exports.addHistory = async (req, res) => {
  let history = await models.WatchHistory.create({
    UBVideoId: req.body.id,
    UserId: req.user.id,
  });
  return res.json({ message: "added", history });
};

module.exports.streamVideo = async (req, res) => {
  let video = await models.UBVideo.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (!video) return res.status(404).send("Video not found");
  const range = req.headers.range;
  const videoPath = join(rootDirectory, "ubuploadedvideos", video.fileName);
  const videoSize = fs.statSync(videoPath).size;
  const chunkSize = 1 * 1e6;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + chunkSize, videoSize - 1);
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };
  res.writeHead(206, headers);
  const stream = fs.createReadStream(videoPath, {
    start,
    end,
  });
  stream.pipe(res);
};

module.exports.getUBSubtitles = async (req, res) => {
  return res.send(
    (await models.UBVideo.findOne({ where: { id: req.params.id } }))?.get({
      plain: true,
    }).subtitleWords || []
  );
};

module.exports.voteLanguageFunc = async (videoId, userId, languageVote) => {
  let video = await models.UBVideo.findOne({ where: { id: videoId } });
  if (!video) return;
  let userVote = await models.Vote.findOne({
    where: {
      UserId: userId,
      UBVideoId: video.id,
    },
  });
  if (!userVote) {
    userVote = await models.Vote.create({
      UserId: userId,
      UBVideoId: video.id,
      type: "langaugeVote",
      value: languageVote,
    });
  }
  userVote.value = languageVote;
  userVote.save();
  return video.votedLanguages;
};

module.exports.getMostVotedLanguageFunc = async (videoId) => {
  let video = await models.Video.findOne({
    where: {
      id: videoId,
    },
  });
  let allVotes = await models.Vote.findAll({
    where: {
      UBVideoId: video.id,
    },
  });
  let votes = {};
  allVotes.forEach((vote) => {
    if (!votes[vote.value]) votes[vote.value] = 0;
    votes[vote.value]++;
  });
  let max = 0;
  let maxLang = null;
  Object.keys(votes).forEach((key) => {
    if (votes[key] > max) {
      max = votes[key];
      maxLang = key;
    }
  });
  return maxLang;
};

module.exports.voteVideoLanguage = async (req, res) => {
  const { language } = req.body;
  if (!language) return res.status(400).send("Language not provided");
  return res.send(
    await module.exports.voteLanguageFunc(req.params.id, req.user.id, language)
  );
};

module.exports.getMostVotedLanguage = async (req, res) => {
  return res.send(await module.exports.getMostVotedLanguageFunc(req.params.id));
};

module.exports.listVotes = async (req, res) => {
  return res.send(
    await models.Vote.findAll({
      where: {
        UBVideoId: req.params.id,
      },
    })
  );
};
