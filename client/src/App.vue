<script setup>
import "vue3-json-viewer/dist/index.css";
import PopperComponent from "@/components/PopperComponent.vue";
import { RouterLink, RouterView } from 'vue-router'
import glb from "@/composables/glb";
import NotificationStack from "@/components/NotificationStack.vue";
import LoadingSpin from "@/components/LoadingSpin.vue";
import { io } from "socket.io-client";
import { reactive, watch, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'vue-router'

// dsf sdg sd
//dsadsad
const router = useRouter()

function logout() {
  window.glb.loggedIn = false
  window.glb.user = null
  window.glb.jwt = null
  window.glb.lxsocket.disconnectSocket();
}



window.glb.selectLang = (callback) => {
  window.glb.settings.showSelectLangModal = uuidv4()
  window.glb.selectLangCallback = callback
}

window.glb.lxsocket = {
  connected: false,
  fooEvents: [],
  barEvents: [],
  onlineUsers: [],
};


window.glb._serverSynced = {};

// const URL = "http://localhost:8080";
const socketURL = window.glb.baseUrl;
const socketOptions = computed(() => ({
  extraHeaders: {
    Authorization: `Bearer ${window.glb?.jwt || ''}`
  }
}));
window.glb.lxsocket.socketObj = null;

function initializeSocket() {
  // Create and connect the socket
  // console.log(socketOptions.value)
  window.glb.lxsocket.socketObj = io(socketURL, socketOptions.value);
  window.glb.lxsocket.socketObj.connect();


  window.glb.lxsocket.socketObj.on("connect", () => {
    console.log("my id: " + window.glb.lxsocket.socketObj.id);

    window.glb.lxsocket.connected = true;
    window.glb.lxsocket.socketObj.emit("resolveUser", window.glb.user.jwt);

    const start = Date.now();
    window.glb.lxsocket.socketObj.emit("ping", () => {
      const duration = Date.now() - start;
      console.log("Ping to server: " + duration);
    });
  });

  window.glb.lxsocket.socketObj.on("disconnect", () => {
    console.log("disconnected");
    window.glb.lxsocket.connected = false;
  });
  window.glb.lxsocket.socketObj.on("serverSynced", (m) => {
    window.glb._serverSynced = m;
  });
  window.glb.lxsocket.socketObj.on('pong', function (data) {
    console.log('Received Pong: ', data);
  });
  window.glb.lxsocket.socketObj.on("ping", (callback) => {
    callback();
  });

}

function disconnectSocket() {
  // Disconnect the socket if it exists and is connected
  if (window.glb.lxsocket.socketObj && window.glb.lxsocket.socketObj.connected) {
    window.glb.lxsocket.socketObj.disconnect();
    window.glb.lxsocket.socketObj = null;
  }
}

window.glb.lxsocket.initializeSocket = initializeSocket;
window.glb.lxsocket.disconnectSocket = disconnectSocket;

if (window.glb.user) {
  console.log("connecting to socket");
  window.glb.lxsocket.initializeSocket();
}

let indexByCol = (arr, col, val) => {
  return arr.findIndex((item) => item[col] == val)
}
</script>

<template>
  <div class="whole h-full w-full flex flex-col text-white font-sans">
    <NotificationStack>
    </NotificationStack>
    <div class="w-full h-16  shrink-0 sticky top-0 backdrop-blur-lg z-50">

      <div
        class="nav flex justify-between h-full bg-gray-800 transition-all duration-200 border-b-2 border-yellow-600 shadow ">
        <div class="nav-right px-4 flex items-stretch">
          <PopperComponent>
            <template #tohover>
              <RouterLink to="/"
                class="flex items-center justify-center text-2xl fa  self-stretch space-x-2 font-sans font-thin">
                <!-- loading if not connected -->
                <i v-if="!window.glb.lxsocket?.connected" class="">
                  <LoadingSpin w="4" h="4" />
                </i>
                <span class="relative flex h-3 w-3 center" v-else>
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3 bg-yellow-500">

                  </span>
                </span>
                <div>
                  LX
                </div>
              </RouterLink>
            </template>
            <template #popup>
              <div class="w-full h-full">
                <JsonViewer :value="window.glb" class="bg-zinc-800" theme="my-awesome-json-theme">
                </JsonViewer>
              </div>
            </template>
          </PopperComponent>
        </div>
        <div class="nav-center flex items-center transition-all duration-150">
          <RouterLink to="/" v-ripple
            class="transition-all duration-200 hover:duration-0 w-10 h-10 rounded mx-2 flex items-center justify-center hover:bg-gray-500 text-2xl fa fa-home">
          </RouterLink>
          <RouterLink to="/profile" v-ripple
            class="transition-all duration-200 hover:duration-0 w-10 h-10 rounded mx-2 flex items-center justify-center hover:bg-gray-500 text-2xl fa fa-user">
          </RouterLink>
          <RouterLink to="/chat" v-ripple
            class="transition-all duration-200 hover:duration-0 w-10 h-10 rounded mx-2 flex items-center justify-center hover:bg-gray-500 text-2xl fa fa-comments">
          </RouterLink>
          <RouterLink to="/uploadbase" v-ripple
            class="transition-all duration-200 hover:duration-0 w-10 h-10 rounded mx-2 flex items-center justify-center hover:bg-gray-500 text-2xl fa fa-underline">
          </RouterLink>
          <div @click="router.push('/progress')" v-ripple
            class="transition-all duration-200 hover:duration-0 w-10 h-10 rounded mx-2 flex items-center justify-center hover:bg-gray-500 text-2xl fa fa-rocket">
          </div>
          <RouterLink to="/settings" v-ripple
            class="transition-all duration-200 hover:duration-0 w-10 h-10 rounded mx-2 flex items-center justify-center hover:bg-gray-500 text-2xl fa fa-gear">
          </RouterLink>
          <RouterLink to="/admin" v-ripple
            class="transition-all duration-200 hover:duration-0 w-10 h-10 rounded mx-2 flex items-center justify-center hover:bg-gray-500 text-2xl fa fa-hashtag">
          </RouterLink>
        </div>
        <div class="nav-right px-4 flex items-stretch">
          <RouterLink to="/" @click="" class="flex items-center justify-center text-2xl fa px-4 whitespace-pre-wrap	">
            {{ (window.glb.user && window.glb.user.lxt || 0) + ' ' }}
            <i class="fa fa-bolt"></i>
          </RouterLink>
          <RouterLink to="/" @click="e => window.glb.addNotf()"
            class="flex items-center justify-center text-2xl fa px-4 whitespace-pre-wrap	">
            {{ (window.glb.notifications.length) + ' ' }}
            <i class="fa-solid fa-comments "></i>
          </RouterLink>
          <RouterLink to="/logout" @click="logout"
            class="flex items-center justify-center text-2xl fa px-4 font-sans font-thin">
            Logout
          </RouterLink>
          <RouterLink to="/chat" class="flex items-center justify-center text-2xl fa fa-bars px-4">
          </RouterLink>
        </div>
      </div>
    </div>

    <RouterView class="w-full h-full flex flex-col bg-gray-900 overflow-auto " />

  </div>
</template>

<style lang="scss">
.my-awesome-json-theme {
  white-space: nowrap;
  color: #d4d4d4;
  font-size: 14px;
  font-family: Consolas, Menlo, Courier, monospace;

  .jv-ellipsis {
    color: #bbb;
    background-color: #444;
    display: inline-block;
    line-height: 0.9;
    font-size: 0.9em;
    padding: 0px 4px 2px 4px;
    border-radius: 3px;
    vertical-align: 2px;
    cursor: pointer;
    user-select: none;
  }

  .jv-button {
    color: #a2d6ff
  }

  .jv-key {
    color: #e6e6e6
  }

  .jv-item {
    &.jv-array {
      color: #e6e6e6
    }

    &.jv-boolean {
      color: #ff87b3
    }

    &.jv-function {
      color: #6ec4ff
    }

    &.jv-number {
      color: #ff87b3
    }

    &.jv-number-float {
      color: #ff87b3
    }

    &.jv-number-integer {
      color: #ff87b3
    }

    &.jv-object {
      color: #e6e6e6
    }

    &.jv-undefined {
      color: #ffb94e
    }

    &.jv-string {
      color: #9fdfa9;
      word-break: break-word;
      white-space: normal;
    }
  }

  .jv-code {
    .jv-toggle {
      &:before {
        padding: 0px 2px;
        border-radius: 2px;
      }

      &:hover {
        &:before {
          background: #444;
        }
      }
    }
  }
}
</style>