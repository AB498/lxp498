const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    const User = sequelize.define('User', {
        firstName: DataTypes.STRING,
        lastName: DataTypes.STRING,
        dateOfBirth: DataTypes.DATE,
        username: DataTypes.STRING,
        password: DataTypes.STRING,
        email: {
            type: DataTypes.STRING,
            unique: true,
            required: true,
        },
        jwts: {
            type: DataTypes.TEXT,
            get: function () {
                return global.glb.tryParseJSON(this.getDataValue('jwts'));
            },
            set: function (value) {
                this.setDataValue('jwts', JSON.stringify(value));
            }
        },
        nativeLanguages: {
            type: DataTypes.TEXT,
            get: function () {
                return global.glb.tryParseJSON(this.getDataValue('nativeLanguages'));
            },
            set: function (value) {
                this.setDataValue('nativeLanguages', JSON.stringify(value));
            }
        },
        learningLanguages: {
            type: DataTypes.TEXT,
            get: function () {
                return global.glb.tryParseJSON(this.getDataValue('learningLanguages'));
            },
            set: function (value) {
                this.setDataValue('learningLanguages', JSON.stringify(value));
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
        stats: {
            type: DataTypes.TEXT,
            get: function () {
                let prgrs = this.Progresses || [];
                let languages = {}
                for (let i = 0; i < prgrs.length; i++) {
                    let prgr = prgrs[i];
                    if (!languages[prgr.language]) {
                        languages[prgr.language] = {
                            language: prgr.language,
                            count: 0,
                        }
                    }
                    languages[prgr.language].count += 1;
                }

                return { languages };
            }
        },
        gcpAccessToken: DataTypes.STRING,
        gcpRefreshToken: DataTypes.STRING,
        gcpTokenExpiry: DataTypes.STRING,
        gcpTokenScope: DataTypes.STRING,
        gcpTokenType: DataTypes.STRING,
        gcpIdToken: DataTypes.STRING,
        gcpProfile: {
            type: DataTypes.TEXT,
            get: function () {
                return global.glb.tryParseJSON(this.getDataValue('gcpProfile'));
            }
        },
        emailVerified: DataTypes.BOOLEAN,
        emailVerificationCode: DataTypes.STRING,
        emailVerificationCodeExpiry: DataTypes.STRING,
        loginType: DataTypes.STRING,
        pfpUrl: DataTypes.STRING,
        country: DataTypes.STRING,
        bio: DataTypes.STRING,
        lastLogin: DataTypes.DATE,
        lastLogout: DataTypes.DATE,
        lastIp: DataTypes.STRING,
        lastUserAgent: DataTypes.STRING,
        lastLocation: DataTypes.STRING,
        globalChatVisibility: DataTypes.STRING,

    });

    return User;
};
