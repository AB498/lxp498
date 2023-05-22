
const { Server } = require("socket.io");
const { v4: uuidv4 } = require('uuid');

const { createProxy, rjmod, rjget, rjwatch } = require('./ReactiveJSON');



makeServer = (server) => {
    let connections = {}
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    })
    io.on('connection', async (socket) => {
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
            console.log('mod done')

            // console.log(`${localChange ? "local: " : "forign: "}: ${JSON.stringify(o)} to ${JSON.stringify(n)}`)
            console.log(localChange, p, '/openChat/email')
            if (p == '/openChat/email' || p == '/openChat/user') {
                let email = v;
                console.log(`Requested open chat ${uuidv4()}`);
                localChange = true;
                syncerObj.openChat.messages = [uuidv4()];
                localChange = false;
            }
        }); //onchange

        socket.on('updateObj', ({ path, value }) => {
            localChange = false;
            console.log(`${'foreign change: '}: ${path} changed to ${JSON.stringify(value)}`)
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
