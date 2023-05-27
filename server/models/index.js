const s = require('../s');
const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
const { join } = require('path');
const findPackageJson = require('find-package-json');
const nearestPackageJson = findPackageJson(join(__dirname));
const rootDirectory = path.dirname(nearestPackageJson.next().filename);

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: join(rootDirectory, 'database_main.sqlite'),
    logging: false
});

const User = require('./user')(sequelize);
const Progress = require('./progress')(sequelize);
const Video = require('./video')(sequelize);
const Message = require('./message')(sequelize);
const Conversation = require('./conversation')(sequelize);
const UBVideo = require('./ubvideo')(sequelize);
const WatchHistory = require('./watchhistory')(sequelize);
const Vote = require('./vote')(sequelize);

const UserConversation = sequelize.define('UserConversation', {});

User.belongsToMany(Conversation, { through: UserConversation });
Conversation.belongsToMany(User, { through: UserConversation });

User.hasMany(Progress);
Progress.belongsTo(User);

User.hasMany(Message);
Message.belongsTo(User);

User.hasMany(UBVideo);
UBVideo.belongsTo(User);

User.hasMany(Vote);
Vote.belongsTo(User);
Vote.belongsTo(Video);
Vote.belongsTo(UBVideo);

User.hasMany(WatchHistory);
WatchHistory.belongsTo(User);
WatchHistory.belongsTo(Video);
WatchHistory.belongsTo(UBVideo);

Conversation.hasMany(Message);
Message.belongsTo(Conversation);


async function init(opts) {
    await sequelize.sync(opts);
    // Progress.sync({ force: true });
}

module.exports = {
    init,
    User,
    Progress,
    Video,
    Message,
    Conversation,
    UBVideo,
    WatchHistory,
    Vote,
    sequelize
};
