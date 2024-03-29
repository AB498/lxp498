const models = require("../models");
const jwtUtil = require("../utils/jwt");
const bcrypt = require("bcrypt");
const axios = require("axios");

const fs = require("fs");

const path = require("path");
const { join } = require("path");
const findPackageJson = require("find-package-json");
const video = require("../models/video");
const nearestPackageJson = findPackageJson(join(__dirname, "fword"));
const rootDirectory = path.dirname(nearestPackageJson.next().filename);

module.exports.listVideos = async (req, res) => {
  const videos = await models.Video.findAll();
  return res.send(videos);
};

module.exports.deleteAllVideos = async (req, res) => {
  const videos = await models.Video.destroy({ where: {} });
  return res.send("Success");
};

module.exports.deleteVideo = async (req, res) => {
  const video = await models.Video.destroy({ where: { id: req.params.id } });
  return res.status(200).json(video);
};

module.exports.updateVideo = async (req, res) => {
  const video = await models.Video.update(req.body, {
    where: { id: req.params.id },
  });
  return res.send(video);
};

module.exports.getVideo = async (req, res) => {
  const video = await models.Video.findOne({ where: { id: req.params.id } });
  return res.send(video);
};

module.exports.generateSubtitles = async (req, res) => {
  return res.send({});
};

module.exports.getSuggestedVideos = async (req, res) => {
  const videos = fs.readFileSync(
    join(rootDirectory, "mockData", "suggestedVideos.json"),
    "utf8"
  );
  return res.send(videos);
};

module.exports.getYTSubtitles = async (req, res) => {
  return res.send(
    (await models.Video.findOne({ where: { ytId: req.params.id } }))?.get({
      plain: true,
    }).subtitleWords || []
  );
};

module.exports.getYTComments = async (req, res) => {
  return res.json((await this.getYTCommentsFunc(req.params.id)) || []);
};

module.exports.getYTCommentsFunc = async (videoId) => {
  let fromDb = (await models.Video.findOne({ where: { ytId: videoId } }))?.get({
    plain: true,
  }).comments;
  fromDb = global.glb.isIterable(fromDb) ? fromDb : null;
  if (fromDb) return fromDb;
  let [err, result] = await global.glb.safeAsync(
    axios.get(
      `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&key=${process.env.YOUTUBE_API_KEY}`
    )
  );
  if (err || !result) return null;
  await models.Video.update(
    { comments: result.data },
    { where: { ytId: videoId } }
  );
  return result.data;
};

module.exports.voteVideoLanguage = async (req, res) => {
  let video = await models.Video.findOne({ where: { ytId: req.params.id } });
  if (!video) {
    video = await models.Video.create({
      ytId: req.params.id,
    });
  }
  const { language } = req.body;
  if (!language) return res.status(400).send("Language not provided");

  let userVote = await models.Vote.findOne({
    where: {
      UserId: req.user.id,
      VideoId: video.id,
    },
  });
  if (!userVote) {
    userVote = await models.Vote.create({
      UserId: req.user.id,
      VideoId: video.id,
      type: "langaugeVote",
      value: language,
    });
  }
  userVote.value = language;
  userVote.save();

  return res.send(video.votedLanguages);
};

module.exports.getMostVotedLanguage = async (req, res) => {
  let video = await models.Video.findOne({
    where: {
      ytId: req.params.id,
    },
  });
  if(!video) return res.send(null);
  let allVotes = await models.Vote.findAll({
    where: {
      VideoId: video.id,
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
  return res.send(maxLang);
};

module.exports.listVotes = async (req, res) => {
  let video = await models.Video.findOne({
    where: {
      ytId: req.params.id,
    }
  });
  const votes = await models.Vote.findAll({
    where: { VideoId: video.id },
  });
  return res.send(votes);
};


module.exports.getMostVotedLanguageFunc = async (videoId) => {
  let video = await models.Video.findOne({
    where: {
      ytId: videoId,
    },
  });
  if (!video) return res.send(null);
  let allVotes = await models.Vote.findAll({
    where: {
      VideoId: video.id,
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

module.exports.voteLanguageFunc = async (videoId, userId, langaugeVote) => {
  let video = await models.Video.findOne({ where: { ytId: videoId } });
  if (!video) {
    video = await models.Video.create({
      ytId: videoId,
    });
  }
  if (!langaugeVote) return;
  let userVote = await models.Vote.findOne({
    where: {
      UserId: userId,
      VideoId: video.id,
    },
  });
  if (!userVote) {
    userVote = await models.Vote.create({
      UserId: userId,
      VideoId: video.id,
      type: "langaugeVote",
      value: langaugeVote,
    });
  }
  userVote.value = langaugeVote;
  userVote.save();
  return video.votedLanguages;
  
};
