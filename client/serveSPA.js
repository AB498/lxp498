// serve -s dist/spa -l 5173 --cors

const express = require("express");
const http = require("http");
const https = require("https");
const cors = require("cors");
const port = 5173;

const app = express();
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

const server = http.createServer(options, app);

app.use(express.static(path.join(__dirname, "dist", "spa")));
app.use(
  cors({
    origin: "*",
  })
);
app.use("*", async (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "spa", "index.html"));
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
let maintenanceData = JSON.parse(
  fs.readFileSync(join(rootDirectory, "..", "maintenance.json"))
);
fs.writeFileSync(
  join(rootDirectory, "..", "maintenance.json"),
  JSON.stringify({ ...maintenanceData, client: { status: true } })
);
