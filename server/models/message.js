const { Sequelize, DataTypes } = require('sequelize');

module.exports = sequelize => {


    const Message = sequelize.define('Message', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        ownId: {
            type: DataTypes.STRING,
            unique: true,
            defaultValue: Sequelize.UUIDV4
        },
        text: {
            type: DataTypes.STRING,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
    });


    return Message;
};
