const { createCanvas, registerFont } = require("canvas");
// const { getWordsFromSentence } = require('./utils/SpacyTokenizer');
const models = require("./models");

const path = require("path");
const fs = require("fs");
const { join } = require("path");
const findPackageJson = require("find-package-json");
const nearestPackageJson = findPackageJson(join(__dirname));
const rootDirectory = path.dirname(nearestPackageJson.next().filename);

const s = require("./s");
// const fword = require("./fword");
const translationServices = require(join(
  rootDirectory,
  "utils",
  "TranslationServices"
));

const { videoAPIServices } = require(join(
  rootDirectory,
  "utils",
  "SubtitleServices"
));

// function savePng(initials) {
//   return new Promise((resolve, reject) => {
//     // Set up canvas dimensions
//     const canvasWidth = 200;
//     const canvasHeight = 200;

//     // Initialize canvas
//     const canvas = createCanvas(canvasWidth, canvasHeight);
//     const context = canvas.getContext("2d");

//     // Set background color
//     context.fillStyle = "#f0f0f0";
//     context.fillRect(0, 0, canvasWidth, canvasHeight);

//     // Set text properties
//     const fontSize = 80;
//     const fontFamily = "Arial";
//     const textColor = "#000000";

//     context.font = `${fontSize}px ${fontFamily}`;
//     context.textAlign = "center";
//     context.textBaseline = "middle";
//     context.fillStyle = textColor;

//     // Position the initials at the center of the canvas
//     const textX = canvasWidth / 2;
//     const textY = canvasHeight / 2;
//     context.fillText(initials, textX, textY);

//     // Generate the PNG file
//     const filePath = "avatar.png"; // Replace with the desired file path and name

//     const out = fs.createWriteStream(filePath);
//     const stream = canvas.createPNGStream();
//     stream.pipe(out);
//     out.on("finish", () => {
//       console.log(`Saved avatar initials as ${filePath}`);
//       resolve(filePath);
//     });
//   });
// }
(async () => {
  // console.log(await getWordsFromSentence('zh', '我只是不知道该说什么。'))
  // console.log(await getWordsFromSentence('zh', '我只是不知道该说什么。'))
  // console.log(await getWordsFromSentence('zh', '我只是不知道该说什么。'))
  // console.log(await getWordsFromSentence('zh', '我只是不知道该说什么。'))
  // console.log(await getWordsFromSentence('zh', '我只是不知道该说什么。'))
  // const user1 = await models.User.create({
  //     email: 'a',
  //     password: 'a',
  //     jwts: ['a']
  // });
  // // console.log(user1)
  // const user2 = await models.User.findOne({ where: { id: 5 } });
  // const conversation = await models.Conversation.create({ name: 'My Conversation' });
  // await conversation.addUsers([user1, user2]);
  // const fetchedConversation = await models.Conversation.findOne({
  //     where: { id: conversation.id }ffmpeg
  //     include: { model: models.User }
  // });
  // console.log(fetchedConversation.Users);
  await models.User.sync({ alter: true });
  // models.Video.sync({ force: true });
  // models.WatchHistory.sync({ force: true });
  // global.glb.accessToken = await global.glb.getAccessToken();
  // console.log(await videoAPIServices.generateSubtitles('UBUNrFtufWo', 'en', 'zh'));
  // console.log(await translationServices.getTranslation(['hello', 'test1'], 'en', 'ar'))
  // console.log((await fword.Word.findOne({
  //     where: {
  //         eng: 'test1'
  //     },
  // })).get({ plain: true }))
  //   const arr = [
  //     { name: "John", age: 30 },
  //     { name: "Peter", age: 25 },
  //   ];
  //   const index = arr.findIndex((e) => e.name === "John");
  //   index != -1 && arr.splice(index, 1);
  //   console.log(arr); // [ { age: 25, name: 'Peter' } ]

  // await savePng("A");
  // console.log(s.iso1to3('ja'))
  
  
})();
