import { ref, watch } from 'vue'
import { reactive } from 'vue'
import fs from "fs";
import axios from 'axios';

// const logDir = resolve("./logs");
import { v4 as uuidv4 } from 'uuid'

const isObject = (value) => {
  return value !== null && typeof value === 'object'
}

const tryParseJSONObject = (jsonString) => {
  if (isObject(jsonString)) {
    return jsonString
  }
  try {
    var o = JSON.parse(jsonString)

    if (o && typeof o === 'object') {
      return o
    }
  } catch (e) {
    return null
  }

  return null
}


function circularJSONReplacer() {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        // console.log("circular: " + key, value);
        return ("CIRCL");//"CIRCL"+
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
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      obj[key] = createProxy(obj[key], handler, [...path, key]);
    }
  }
  return proxy;
}

let handler = {
  set: function (target, key, value) {
    const pathString = [...this.path, key].join('.');
    if (typeof value === "object") {
      value = createProxy(value, this, [...this.path, key]);
    }
    target[key] = value;
    this.callbacks.forEach((callback) => callback(pathString, value));
    return true;
  },
  get: function (target, key) {
    if (typeof key === "symbol")
      console.log(key);
    else {
      console.log(key);
      if (!target[key]) {
        target[key] = new Proxy({}, handler);
      }
    }
    return target[key];

  },
  path: [],
  callbacks: [(pathString, value) => {
    console.log(`${pathString} -> ${value}`);
  }]
};


let gg = tryParseJSONObject(localStorage.glb) ? tryParseJSONObject(localStorage.glb) : {}
gg.wordTranslationStream = {}
gg.notifications = []
gg._nonPersistant = {}
let globalProxy = (gg);
const store = reactive(globalProxy)
watch(store, (val, oldValue) => {
  // console.log('store changed', store.user)
  // Object.assign(store, val)
  let strFied = JSON.stringify(Object.fromEntries(Object.entries(store).filter(([k, v]) => !k.startsWith('_'))), circularJSONReplacer())

  localStorage.glb = strFied;

})
console.log()
if (!store.settings) store.settings = {}
store.tryParseJSON = tryParseJSONObject
store.isIterable = (value) => {
  return value !== undefined && typeof value[Symbol.iterator] === 'function'
}

store.findByCol = (arr, col, val) => {
  return arr.find((item) => item[col] === val)
}

store.indexByCol = (arr, col, val) => {
  return arr.findIndex((item) => item[col] === val)
}
store.timeout = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
store.poll = async function poll(v) {
  let res = await v()
  if (!res[1]) {
    await store.timeout(200)
    return await store.poll(v)
  } else {
    console.log(res)
    return res[0]
  }
}
store.getTime = () => {
  let date = new Date();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  let milliseconds = date.getMilliseconds();
  let secmilli = ('0000' + (seconds + milliseconds / 1000).toFixed(2)).slice(-5)

  let ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  let strTime = hours + ':' + minutes + ':' + secmilli + ' ' + ampm;
  return strTime;
}
store.getFormattedTime = (date) => {
  if (!date) return "Not a date"
  let hours = date.getHours()
  let minutes = date.getMinutes()
  let seconds = date.getSeconds()

  let ampm = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes
  let strTime = hours + ':' + minutes + ' ' + ampm

  return strTime
}
store.uuidv4 = uuidv4
store.clickOutside = {
  beforeMount: (el, binding) => {
    el.clickOutsideEvent = (event) => {
      // here I check that click was outside the el and his children
      if (!(el == event.target || el.contains(event.target))) {
        // and if it did, call method provided in attribute value
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted: (el) => {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

store.uuidv4 = uuidv4
store._time = 0;
window.setInterval(() => {
  // store._time = store.getTime();
}, 100);

store.safeAsync = async (asyncFn, func) => {
  let limit = 100;

  let errors = null;
  let res = null;
  let functionName = "unknown";
  functionName = typeof func === "function" ? func.name : (func ? func : "unknown");
  try {
    res = await asyncFn;
    const timeNow = store.getTime();
    let fileContJSON = [];
    fileContJSON = store._nonPersistant.asyncResult || [];

    if (!store.isIterable(fileContJSON))
      fileContJSON = [];

    if (fileContJSON.length > limit)
      fileContJSON = fileContJSON.slice(0, limit);
    const newCont = {}
    newCont[timeNow] = res;


    store._nonPersistant.asyncResult = [
      newCont,
      ...fileContJSON
    ]
  } catch (errorObject) {
    let limit = 100;

    const timeNow = store.getTime();

    let fileContJSON = [];
    fileContJSON = store.asyncError || [];

    if (!store.isIterable(fileContJSON))
      fileContJSON = [];

    if (fileContJSON.length > limit)
      fileContJSON = fileContJSON.slice(0, limit);
    const newCont = {}

    let error = errorObject;
    try {
      if (errorObject.response)
        errorObject = error.response.data;
      else if (errorObject.request)
        errorObject = error.request;
      else if (errorObject.message)
        errorObject = {};

      errorObject.message = error.message;
      errorObject.stack = { stack: { trace: error.stack } };
      errorObject.name = error.name;
      errorObject.code = error.code;
      errorObject.errno = error.errno;
      newCont[timeNow] = errorObject;
    } catch (e) {
      newCont[timeNow] = error;
    }
    store._nonPersistant.asyncError =
      [
        newCont,
        ...fileContJSON
      ]

    errors = error;
  }
  return [errors, res];
}
store.isObject = isObject
store.errorMessages = (errorObject) => {
  if (typeof errorObject === "string" && errorObject != '')
    return errorObject;

  let errMessages = [];
  if (store.isObject(errorObject)) {
    for (let key in errorObject) {
      if (isObject(errorObject[key])) {
        let nestedErrors = store.errorMessages(errorObject[key]);
        if (nestedErrors.length > 0)
          errMessages.push(nestedErrors);
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
      } else if (key === "response") {
        if (errorObject[key].data)
          errMessages.push(errorObject[key].data);
      }
    }
  }

  return errMessages;

}
store.safeAuthedReq = async (url, body) => {
  console.log('body', body)
  let [err, res] = await store.safeAsync(axios.post(store.baseUrl + url, body, {
    headers: {
      'Authorization': 'Bearer ' + store.jwt
    }
  }))
  if (err) {
    store.addNotf(store.errorMessages(err));
    return false;
  }
  return res.data;

}
store.reloadUser = async () => {
  let [err, res] = await store.safeAsync(
    axios.post(store.baseUrl + "/api/getSelf", {}, {
      headers: {
        Authorization: "Bearer " + store.jwt
      }
    }));
  if (err) {
    store.user = null;
    store.addNotf(store.errorMessages(err));
    return;
  }
  store.user = res.data.user;
  store.jwt = res.data.jwt;

}
store.reloadUser(); // reload user on page load


export default store
