const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    const Progress = sequelize.define('Progress', {
        difficulty: DataTypes.INTEGER,
        data: {
            type: DataTypes.TEXT,
            get: function () {
                return global.glb.tryParseJSON(this.getDataValue('data'));
            },
            set: function (value) {
                this.setDataValue('data', JSON.stringify(value));
            },
        },
        quizzes: {
            type: DataTypes.TEXT,
            get: function () {
                return global.glb.tryParseJSON(this.getDataValue('quizzes'));
            },
            set: function (value) {
                this.setDataValue('quizzes', JSON.stringify(value));
            }
        },
        words: {
            type: DataTypes.TEXT,
            get: function () {
                return global.glb.tryParseJSON(this.getDataValue('words'));
            },
            set: function (value) {
                this.setDataValue('words', JSON.stringify(value));
            }
        },
        language: DataTypes.STRING,

    });

    return Progress;
};
