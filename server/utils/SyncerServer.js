
const { Server } = require("socket.io");
const { v4: uuidv4 } = require('uuid');

const { createProxy, rjmod, rjget, rjwatch } = require('./ReactiveJSON');
const user = require("../models/user");



makeServer = (server) => {
    let connections = {}
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    })
    io.on('connection', async (socket) => {
        let user = null;
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
            user = await models.User.findByPk(decodedUser.id);
            if (!user || !user.jwts.includes(jwt)) {
                console.log("No user");
                socket.disconnect();
                return;
            }
        } catch (e) {
            console.log(e)
        }
        connections[socket.id] = socket;
        console.log(Object.keys(connections).length + " users connected");
        var syncerObj = createProxy({});
        let localChange = true;

        console.log("rjwatching")
        rjwatch(syncerObj, null, (o, n, p, k, v) => { //(oldval, newval, modpath, key, value)
            if (localChange) {
                socket.emit("updateObj", { path: p, value: v });
                console.log("emit: ", p, v)
            }
            // console.log(`${localChange ? "local: " : "forign: "}: ${JSON.stringify(o)} to ${JSON.stringify(n)}`)
            console.log(localChange, p, '/openChat/email')
            if (p == '/openChat/converstionId') {
                console.log(user.email, v)
                console.log(`Requested open chat ${uuidv4()}`);
                localChange = true;
                syncerObj.openChat.messages = [user.email, v];
                localChange = false;
            }
        }); //onchange

        socket.on('updateObj', ({ path, value }) => {
            localChange = false;
            console.log(`${'foreign change: '}: ${path} changed `)
            rjmod(syncerObj, path, value);
            localChange = true;
        }); //onreceive

        socket.on('disconnect', () => {
            console.log('user disconnected');
            delete connections[socket.id]
        });
    })
    return { io, connections }
}
module.exports = { makeServer }
