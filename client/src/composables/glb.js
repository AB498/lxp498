import { ref, watch } from "vue";
import { reactive } from "vue";
import fs from "fs";
import axios from "axios";

// const logDir = resolve("./logs");
import { v4 as uuidv4 } from "uuid";

const isObject = (value) => {
  return value !== null && typeof value === "object";
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

function circularJSONReplacer() {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        // console.log("circular: " + key, value);
        return "CIRCL"; //"CIRCL"+
      }
      seen.add(value);
    }
    return value;
  };
}

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
    return true;
  },
  get: function (target, key) {
    if (typeof key === "symbol") console.log(key);
    else {
      console.log(key);
      if (!target[key]) {
        target[key] = new Proxy({}, handler);
      }
    }
    return target[key];
  },
  path: [],
  callbacks: [
    (pathString, value) => {
      console.log(`${pathString} -> ${value}`);
    },
  ],
};

let gg = tryParseJSONObject(localStorage.glb)
  ? tryParseJSONObject(localStorage.glb)
  : {};
gg.wordTranslationStream = {};
gg.notifications = [];
gg._nonPersistant = {};
let globalProxy = gg;
const store = reactive(globalProxy);
watch(store, (val, oldValue) => {
  // console.log('store changed', store.user)
  // Object.assign(store, val)
  let strFied = JSON.stringify(
    Object.fromEntries(
      Object.entries(store).filter(
        ([k, v]) => !k.startsWith("_") && typeof v != "function"
      )
    ),
    circularJSONReplacer()
  );

  localStorage.glb = strFied;
});
console.log();
if (!store.settings) store.settings = {};
store.tryParseJSON = tryParseJSONObject;
store.isIterable = (value) => {
  return value !== undefined && typeof value[Symbol.iterator] === "function";
};

store.findByCol = (arr, col, val) => {
  return arr.find((item) => item[col] === val);
};

store.indexByCol = (arr, col, val) => {
  return arr.findIndex((item) => item[col] === val);
};
store.timeout = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
store.tryStringify = (s) => {
  try {
    return JSON.stringify(s, replacerFunc());
  } catch (error) {
    return null;
  }
};

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

store.poll = async function poll(v) {
  let res = await v();
  if (!res[1]) {
    await store.timeout(200);
    return await store.poll(v);
  } else {
    console.log(res);
    return res[0];
  }
};
store.getTime = () => {
  let date = new Date();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  let milliseconds = date.getMilliseconds();
  let secmilli = ("0000" + (seconds + milliseconds / 1000).toFixed(2)).slice(
    -5
  );

  let ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  let strTime = hours + ":" + minutes + ":" + secmilli + " " + ampm;
  return strTime;
};
store.getFormattedTime = (date) => {
  if (!date) return "Not a date";
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();

  let ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  let strTime = hours + ":" + minutes + " " + ampm;

  return strTime;
};
store.getFormattedDate = (date) => {
  if (!date) return "Not a date";
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  return month + "/" + day + "/" + year;
};
store.getFormattedDateTime = (date) => {
  if (!date) return "Not a date";
  return store.getFormattedDate(date) + " " + store.getFormattedTime(date);
};
store.uuidv4 = uuidv4;
store.clickOutside = {
  beforeMount: (el, binding) => {
    el.clickOutsideEvent = (event) => {
      // here I check that click was outside the el and his childrens
      if (!(el == event.target || el.contains(event.target))) {
        // and if it did, call method provided in attribute value
        binding.value(event, el);
      }
    };
    document.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted: (el) => {
    document.removeEventListener("click", el.clickOutsideEvent);
  },
};

store.toggleStyle = {
  container:
    "inline-block rounded-full outline-none focus:ring focus:ring-green-500 focus:ring-opacity-30",
  toggle:
    "flex w-12 h-5 rounded-full relative cursor-pointer transition items-center box-content border-2 text-xs leading-none",
  toggleOn: "bg-red-700 border-green-500 justify-start ",
  toggleOff: "bg-gray-400 border-gray-100 justify-end ",
  toggleOnDisabled:
    "bg-gray-300 border-gray-200 justify-start  cursor-not-allowed",
  toggleOffDisabled:
    "bg-gray-200 border-gray-200 justify-end  cursor-not-allowed",
  handle:
    "inline-block bg-white w-5 h-5 top-0 rounded-full absolute transition-all",
  handleOn: "left-full transform -translate-x-full",
  handleOff: "left-0",
  handleOnDisabled: "bg-gray-100 left-full transform -translate-x-full",
  handleOffDisabled: "bg-gray-100 left-0",
  label: "text-center w-8 border-box whitespace-nowrap select-none",
};
store.uuidv4 = uuidv4;
store._time = 0;
window.setInterval(() => {
  // store._time = store.getTime();
}, 100);

store.safeAsync = async (asyncFn, func) => {
  let limit = 100;

  let errors = null;
  let res = null;
  let functionName = "unknown";
  functionName =
    typeof func === "function" ? func.name : func ? func : "unknown";
  try {
    res = await asyncFn;
    const timeNow = store.getTime();
    let fileContJSON = [];
    fileContJSON = store._nonPersistant.asyncResult || [];

    if (!store.isIterable(fileContJSON)) fileContJSON = [];

    if (fileContJSON.length > limit)
      fileContJSON = fileContJSON.slice(0, limit);
    const newCont = {};
    newCont[timeNow] = res;

    store._nonPersistant.asyncResult = [newCont, ...fileContJSON];
  } catch (errorObject) {
    let limit = 100;

    const timeNow = store.getTime();

    let fileContJSON = [];
    fileContJSON = store.asyncError || [];

    if (!store.isIterable(fileContJSON)) fileContJSON = [];

    if (fileContJSON.length > limit)
      fileContJSON = fileContJSON.slice(0, limit);
    const newCont = {};

    let error = errorObject;
    try {
      if (errorObject.response) errorObject = error.response.data;
      else if (errorObject.request) errorObject = error.request;
      else if (errorObject.message) errorObject = {};

      errorObject.message = error.message;
      errorObject.stack = { stack: { trace: error.stack } };
      errorObject.name = error.name;
      errorObject.code = error.code;
      errorObject.errno = error.errno;
      newCont[timeNow] = errorObject;
    } catch (e) {
      newCont[timeNow] = error;
    }
    store._nonPersistant.asyncError = [newCont, ...fileContJSON];

    errors = error;
  }
  return [errors, res];
};
store.isObject = isObject;
store.errorMessages = (errorObject, lxerrormessage = [], parent, pkey) => {
  if (!parent) {
    if (typeof errorObject !== "object") return [errorObject];
  }
  parent = pkey;
  let errMessages = [];
  if (store.isObject(errorObject)) {
    if (errorObject["lxerrormessage"]) {
      console.log(errorObject["lxerrormessage"]);
      lxerrormessage.push(errorObject["lxerrormessage"]);
      return [];
    }
    for (let key in errorObject) {
      if (lxerrormessage.length > 0) break;
      if (isObject(errorObject[key])) {
        let nestedErrors = store.errorMessages(
          errorObject[key],
          lxerrormessage,
          parent,
          key
        );
        if (nestedErrors.length > 0) errMessages.push(...nestedErrors);
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
      } else if (key === "data" && parent === "response") {
        errMessages.push(errorObject[key]);
      }
    }
  }

  if (lxerrormessage.length > 0) return lxerrormessage;
  return errMessages.reverse();
};
store.safeAuthedReq = async (url, body, config) => {
  let [err, res] = await store.safeAsync(
    axios.post(store.baseUrl + url, body, {
      headers: {
        Authorization: "Bearer " + store.jwt,
      },
      ...config 
    })
  );
  if (err) {
    store.addNotf(store.errorMessages(err));
    return false;
  }
  return res.data;
};
store.reloadUser = async (jwt) => {
  let [err, res] = await store.safeAsync(
    axios.post(
      store.baseUrl + "/api/getSelf",
      {},
      {
        headers: {
          Authorization: "Bearer " + (jwt || store.jwt),
        },
      }
    )
  );
  if (err) {
    store.user = null;
    store.jwt = null;
    store.loggedIn = false;
    store.addNotf(store.errorMessages(err));
    return null;
  }
  store.user = res.data.user;
  store.jwt = res.data.jwt;
  store.loggedIn = true;
  // store.addNotf("Logged in as " + store.user.username);
  return res.data;
};
function randomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16) + "cc";
}
class Timeout {
  constructor(callbackFunction, time) {
    this.time = time;
    this.callback = callbackFunction;
    this.run(); // It will be automatically invoked when the constructor is run
    this.running = true;
  }
  run() {
    this.running = true;
    this.startedTime = new Date().getTime();
    if (this.time > 0) {
      this.timeout = setTimeout(this.callback, this.time); // Timeout must be set if this.time is greater than 0
    }
  }
  pause() {
    this.running = false;
    let currentTime = new Date().getTime();
    this.time = this.time - (currentTime - this.startedTime); // The time that was given when initializing the timeout is subtracted from the amount of time spent
    clearTimeout(this.timeout);
  }
}

store.notifications = [];

store.addNotf = (text, content, color) => {
  let thisId = uuidv4();
  let randCol = "#111144ef" || randomColor();
  store.notifications.push({
    id: thisId,
    text: text || "Notification number " + window.glb.notifications.length,
    content: content || "",
    color: color,
    tmout: new Timeout(() => {
      store.removeNotf(thisId);
    }, 2000),
  });
};
store.removeNotf = (id) => {
  let index = window.glb.indexByCol(window.glb.notifications, "id", id);
  if (index != -1) {
    window.glb.notifications.splice(index, 1);
  }
};
store.removeByProp = (arr, func) => {
  const index = arr.findIndex(func);
  return (index != -1 && arr.splice(index, 1) && true) || false;
};
store.randInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
store.shuffle = (array) => {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

export default store;
