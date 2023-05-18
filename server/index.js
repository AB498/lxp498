const isDev = true;

const s = require('./s');
const models = require("./models");
const fword = require("./fword");
const httpProxy = require('http-proxy');
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require("socket.io");
const { v4: uuidv4 } = require('uuid');
const progressController = require('./controllers/progressController');
const userController = require('./controllers/userController');
const videoController = require('./controllers/videoController');
const ubController = require('./controllers/ubController');
const adminController = require('./controllers/adminController');

const { manageSocketIO } = require('./socketIO');
//server setup
const rootDirectory = path.dirname(require.main.filename);
const port = 80;
var accessToken = "";
const app = express();
const server = http.createServer(app);
const proxy = httpProxy.createProxyServer();

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

manageSocketIO(io);
app.use(
    cors({
        origin: "*",
    })
);
app.use(express.json());



const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

function logResponse(req, res, next) {
    const oldSend = res.send;
    const oldJson = res.json;

    if (!req.originalUrl.includes("admin")) {

        let reqObj = {};
        reqObj.unqId = uuidv4();
        reqObj.method = req.method;
        reqObj.URL = req.originalUrl;
        reqObj.headers = (req.headers);
        reqObj.body = (req.body);
        reqObj.query = (req.query);
        reqObj.params = (req.params);
        s.logStuff('requestLog.result', reqObj);
        res.send = function () {
            let body = arguments[0];
            let respObj = s.isJSON(body) ? JSON.parse(body) : (s.isObject(body) ? body : { resp: body })
            respObj.unqId = reqObj.unqId;
            s.logStuff('responseLog.result', respObj);
            oldSend.apply(res, arguments);
        };

        res.json = function () {
            let body = arguments[0];
            let respObj = s.isJSON(body) ? JSON.parse(body) : (s.isObject(body) ? body : { resp: body })
            respObj.unqId = reqObj.unqId;
            s.logStuff('responseLog.result', respObj);
            oldJson.apply(res, arguments);
        };
    }
    next();
}
app.use(logResponse);


// express routes

app.use("/static", express.static(path.join(__dirname, "./static/")));


global.glb.apiEndpoints = [
    { method: 'GET', url: '/api/listProgress', middlewares: { main: [], test: [], both: [progressController.listProgress] } },
    { method: 'POST', url: '/api/createProgress', middlewares: { main: [], test: [], both: [progressController.createProgress] } },
    { method: 'POST', url: '/api/deleteAllProgress', middlewares: { main: [], test: [], both: [progressController.deleteAllProgress] } },
    { method: 'POST', url: '/api/deleteProgress/:id', middlewares: { main: [], test: [], both: [progressController.deleteProgress] } },
    { method: 'POST', url: '/api/updateProgress/:id', middlewares: { main: [], test: [], both: [progressController.updateProgress] } },
    { method: 'POST', url: '/api/getProgress', middlewares: { main: [], test: [], both: [progressController.getProgress] } },
    { method: 'GET', url: '/api/listUsers', middlewares: { main: [], test: [], both: [userController.listUsers] } },
    { method: 'POST', url: '/api/registerUser', middlewares: { main: [], test: [], both: [userController.registerUser] } },
    { method: 'POST', url: '/api/deleteAllUsers', middlewares: { main: [], test: [], both: [userController.deleteAllUsers] } },
    { method: 'POST', url: '/api/deleteUser/:id', middlewares: { main: [], test: [], both: [userController.deleteUser] } },
    { method: 'POST', url: '/api/updateUser/:id', middlewares: { main: [], test: [], both: [userController.updateUser] } },
    { method: 'POST', url: '/api/getUser/:id', middlewares: { main: [], test: [], both: [userController.getUser] } },
    { method: 'POST', url: '/api/getSelf', middlewares: { main: [global.glb.authMiddleware], test: [], both: [userController.getSelf] } },
    { method: 'POST', url: '/api/getUserByEmail/:email', middlewares: { main: [], test: [], both: [userController.getUserByEmail] } },
    { method: 'POST', url: '/api/loginUser', middlewares: { main: [], test: [], both: [userController.loginUser] } },
    { method: 'GET', url: '/api/listVideos', middlewares: { main: [], test: [], both: [videoController.listVideos] } },
    { method: 'POST', url: '/api/deleteAllVideos', middlewares: { main: [], test: [], both: [videoController.deleteAllVideos] } },
    { method: 'POST', url: '/api/deleteVideo/:id', middlewares: { main: [], test: [], both: [videoController.deleteVideo] } },
    { method: 'POST', url: '/api/updateVideo/:id', middlewares: { main: [], test: [], both: [videoController.updateVideo] } },
    { method: 'POST', url: '/api/getVideo/:id', middlewares: { main: [], test: [], both: [videoController.getVideo] } },
    { method: 'POST', url: '/api/generateSubtitles', middlewares: { main: [], test: [], both: [videoController.generateSubtitles] } },
    { method: 'GET', url: '/api/videos/getSuggestedVideos', middlewares: { main: [], test: [], both: [videoController.getSuggestedVideos] } },
    { method: 'GET', url: '/api/uploadbase/listVideos', middlewares: { main: [], test: [], both: [ubController.listVideos] } },
    { method: 'GET', url: '/api/uploadbase/getSuggestedVideos', middlewares: { main: [], test: [], both: [ubController.getSuggestedVideos] } },
    { method: 'POST', url: '/api/uploadbase/deleteAllVideos', middlewares: { main: [], test: [], both: [ubController.deleteAllVideos] } },
    { method: 'POST', url: '/api/uploadbase/deleteVideo/:id', middlewares: { main: [], test: [], both: [ubController.deleteVideo] } },
    { method: 'POST', url: '/api/uploadbase/updateVideo/:id', middlewares: { main: [], test: [], both: [ubController.updateVideo] } },
    { method: 'POST', url: '/api/uploadbase/getVideo/:id', middlewares: { main: [], test: [], both: [ubController.getVideo] } },
    { method: 'POST', url: '/api/uploadbase/generateSubtitles', middlewares: { main: [], test: [], both: [ubController.generateSubtitles] } },
    { method: 'POST', url: '/api/uploadbase/uploadVideos', middlewares: { main: [], test: [], both: [global.glb.authMiddleware, upload.array('files'), ubController.uploadVideos] } },
    { method: 'POST', url: '/api/uploadbase/getHistory', middlewares: { main: [], test: [], both: [global.glb.authMiddleware, ubController.getHistory] } },
    { method: 'POST', url: '/api/uploadbase/addHistory', middlewares: { main: [], test: [], both: [global.glb.authMiddleware, ubController.addHistory] } },
    { method: 'GET', url: '/api/uploadbase/streamVideo/:id', middlewares: { main: [], test: [], both: [ubController.streamVideo] } },
    { method: 'GET', url: '/admin/apicontrol', middlewares: { main: [], test: [], both: [adminController.renderAdminPage] } },
    { method: 'GET', url: '/admin/apis', middlewares: { main: [], test: [], both: [adminController.listAPIs] } },

]

global.glb.apiEndpoints.forEach(endpoint => {
    app[endpoint.method.toLowerCase()](endpoint.url, ...endpoint.middlewares.main, ...endpoint.middlewares.both);
    app[endpoint.method.toLowerCase()]('/test' + endpoint.url, ...endpoint.middlewares.test, ...endpoint.middlewares.both);

})

function proxyRequest(req, res, target) {
    return new Promise((resolve, reject) => {
        proxy.web(req, res, { target }, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

app.use('/', async (req, res) => {
    try {
        await proxyRequest(req, res, 'http://localhost:5173');
        console.log('Proxy request completed successfully');
    } catch (error) {
        console.error('Proxy error:', error);
        res.statusCode = 500;
        res.end('Frontend server is down');
    }
});
app.get('/oauth2callback', (req, res) => {
    const code = req.query.code; // Get the authorization code from the query parameters
    console.log(code);
    // Process the authorization code and perform token exchange with Google OAuth2 API
    // Your code to exchange the authorization code for access token and refresh token goes here

    // Redirect the user to a desired page after successful authentication
    res.redirect('/dashboard'); // Replace '/dashboard' with your desired destination URL
});


(async () => {

    await models.sequelize.sync({ force: false });
    await fword.init({ force: false });

    global.glb.accessToken = await global.glb.getAccessToken();
    server.listen(port, () => {
        global.glb.log(`Listening on port at http://localhost:${port}`);
    });

})().catch(e => {
    global.glb.error(e);
});

