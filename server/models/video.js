const { Sequelize, DataTypes } = require('sequelize');

module.exports = sequelize => {

    const Video = sequelize.define('Video', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        ownId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            defaultValue: Sequelize.UUIDV4,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
        },
        ytId: {
            type: DataTypes.STRING,
            unique: true,
        },
        downloaded: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
        },
        subtitlesAvailable: {
            type: DataTypes.INTEGER,
            defaultValue: -1,
        },
        downloadFile: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        subtitleWords: {
            type: DataTypes.STRING,
            defaultValue: '[]',
            get() {
                return global.glb.tryParseJSON(this.getDataValue('subtitleWords'));
            },
            set(value) {
                this.setDataValue('subtitleWords', global.glb.tryStringify(value) || '[]');
            }
        },
        title: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        description: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        thumbnailUrl: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        votedLanguages: {
            type: DataTypes.STRING,
            defaultValue: '{}',
        },
        subtitleRequester: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        subtitleGenerationProgress: {
            type: DataTypes.FLOAT,
            defaultValue: -1,
        },
        views: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        likes: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        comments: {
            type: DataTypes.STRING,
            set(value) {
                this.setDataValue('comments', global.glb.tryStringify(value));
            },
            get() {
                return global.glb.tryParseJSON(this.getDataValue('comments'));
            }
        },
        info: {
            type: DataTypes.STRING,
            set(value) {
                this.setDataValue('info', global.glb.tryStringify(value));
            },
            get() {
                return global.glb.tryParseJSON(this.getDataValue('info'));
            }
        },
    });

    return Video;
};
