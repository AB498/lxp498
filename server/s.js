const fsExtra = require("fs-extra");
const { createCanvas, registerFont } = require("canvas");

const clc = require("cli-color");
const CircularJSON = require("circular-json");

const jwtUtil = require("./utils/jwt");

const path = require("path");
const fs = require("fs");
const { join } = require("path");
const findPackageJson = require("find-package-json");
const nearestPackageJson = findPackageJson(join(__dirname));
const rootDirectory = path.dirname(nearestPackageJson.next().filename);

const { resolve } = require("path");
const logDir = join(rootDirectory, "logs");

const models = require("./models");

const iso6391 = require("iso-639-language")
  .default.getType(1)
  .getFullLanguageAll();
const iso6393 = require("iso-639-language")
  .default.getType(3)
  .getFullLanguageAll();

  const langs_imp =Object.values( require(join(rootDirectory, 'json', "langs_out.json")));
// const rootDirectory = path.dirname(require.main.filename);

require("dotenv").config({ path: join(rootDirectory, ".env") });
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

function createProxy(obj, handler, path = []) {
  const newHandler = { ...handler, path: path };
  const proxy = new Proxy(obj, newHandler);
  for (let key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      obj[key] = createProxy(obj[key], handler, [...path, key]);
    }
  }
  return proxy;
}

let handler = {
  set: function (target, key, value) {
    const pathString = [...this.path, key].join(".");
    if (typeof value === "object") {
      value = createProxy(value, this, [...this.path, key]);
    }
    target[key] = value;
    this.callbacks.forEach((callback) => callback(pathString, value));
    saveToFS();
    return true;
  },
  get: function (target, key) {
    if (typeof key === "symbol") {
      return target[key];
    }
    if (key === "toJSON") {
      return () => {
        return target;
      };
    }
    if (key === "valueOf") {
      return () => {
        return target;
      };
    }
    // if (key.startsWith("to") || key.startsWith("has")) {
    //     return null
    // }
    if (!target[key]) {
      // console.log("Accessed non-existing key: " + key);
      // target[key] = new Proxy({}, handler);
    }
    return target[key];
  },
  path: [],
  callbacks: [
    (pathString, value) => {
      // console.log(`${pathString} -> ${value}`);
    },
  ],
};
const isObject = (value) => {
  return value !== null && typeof value === "object";
};
const tryReadFile = (path) => {
  if (!fs.existsSync(path)) fs.writeFileSync(path, "");
  return fs.readFileSync(path, "utf-8");
};
const tryParseJSONObject = (jsonString) => {
  if (isObject(jsonString)) {
    return jsonString;
  }
  try {
    var o = JSON.parse(jsonString);

    if (o && typeof o === "object") {
      return o;
    }
  } catch (e) {
    return null;
  }

  return null;
};

let readCon = tryParseJSONObject(
  tryReadFile(path.join("global.state"), "utf-8")
);
const readGlb = readCon ? readCon : {};
const globalProxy = createProxy(
  {
    ...readGlb,
    timeout(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    log(s) {
      console.log(
        clc.greenBright.bgBlack.underline(this.getTime() + ":") +
          " " +
          clc.blueBright(s)
      );
      return s;
    },
    error(s) {
      console.log(
        clc.bgMagentaBright.underline(this.getTime() + ":") +
          " " +
          clc.magenta(this.errorMessages(s))
      );
      return s;
    },

    moveSync(oldPath, newPath) {
      try {
        if(fs.existsSync(newPath)) fs.unlinkSync(newPath) 
        fsExtra.moveSync(oldPath, newPath);
      } catch (err) {
        console.error("Error moving file:", err);
      }
    },
    tryStringify(s) {
      try {
        return JSON.stringify(s, replacerFunc());
      } catch (error) {
        return null;
      }
    },
    handledParse(str) {
      //if already parsed object, return it
      if (typeof str === "object") return str;
      //if not, try to parse it
      try {
        return JSON.parse(str);
      } catch (error) {
        return [];
      }
    },
    async getAccessToken() {
      const { auth } = require("google-auth-library");
      // load the environment variable with our keys
      require("dotenv").config({ path: join(rootDirectory, ".env") });
      const keysEnvVar = process.env["CREDS"];
      if (!keysEnvVar) {
        throw new Error("The $CREDS environment variable was not found!");
      }
      const keys = JSON.parse(keysEnvVar);

      // load the JWT or UserRefreshClient from the keys
      const client = auth.fromJSON(keys);
      client.scopes = [
        "https://www.googleapis.com/auth/cloud-platform",
        "https://www.googleapis.com/auth/youtube.readonly",
        // "https://www.googleapis.com/auth/cloudtranslate.generalModels.get",
        "https://www.googleapis.com/auth/youtubepartner",
      ];
      let tok = (await client.getAccessToken()).token;
      fs.writeFileSync("token.json", tok);
      return tok;
    },
    async safeAsync(asyncFn, func) {
      let limit = 20;

      const fs = require("fs");
      let errors = null;
      let res = null;
      let functionName = "unknown";
      functionName =
        typeof func === "function" ? func.name : func ? func : "unknown";
      try {
        res = await asyncFn;
        const timeNow = this.getTime();
        let fileContJSON = [];
        if (!fs.existsSync(join(logDir, "asyncResult.result")))
          fs.writeFileSync(join(logDir, "asyncResult.result"), "[]");
        fileContJSON = this.isJSON(
          fs.readFileSync(join(logDir, "asyncResult.result"))
        )
          ? JSON.parse(fs.readFileSync(join(logDir, "asyncResult.result")))
          : [];

        if (!this.isIterable(fileContJSON)) fileContJSON = [];

        if (fileContJSON.length > limit)
          fileContJSON = fileContJSON.slice(0, limit);
        const newCont = {};
        newCont[timeNow] = res;

        fs.writeFileSync(
          join(logDir, "asyncResult.result"),
          JSON.stringify([newCont, ...fileContJSON], replacerFunc(), 2)
        );
        console.log(
          clc.yellow("AsyRes: ") +
            functionName +
            " " +
            clc.cyanBright(/*join(logDir, "asyncResult.result")*/ timeNow)
        );
      } catch (errorObject) {
        const timeNow = this.getTime();
        console.log(
          clc.red("AsyErr: ") + functionName + " " + clc.cyanBright(timeNow)
        );

        let fileContJSON = [];
        if (!fs.existsSync(join(logDir, "asyncError.result")))
          fs.writeFileSync(join(logDir, "asyncError.result"), "[]");
        fileContJSON = this.isJSON(
          fs.readFileSync(join(logDir, "asyncError.result"))
        )
          ? JSON.parse(fs.readFileSync(join(logDir, "asyncError.result")))
          : [];

        if (!this.isIterable(fileContJSON)) fileContJSON = [];

        if (fileContJSON.length > limit)
          fileContJSON = fileContJSON.slice(0, limit);
        const newCont = {};

        let error = errorObject;
        if (errorObject.response) errorObject = error.response.data;
        else if (errorObject.request) errorObject = error.request;
        else if (errorObject.message) errorObject = {};

        errorObject.message = error.message;
        errorObject.stack = { stack: { trace: error.stack } };
        errorObject.name = error.name;
        errorObject.code = error.code;
        errorObject.errno = error.errno;

        newCont[timeNow] = errorObject;

        fs.writeFileSync(
          join(logDir, "asyncError.result"),
          JSON.stringify([newCont, ...fileContJSON], replacerFunc(), 2)
        );
      }
      return [errors, res];
    },
    errorMessages(errorObject) {
      if (typeof errorObject === "string" && errorObject != "")
        return errorObject;

      let errMessages = [];
      if (this.isObject(errorObject)) {
        for (let key in errorObject) {
          if (isObject(errorObject[key])) {
            let nestedErrors = this.errorMessages(errorObject[key]);
            if (nestedErrors.length > 0) errMessages.push(nestedErrors);
          }
          if (key === "message") {
            errMessages.push(errorObject[key]);
          } else if (key === "error") {
            errMessages.push(errorObject[key]);
          } else if (key === "code") {
            errMessages.push(errorObject[key]);
          } else if (key === "name") {
            errMessages.push(errorObject[key]);
          } else if (key === "message") {
            errMessages.push(errorObject[key]);
          }
        }
      }

      return errMessages;
    },
    isIterable(value) {
      if (value == null) {
        return false;
      }
      return (
        value !== undefined && typeof value[Symbol.iterator] === "function"
      );
    },
    lerp(a, b, fractionFactor) {
      return a + (b - a) * fractionFactor;
    },

    getTime() {
      const now = new Date();
      const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Asia/Dhaka",
      };
      const timeNow = now.toLocaleString("en-US", options);
      return timeNow;
    },
    isJSON(str) {
      try {
        return JSON.parse(str) && !!str;
      } catch (e) {
        return false;
      }
    },
    isObject(value) {
      return value !== null && typeof value === "object";
    },
    logStuff(filenName, content) {
      let limit = 100;
      const fs = require("fs");
      const timeNow = this.getTime();
      let fileContJSON = [];
      if (!fs.existsSync(join(logDir, filenName)))
        fs.writeFileSync(join(logDir, filenName), "[]");
      fileContJSON = this.isJSON(fs.readFileSync(join(logDir, filenName)))
        ? JSON.parse(fs.readFileSync(join(logDir, filenName)))
        : [];
      if (!this.isIterable(fileContJSON)) fileContJSON = [];

      if (fileContJSON.length > limit)
        fileContJSON = fileContJSON.slice(0, limit);
      const newCont = {};
      newCont[timeNow] = content;

      let foundExisting = fileContJSON.find((item) => {
        let [key, value] = Object.entries(item)[0];
        return value.unqId == content.unqId;
      });
      if (foundExisting) {
        return;
      }

      fs.writeFileSync(
        join(logDir, filenName),
        CircularJSON.stringify([newCont, ...fileContJSON])
      );
    },
    iso3to1(iso3) {
      try {
        return langs_imp.find((l) => l.iso6393 == iso3).iso6391.trim();
      } catch (e) {
        return null;
      }
    },
    iso1to3(iso1) {
      try {
        return langs_imp.find((l) => l.iso6391 == iso1).iso6393.trim();
      } catch (e) {
        return null;
      }
    },
    async authMiddleware(req, res, next) {
      try {
        const headers = req.headers;
        if (!headers.authorization) {
          console.log("No authorization header");
          return res.status(401).send("Unauthorized");
        }

        const jwt = headers.authorization.split(" ")[1];
        const decodedUser = await jwtUtil.decode(jwt);

        if (!decodedUser || !decodedUser.email || !decodedUser.id) {
          console.log("Invalid JWT", headers.authorization, decodedUser);
          return res.status(401).send("Unauthorized");
        }

        const user = await models.User.findByPk(decodedUser.id);

        if (!user || !user.jwts || !user.jwts.includes(jwt)) {
          console.log("No user");
          return res.status(401).send("Unauthorized");
        }

        req.user = user;
        req.jwt = jwt;
        next();
      } catch (error) {
        console.error("Authentication error:", error);
        res.status(500).send("Internal Server Error");
      }
    },
    async testAuthMiddleware(req, res, next) {
      try {
        const user = await models.User.findOne();
        if (!user.jwts || user.jwts.length == 0)
          user.jwts = [jwtUtil.encode({ id: user.id, email: user.email })];
        else user.jwts.push(jwtUtil.encode({ id: user.id, email: user.email }));
        await user.save();
        req.user = user;
        req.jwt = user.jwts[user.jwts.length - 1];
        next();
      } catch (error) {
        console.error("Authentication error:", error);
        res.status(500).send("Internal Server Error");
      }
    },
    savePng(initials, url) {
      return new Promise((resolve, reject) => {
        // Set up canvas dimensions
        const canvasWidth = 200;
        const canvasHeight = 200;

        // Initialize canvas
        const canvas = createCanvas(canvasWidth, canvasHeight);
        const context = canvas.getContext("2d");

        // Set background color
        context.fillStyle = "#f0f0f0";
        context.fillRect(0, 0, canvasWidth, canvasHeight);

        // Set text properties
        const fontSize = 80;
        const fontFamily = "Arial";
        const textColor = "#000000";

        context.font = `${fontSize}px ${fontFamily}`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = textColor;

        // Position the initials at the center of the canvas
        const textX = canvasWidth / 2;
        const textY = canvasHeight / 2;
        context.fillText(initials, textX, textY);

        // Generate the PNG file
        const filePath = url;

        const out = fs.createWriteStream(filePath);
        const stream = canvas.createPNGStream();
        stream.pipe(out);
        out.on("finish", () => {
          console.log(`Saved avatar initials as ${filePath}`);
          resolve(filePath);
        });
      });
    },
  },
  handler
);

function saveToFS() {
  fs.writeFileSync(
    path.join("global.state"),
    JSON.stringify(global.glb, replacerFunc(), 2)
  );
}

function replacerFunc() {
  const visited = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (visited.has(value)) {
        return;
      }
      visited.add(value);
    }
    return value;
  };
}

if (!global.glb) {
  global.glb = globalProxy;
}

global.glb.tryParseJSON = tryParseJSONObject;
global.glb.tryReadFile = tryReadFile;

// global.glb.models = models;
// console.log("global.glb.models")
// console.log("global.glb.models", global.glb.models)
if (!global.glb.videosState) global.glb.videosState = {};
if (!global.glb.states) global.glb.states = {};

module.exports = global.glb;
