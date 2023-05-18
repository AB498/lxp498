const path = require('path');
const fs = require('fs');
const { join } = require('path');
const findPackageJson = require('find-package-json');
const nearestPackageJson = findPackageJson(join(__dirname));
const rootDirectory = path.dirname(nearestPackageJson.next().filename);
const { createProxy } = require(join(rootDirectory, 'tests', 'Proxify.js'));

const socketConnections = {};
const { v4: uuidv4 } = require('uuid');
const jwtUtil = require(join(rootDirectory, 'utils', 'jwt'));
const models = require(join(rootDirectory, 'models'));

global.socketConnections = socketConnections;

module.exports.manageSocketIO = (io) => {
    io.on('connection', async (socket) => {
        try {
            const headers = socket.handshake.headers;
            if (!headers.authorization) {
                console.log("No authorization header");
                socket.disconnect();
            }
            const jwt = headers.authorization.split(" ")[1];
            const decodedUser = await jwtUtil.decode(jwt);

            if (!decodedUser || !decodedUser.email || !decodedUser.id) {
                console.log("Invalid JWT", headers.authorization, decodedUser);
                socket.disconnect();
            }
            let user = await models.User.findByPk(decodedUser.id);
            if (!user || !user.jwts.includes(jwt)) {
                console.log("No user");
                socket.disconnect();
            }
            user = user.toJSON()
            delete user.password;
            delete user.jwts;
            console.log(user.createdAt, user.updatedAt);
            user.createdAt = JSON.stringify(user.createdAt);
            user.updatedAt = JSON.stringify(user.updatedAt);


            let userProxy = createProxy({ ...user, name: "Temp", ping: uuidv4() }, null, ['df'], [(path, value) => {
                // console.log(path, value, socketConnections[socket.id].info);
                socketConnections[socket.id].socket.emit('serverSynced', ({ ...socketConnections[socket.id].info }));
            }]);

            ping(socket);

            if (!socketConnections[socket.id])
                socketConnections[socket.id] = {};
            socketConnections[socket.id].socket = socket;
            socketConnections[socket.id].info = { self: userProxy };
            socketConnections[socket.id].interval = setInterval(() => {
                socketConnections[socket.id].info.onlineUsers =
                    (() => Object.keys(socketConnections).filter(key => socketConnections[key].info.self.email != socketConnections[socket.id].info.self.email).map(key => socketConnections[key].info.self))();
                userProxy.ping = uuidv4();
            }, 5000);

            console.log(socket.id + ' connected');
            socket.emit('serverSynced', { ...socketConnections[socket.id].info });
        } catch (e) {
            console.log(e)
        }
        socket.on('disconnect', () => {
            console.log('user disconnected');
            clearInterval(socketConnections[socket.id].interval);
            delete socketConnections[socket.id];
        });

        socket.on('chat message', (msg) => {
            console.log('message: ' + msg);
            io.emit('chat message', msg);
        });
        socket.on("ping", (callback) => {
            callback();
        });
    });

}
function ping(socket) {

    const start = Date.now();
    socket.emit("ping", () => {
        const duration = Date.now() - start;
        console.log("Ping to client: " + duration);
    });
}