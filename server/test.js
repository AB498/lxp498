// const { getWordsFromSentence } = require('./utils/SpacyTokenizer');
const models = require('./models');

const path = require('path');
const fs = require('fs');
const { join } = require('path');
const findPackageJson = require('find-package-json');
const nearestPackageJson = findPackageJson(join(__dirname));
const rootDirectory = path.dirname(nearestPackageJson.next().filename);

const s = require('./s');

const { videoAPIServices } = require(join(rootDirectory, 'utils', 'SubtitleServices'));
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
    // models.User.sync({ force: true });
    models.Video.sync({ force: true });
    // models.WatchHistory.sync({ force: true });
    // global.glb.accessToken = await global.glb.getAccessToken();
    // console.log(await videoAPIServices.generateSubtitles('UBUNrFtufWo', 'en', 'zh'));
})()