import { ref, watch, onUnmounted, onMounted, nextTick, computed } from "vue";
import Toggle from "@vueform/toggle";
import { io } from "socket.io-client";
import { reactive } from "vue";
import { v4 as uuidv4 } from "uuid";
import { createProxy, rjwatch, rjmod } from "@/composables/ReactiveJSON";

const makeSyncer = (url, options) => {
  var syncerObj = createProxy({});
  let localChange = true;
  let server2Socket = null;
  let connectedCallbacks = [];
  let disconnectedCallbacks = [];
  let socketState = reactive({
    connected: false,
  });
  let testInterval;

  function init() {
    server2Socket = io(url, options);
    server2Socket.connect();

    server2Socket.on("connect", () => {
      socketState.connected = true;
      connectedCallbacks.forEach((cb) => cb());
      connectedCallbacks = [];
console.log("my id ", server2Socket.id);
      rjwatch(syncerObj, null, (o, n, p, k, v) => {
        //(oldval, newval, modpath, key, value)
        if (localChange) server2Socket.emit("updateObj", { path: p, value: v });
        // console.log(localChange, p, v)
      }); //onchange

      server2Socket.on("updateObj", ({ path, value }) => {
        try {
          console.log("foreign: ", path);
          localChange = false;
          rjmod(syncerObj, path, value);
          if (path == "/") console.log("SyncerObj", syncerObj);
          localChange = true;
        } catch (e) {
          console.log("Error in updateObj", e);
        }
      }); //onreceive
      server2Socket.on("maintenance", (e) => { 
        console.log("maintenance", e);
        if (e) {
          window.location.reload();
        }
      });
    });

    server2Socket.on("disconnect", (e) => {
      socketState.connected = false;

      disconnectedCallbacks.forEach((cb) => cb(e));
      disconnectedCallbacks = [];
    });
  }
  function destroy() {
    server2Socket.disconnect();
    clearInterval(testInterval);

    socketState.connected = false;
    disconnectedCallbacks.forEach((cb) => cb());
    disconnectedCallbacks = [];
  }

  return {
    syncerObj,
    socketState,
    server2Socket,
    init,
    destroy,
    connectedCallbacks,
    disconnectedCallbacks,
  };
};

export { makeSyncer };
