let inDevMode = true;
let inMaintenanceMode = false;
const { createProxyMiddleware } = require("http-proxy-middleware");

const httpProxy = require("http-proxy");
const express = require("express");
require("express-async-errors");

const http = require("http");
const https = require("https");
const cors = require("cors");
const port = 443;

const app = express();
const proxy = httpProxy.createProxyServer({});
const { v4: uuidv4 } = require("uuid");

const path = require("path");
const fs = require("fs");
const { join } = require("path");
const findPackageJson = require("find-package-json");
const nearestPackageJson = findPackageJson(join(__dirname));
const rootDirectory = path.dirname(nearestPackageJson.next().filename);

const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/lanxplore.xyz/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/lanxplore.xyz/fullchain.pem"),
};
const server = https.createServer(options, app);
const { createServer } = require("http");
const { Server } = require("socket.io");
let activeConnections = {}
let maintenanceData = JSON.parse(
  fs.readFileSync(join(rootDirectory, "..", "maintenance.json"))
);


const io = new Server(server, {
  path: "/maintenance",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  activeConnections[socket.id] = socket;
  console.log("a user connected", socket.id);
});
app.use(
  cors({
    origin: "*",
  })
);
app.use("/", async (req, res) => {
  try {
    if (!maintenanceData.server.status || !maintenanceData.client.status) {
      res.statusCode = 503;
      res.sendFile(path.join(__dirname, "public", "maintenance.html"));
      return;
    }
    await proxyRequest(req, res, "http://localhost:3000");
    // console.log("Proxied: ", req.url);
  } catch (error) {
    console.log("Proxy error:", error);
    res.statusCode = 500;
    res.sendFile(path.join(__dirname, "public", "500.html"));
  }
});

(async () => {
  server.listen(port, () => {
    console.log(`Listening on port at ${":" + port}`);
  });
})().catch((e) => {
  console.error(e);
});

const resolvers = {};

function proxyRequest(req, res, target) {
  return new Promise((resolve, reject) => {
    const requestId = uuidv4(); // Generate a unique identifier for the request
    req.requestId = requestId;
    resolvers[requestId] = resolve;
    proxy.web(req, res, { target, requestId }, (error) => {
      delete resolvers[requestId];
      reject(error);
    });
  });
}

proxy.on("proxyRes", function (proxyRes, req, res) {
  // console.log(Object.keys(resolvers).length);
  if (resolvers[req.requestId]) {
    resolvers[req.requestId]();
    delete resolvers[req.requestId];
  }
});
proxy.on("proxyReq", function (proxyReq, req, res) {
  // Set a timeout for the proxy request
  const timeout = setTimeout(function () {
    // Abort the proxy request if it takes too long
    // proxyReq.abort();
    if (resolvers[req.requestId]) {
      resolvers[req.requestId]();
      delete resolvers[req.requestId];
    }
  }, 5000); // Adjust the timeout value as needed
});

// Specify the path to the "maintenance.json" file
const filePath = join(rootDirectory, "..", "maintenance.json");

// Watch for changes in the file
fs.watch(filePath, (eventType, filename) => {
  if (eventType === "change" && filename === "maintenance.json") {
    let data = fs.readFileSync(filePath, "utf8");
    if (data === "") {
      return;
    }

    try {
       maintenanceData = JSON.parse(data) || {}; /*  */
      inMaintenanceMode =
        !maintenanceData.server.status || !maintenanceData.client.status;

      
      if(!inMaintenanceMode){
        Object.keys(activeConnections).forEach((socketId) => {
          // activeConnections[socketId].emit("maintenance", false);
          // activeConnections[socketId].disconnect();
        });
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  }
});
