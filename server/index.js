const isDev = true;

const axios = require("axios");
const s = require("./s");
const models = require("./models");
const fword = require("./fword");
const httpProxy = require("http-proxy");
const express = require("express");
require("express-async-errors");
const fs = require("fs");
const { join } = require("path");

const http = require("http");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const progressController = require("./controllers/progressController");
const userController = require("./controllers/userController");
const videoController = require("./controllers/videoController");
const ubController = require("./controllers/ubController");
const adminController = require("./controllers/adminController");
const chatController = require("./controllers/chatController");
const translationController = require("./controllers/translationController");
const jwtUtils = require("./utils/jwt");
const { manageSocketIO } = require("./socketIO");
//server setup
const https = require("https");

const rootDirectory = path.dirname(require.main.filename);
const port = 3000;

var accessToken = "";
const app = express();

const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/lanxplore.xyz/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/lanxplore.xyz/fullchain.pem"),
};

const server = http.createServer(options, app);

const proxy = httpProxy.createProxyServer();

const connections = {};
require(path.join(rootDirectory, "utils", "SyncerServer")).makeServer(
  server,
  connections
);

// manageSocketIO(io);
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

const multer = require("multer");
const { connect } = require("http2");

const upload = multer({ dest: "uploads/" });

function logResponse(req, res, next) {
  const oldSend = res.send;
  const oldJson = res.json;

  if (!req.originalUrl.includes("admin")) {
    let reqObj = {};
    reqObj.unqId = uuidv4();
    reqObj.method = req.method;
    reqObj.URL = req.originalUrl;
    reqObj.headers = req.headers;
    reqObj.body = req.body;
    reqObj.query = req.query;
    reqObj.params = req.params;
    s.logStuff("requestLog.result", reqObj);
    res.send = function () {
      let body = arguments[0];
      let respObj = s.isJSON(body)
        ? JSON.parse(body)
        : s.isObject(body)
        ? body
        : { resp: body };
      respObj.unqId = reqObj.unqId;
      s.logStuff("responseLog.result", respObj);
      oldSend.apply(res, arguments);
    };

    res.json = function () {
      let body = arguments[0];
      let respObj = s.isJSON(body)
        ? JSON.parse(body)
        : s.isObject(body)
        ? body
        : { resp: body };
      respObj.unqId = reqObj.unqId;
      s.logStuff("responseLog.result", respObj);
      oldJson.apply(res, arguments);
    };
  }
  next();
}
// app.use(logResponse);

// express routes

app.use("/static", express.static(path.join(__dirname, "./static/")));

global.glb.baseUrl = "http://lanxplore.xyz";

global.glb.apiEndpoints = [
  {
    method: "GET",
    url: "/api/listProgress",
    middlewares: {
      main: [],
      test: [],
      both: [progressController.listProgress],
    },
  },
  {
    method: "POST",
    url: "/api/createProgress",
    middlewares: {
      main: [global.glb.authMiddleware],
      test: [],
      both: [progressController.createProgress],
    },
  },
  {
    method: "POST",
    url: "/api/deleteAllProgress",
    middlewares: {
      main: [],
      test: [],
      both: [progressController.deleteAllProgress],
    },
  },
  {
    method: "POST",
    url: "/api/deleteProgress/:id",
    middlewares: {
      main: [],
      test: [],
      both: [progressController.deleteProgress],
    },
  },
  {
    method: "POST",
    url: "/api/updateProgress/:id",
    middlewares: {
      main: [],
      test: [],
      both: [progressController.updateProgress],
    },
  },
  {
    method: "POST",
    url: "/api/getProgress",
    middlewares: {
      main: [global.glb.authMiddleware],
      test: [],
      both: [progressController.getProgress],
    },
  },
  {
    method: "POST",
    url: "/api/submitLearnedWords",
    middlewares: {
      main: [global.glb.authMiddleware],
      test: [],
      both: [progressController.submitLearnedWords],
    },
  },
  {
    method: "GET",
    url: "/api/listUsers",
    middlewares: { main: [], test: [], both: [userController.listUsers] },
  },
  {
    method: "POST",
    url: "/api/registerUser",
    middlewares: { main: [], test: [], both: [userController.registerUser] },
  },
  {
    method: "POST",
    url: "/api/deleteAllUsers",
    middlewares: { main: [], test: [], both: [userController.deleteAllUsers] },
  },
  {
    method: "POST",
    url: "/api/deleteUser/:id",
    middlewares: { main: [], test: [], both: [userController.deleteUser] },
  },
  {
    method: "POST",
    url: "/api/updateUser/:id",
    middlewares: { main: [], test: [], both: [userController.updateUser] },
  },
  {
    method: "POST",
    url: "/api/updateSelf",
    middlewares: {
      main: [global.glb.authMiddleware],
      test: [],
      both: [upload.single("pfpFile"), userController.updateSelf],
    },
  },
  {
    method: "POST",
    url: "/api/getUser/:id",
    middlewares: { main: [], test: [], both: [userController.getUser] },
  },
  {
    method: "POST",
    url: "/api/getSelf",
    middlewares: {
      main: [global.glb.authMiddleware],
      test: [],
      both: [userController.getSelf],
    },
  },
  {
    method: "POST",
    url: "/api/getUserByEmail/:email",
    middlewares: { main: [], test: [], both: [userController.getUserByEmail] },
  },
  {
    method: "POST",
    url: "/api/loginUser",
    middlewares: { main: [], test: [], both: [userController.loginUser] },
  },
  {
    method: "GET",
    url: "/api/listVideos",
    middlewares: { main: [], test: [], both: [videoController.listVideos] },
  },
  {
    method: "POST",
    url: "/api/deleteAllVideos",
    middlewares: {
      main: [],
      test: [],
      both: [videoController.deleteAllVideos],
    },
  },
  {
    method: "POST",
    url: "/api/deleteVideo/:id",
    middlewares: { main: [], test: [], both: [videoController.deleteVideo] },
  },
  {
    method: "POST",
    url: "/api/updateVideo/:id",
    middlewares: { main: [], test: [], both: [videoController.updateVideo] },
  },
  {
    method: "POST",
    url: "/api/getVideo/:id",
    middlewares: { main: [], test: [], both: [videoController.getVideo] },
  },
  {
    method: "POST",
    url: "/api/getVideo/:id",
    middlewares: { main: [], test: [], both: [videoController.getVideo] },
  },
  {
    method: "POST",
    url: "/api/generateSubtitles",
    middlewares: {
      main: [global.glb.authMiddleware],
      test: [],
      both: [videoController.generateSubtitles],
    },
  },
  {
    method: "POST",
    url: "/api/getYTSubtitles/:id",
    middlewares: { main: [], test: [], both: [videoController.getYTSubtitles] },
  },
  {
    method: "GET",
    url: "/api/getYTComments/:id",
    middlewares: { main: [], test: [], both: [videoController.getYTComments] },
  },
  {
    method: "GET",
    url: "/api/videos/getSuggestedVideos",
    middlewares: {
      main: [],
      test: [],
      both: [videoController.getSuggestedVideos],
    },
  },
  {
    method: "POST",
    url: "/api/voteVideoLanguage/:id",
    middlewares: {
      main: [global.glb.authMiddleware],
      test: [],
      both: [videoController.voteVideoLanguage],
    },
  },
  {
    method: "POST",
    url: "/api/getMostVotedLanguage/:id",
    middlewares: {
      main: [],
      test: [],
      both: [videoController.getMostVotedLanguage],
    },
  },
  {
    method: "POST",
    url: "/api/listVotes/:id",
    middlewares: { main: [], test: [], both: [videoController.listVotes] },
  },
  {
    method: "GET",
    url: "/api/uploadbase/listVideos",
    middlewares: { main: [], test: [], both: [ubController.listVideos] },
  },
  {
    method: "GET",
    url: "/api/uploadbase/getSuggestedVideos",
    middlewares: {
      main: [],
      test: [],
      both: [ubController.getSuggestedVideos],
    },
  },
  {
    method: "POST",
    url: "/api/uploadbase/deleteAllVideos",
    middlewares: { main: [], test: [], both: [ubController.deleteAllVideos] },
  },
  {
    method: "POST",
    url: "/api/uploadbase/deleteVideo/:id",
    middlewares: { main: [], test: [], both: [ubController.deleteVideo] },
  },
  {
    method: "POST",
    url: "/api/uploadbase/updateVideo/:id",
    middlewares: { main: [], test: [], both: [ubController.updateVideo] },
  },
  {
    method: "POST",
    url: "/api/uploadbase/getVideo/:id",
    middlewares: { main: [], test: [], both: [ubController.getVideo] },
  },
  {
    method: "POST",
    url: "/api/uploadbase/getVideoSelf",
    middlewares: {
      main: [global.glb.authMiddleware],
      test: [],
      both: [ubController.getVideoSelf],
    },
  },
  {
    method: "POST",
    url: "/api/uploadbase/generateSubtitles",
    middlewares: { main: [], test: [], both: [ubController.generateSubtitles] },
  },
  {
    method: "POST",
    url: "/api/uploadbase/getUBSubtitles/:id",
    middlewares: { main: [], test: [], both: [ubController.getUBSubtitles] },
  },
  {
    method: "POST",
    url: "/api/uploadbase/voteVideoLanguage/:id",
    middlewares: {
      main: [global.glb.authMiddleware],
      test: [],
      both: [ubController.voteVideoLanguage],
    },
  },
  {
    method: "POST",
    url: "/api/uploadbase/getMostVotedLanguage/:id",
    middlewares: {
      main: [],
      test: [],
      both: [ubController.getMostVotedLanguage],
    },
  },
  {
    method: "POST",
    url: "/api/uploadbase/listVotes/:id",
    middlewares: { main: [], test: [], both: [ubController.listVotes] },
  },
  {
    method: "POST",
    url: "/api/uploadbase/uploadVideos",
    middlewares: {
      main: [global.glb.authMiddleware],
      test: [],
      both: [upload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), ubController.uploadVideos],
    },
  },
  {
    method: "POST",
    url: "/api/uploadbase/getHistory",
    middlewares: {
      main: [global.glb.authMiddleware],
      test: [],
      both: [ubController.getHistory],
    },
  },
  {
    method: "POST",
    url: "/api/uploadbase/addHistory",
    middlewares: {
      main: [global.glb.authMiddleware],
      test: [],
      both: [ubController.addHistory],
    },
  },
  {
    method: "GET",
    url: "/api/uploadbase/streamVideo/:id",
    middlewares: { main: [], test: [], both: [ubController.streamVideo] },
  },
  {
    method: "GET",
    url: "/admin/apicontrol",
    middlewares: {
      main: [],
      test: [],
      both: [adminController.renderAdminPage],
    },
  },
  {
    method: "GET",
    url: "/admin/apis",
    middlewares: { main: [], test: [], both: [adminController.listAPIs] },
  },
  {
    method: "POST",
    url: "/api/createChat",
    middlewares: {
      main: [global.glb.authMiddleware],
      test: [],
      both: [chatController.createChat],
    },
  },
  {
    method: "POST",
    url: "/api/getAllUsers",
    middlewares: {
      main: [global.glb.authMiddleware],
      test: [],
      both: [chatController.getAllUsers],
    },
  },
  {
    method: "POST",
    url: "/api/openConversation",
    middlewares: {
      main: [global.glb.authMiddleware],
      test: [],
      both: [chatController.openConversation],
    },
  },
  {
    method: "POST",
    url: "/api/getSelfConversations",
    middlewares: {
      main: [global.glb.authMiddleware],
      test: [],
      both: [chatController.getSelfConversations],
    },
  },
  {
    method: "GET",
    url: "/api/getSupportedLanguages",
    middlewares: {
      main: [],
      test: [],
      both: [translationController.getSupportedLanguages],
    },
  },
  {
    method: "POST",
    url: "/api/getTranslation",
    middlewares: {
      main: [global.glb.authMiddleware],
      test: [],
      both: [translationController.getTranslation],
    },
  },
  {
    method: "POST",
    url: "/api/getTranslationSentences",
    middlewares: {
      main: [global.glb.authMiddleware],
      test: [],
      both: [translationController.getTranslationSentences],
    },
  },
];

global.glb.apiEndpoints.forEach((endpoint) => {
  app[endpoint.method.toLowerCase()](
    endpoint.url,
    ...endpoint.middlewares.main,
    ...endpoint.middlewares.both
  );
  app[endpoint.method.toLowerCase()](
    "/test" + endpoint.url,
    ...[global.glb.testAuthMiddleware],
    ...endpoint.middlewares.both
  );
});
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err); // Log the error for debugging purposes

  // Set an appropriate status code based on the error type
  const statusCode = err.statusCode || 500;

  // Send an error response to the client
  res.status(statusCode).json({ error: err.message });
});

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

app.get("/oauth2callback", async (req, res, next) => {
  console.log("oauth2callback");
  const code = req.query.code; // Get the authorization code from the query parameters

  const clientId =
    "479533631965-jbl68e4tc4pfk9iesjr04kcq7tt3po0q.apps.googleusercontent.com";
  try {
    // Construct the token exchange request payload
    const requestBody = {
      code: code,
      client_id: clientId,
      client_secret: "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",
      redirect_uri: "http://lanxplore.xyz/oauth2callback",
      grant_type: "authorization_code",
    };

    // Make a POST request to the token endpoint
    const [err, response] = await global.glb.safeAsync(
      axios.post("https://oauth2.googleapis.com/token", requestBody)
    );
    // Extract the access token and refresh token from the response
    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;

    // Process the tokens as needed
    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);

    const [err2, response2] = await global.glb.safeAsync(
      axios.get("https://people.googleapis.com/v1/people/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Include the access token in the Authorization header
        },
        params: {
          personFields: "names,emailAddresses,photos", // Specify the fields you want to retrieve
        },
      })
    );

    // Extract the profile data from the response2
    const profile = response2.data;

    const email = profile.emailAddresses.filter(
      (email) => email.metadata.primary
    )[0].value;

    // Process the profile data as needed
    console.log("Profile:", email);

    let triedUser = null;
    if ((await models.User.findOne({ where: { email: email } })) == null) {
      triedUser = await models.User.create({
        email: email,
        gcpAccessToken: accessToken,
        gcpRefreshToken: refreshToken,
        loginType: "google",
        firstName: profile.names[0].givenName,
        lastName: profile.names[0].familyName,
        pfpUrl: profile.photos[0].url,
      });
    } else {
      triedUser = await models.User.update(
        {
          gcpAccessToken: accessToken,
        },
        { where: { email: email } }
      );

      triedUser = await models.User.findOne({ where: { email: email } });
    }
    if (triedUser == null) {
      return res.status(500).send("Error retrieving profile");
    }

    const newJwt = await jwtUtils.encode({
      id: triedUser.id,
      email: triedUser.email,
      loginType: triedUser.loginType,
    });
    triedUser.jwts = [newJwt, ...(triedUser.jwts ??= [])];
    await triedUser.save();

    req.user = triedUser.dataValues;
    res.cookie("tempJwt", newJwt);
    return res.redirect("/");
  } catch (error) {
    console.error("Error exchanging authorization code:", error.message);
    // Handle the error appropriately
    return res.status(500).send("Error exchanging authorization code");
  }
});
app.use("/", async (req, res) => {
  try {
    await proxyRequest(req, res, "http://localhost:5173");
    console.log("Proxy request completed successfully");
  } catch (error) {
    console.error("Proxy error:", error);
    res.statusCode = 500;
    res.end("Frontend server is down");
  }
});

(async () => {
  await models.sequelize.sync({ force: false });
  await fword.init({ force: false });

  global.glb.accessToken = await global.glb.getAccessToken();
  server.listen(port, () => {
    global.glb.log(`Listening on port at http://localhost:${port}`);
  });
  let maintenanceData = JSON.parse(
    fs.readFileSync(join(rootDirectory, "..", "maintenance.json"))
  );
  fs.writeFileSync(
    join(rootDirectory, "..", "maintenance.json"),
    JSON.stringify({ ...maintenanceData, server: { status: true } })
  );
  global.glb.serverLoop();
})().catch((e) => {
  global.glb.error(e);
});

if (!global.glb.videosState.lastUpdatedSuggestions)
  global.glb.videosState.lastUpdatedSuggestions = new Date().getTime();
if (!global.glb.states.lastAccessTokenUpdate)
  global.glb.states.lastAccessTokenUpdate = new Date().getTime();

let serverFirstInitted = false;
global.glb.serverLoop = async function () {
  // do stuff
  // if last updated time is less than current time - 1 hour
  // update suggestions

  if (
    global.glb.videosState.lastUpdatedSuggestions <
    new Date().getTime() - 1000 * 60 * 60 * 6
  ) {
    if (!fs.existsSync(join(rootDirectory, "mockData", "suggestedVideos.json")))
      fs.writeFileSync(
        join(rootDirectory, "mockData", "suggestedVideos.json"),
        JSON.stringify([])
      );
    let result = await videoAPIServices.getSuggestions("new videos");
    if (result) {
      global.glb.log("fetched new suggestions");
      let towrite = [
        ...result,
        ...global.glb.handledParse(
          fs.readFileSync(
            join(rootDirectory, "mockData", "suggestedVideos.json"),
            "utf8"
          )
        ),
      ];
      if (towrite.length > 100) {
        towrite = towrite.slice(0, 100);
      }
      fs.writeFileSync(
        join(rootDirectory, "mockData", "suggestedVideos.json"),
        JSON.stringify(towrite)
      );
    } else console.log("failed to fetch new suggestions");

    global.glb.videosState.lastUpdatedSuggestions = new Date().getTime();
  }
  if (
    global.glb.states.lastAccessTokenUpdate <
    new Date().getTime() - 1000 * 60 * 60 * 1
  ) {
    global.glb.accessToken = await global.glb.getAccessToken();
    global.glb.log("got new access token");
    global.glb.states.lastAccessTokenUpdate = new Date().getTime();
  }
  serverFirstInitted = true;

  await global.glb.timeout(100);
  global.glb.serverLoop();
};

let inMaintenanceMode = false;
const filePath = join(rootDirectory, "..", "maintenance.json");

fs.watch(filePath, (eventType, filename) => {
  if (eventType === "change" && filename === "maintenance.json") {
    let data = fs.readFileSync(filePath, "utf8");
    if (data === "") {
      return;
    }

    try {
      const maintenanceData = JSON.parse(data) || {}; /*  */
      inMaintenanceMode =
        !maintenanceData.server.status || !maintenanceData.client.status;

      console.log(
        "Maintenance mode:",
        inMaintenanceMode ? "on" : "off",
        maintenanceData.server.status,
        maintenanceData.client.status
      );
      if (!inMaintenanceMode) {
      }
      if (inMaintenanceMode) {
        console.log("emitting ", Object.keys(connections).length);
        Object.keys(connections).forEach((key) => {
          // connections[key].syncerObj.reload = true;
          // console.log("emitting maintenance", connections[key].socket.id);
          // connections[key].socket.emit("maintenance", true);
          // connection.socket.disconnect();
          // connection.close();
        });
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  }
});
