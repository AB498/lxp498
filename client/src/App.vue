<script>
import { defineComponent } from 'vue'


export default defineComponent({
  name: 'App'
})

</script>


<script setup>

import { useRoute, useRouter, RouterLink, RouterView } from 'vue-router'
import { ref, reactive, computed, watch, onMounted, onBeforeMount, onBeforeUnmount, onUnmounted } from 'vue'
import PopperComponent from "@/components/PopperComponent.vue";
import LoadingSpin from "@/components/LoadingSpin.vue";
import NotificationStack from "@/components/NotificationStack.vue";
import SelectLang from "@/components/SelectLang.vue";


import "vue3-json-viewer/dist/index.css";
import { io } from "socket.io-client";

import { createProxy, rjwatch, rjmod } from '@/composables/ReactiveJSON'
import { makeSyncer } from '@/composables/Syncer'
import tinycolor from "tinycolor2";



import Chance from 'chance';
var chance = new Chance();

let size = 30;
let opacity = 0.3;
let background = chance.color();
let lines = 20;
let circles = 10;
let triangles = 10;
let x = 0;
let y = 0;
let z = 0;
let rotate = 0;
var randomColor = chance.color({ format: 'hex' });
console.log('randomColor', randomColor);
function darkenColor(color, amount) {
  var darkColor = tinycolor(color).darken(amount).toString();
  return darkColor;
}
let perc = 50;

// Darken the generated color
var darkColor = darkenColor(randomColor, 0.1); // Adjust the darkness amount as needed
console.log('darkColor', darkColor);
// Generate a svg randomly
chance.mixin({
  svg: function (options) {
    options = options || {};
    options.size = options.max_size || 30;
    if (typeof options.lines === 'undefined') options.lines = 20;
    if (typeof options.circles === 'undefined') options.circles = 10;
    if (typeof options.triangles === 'undefined') options.triangles = 10;
    if (typeof options.opacity === 'undefined') options.opacity = 0.3;
    options.background = options.background || darkenColor(chance.color(), perc);

    // Create a coordinate within an area bigger than the svg
    function point(min, max) {
      return chance.integer({ min: min || -50, max: max || 150 });
    }

    // Generate the actual svg
    // Docs: developer.mozilla.org/en-US/docs/Web/SVG/Element/line
    // viewBox use: stackoverflow.com/q/17498855
    var svg = '<svg version="1.1" viewBox="0 0 100 100"';
    svg += 'xmlns="http://www.w3.org/2000/svg"';
    svg += "class=\"themed-bg-primary\"" + '>';
    for (var i = 0; i < options.lines; i++) {
      svg += '<line stroke="' + darkenColor(chance.color(), perc) + '" ';
      svg += 'stroke-width="' + point(1, 5) + '" ';
      svg += 'opacity="' + options.opacity + '" ';
      svg += 'x1="' + point() + '" y1="' + point() + '" ';
      svg += 'x2="' + point() + '" y2="' + point() + '" />';
    }
    for (var i = 0; i < options.circles; i++) {
      svg += '<circle cx="' + point() + '" ';
      svg += 'cy="' + point() + '" ';
      svg += 'r="' + point(1, options.max_size / 2) + '" ';
      svg += 'opacity="' + options.opacity + '" ';
      svg += 'fill="' + darkenColor(chance.color(), perc) + '"/>';
    }
    for (var i = 0; i < options.triangles; i++) {
      var s = size = options.max_size;
      svg += '<polygon fill="' + darkenColor(chance.color(), perc) + '" points="';
      svg += (x = point()) + ',' + (y = point()) + ' ';
      svg += (x + point(-s, s)) + ',' + (y + point(-s, s)) + ' ';
      svg += (x + point(-s, s)) + ',' + (y + point(-s, s));
      svg += '" opacity="' + options.opacity + '" ';
      svg += 'fill="' + darkenColor(chance.color(), perc) + '"/>';
    }
    return svg + '</svg>';
  }
});
// Function to darken the color


onMounted(() => {


  window.document.querySelector('#svgg').innerHTML = chance.svg({
    lines: 20,
    triangles: 10,
    circles: 10,
    max_size: 30,
    opacity: 0.7
  });
})

const route = useRoute()
const router = useRouter()
const URL = window.glb.baseUrl;

let syncer = makeSyncer(URL, {
  extraHeaders: {
    Authorization: `Bearer ${window.glb?.jwt || ''}`
  }
})
syncer.init()
window.syncer = syncer;

rjwatch(syncer.syncerObj, null, (o, n, p, k, v) => {
  window.glb.syncerObj = JSON.parse(JSON.stringify({ ...syncer.syncerObj }));
  window.glb.syncerObj = syncer.syncerObj;
})
rjwatch(syncer.syncerObj, 'error', (o, n, p, k, v) => {
  if (v) {
    window.glb.addNotf('error', v)
  }
})
window.glb.syncerObj = syncer.syncerObj;
// window.glb.syncerObjRef = syncer.syncerObj;


syncer.connectedCallbacks.push(() => {
  console.log("connected");
  window.glb.con = true;
})

syncer.disconnectedCallbacks.push(() => {
  console.log("disconnected");
  window.glb.con = false;
})

function logout() {
  window.glb.loggedIn = false
  window.glb.user = null
  window.glb.jwt = null
  window.glb._nonPersistant = {}
  router.push('/login');
}
// if (window.glb.user) {
//   console.log("connecting to socket");
//   window.glb.lxsocket.initializeSocket();
// }

const initializeLoad = ref(false);
watch([() => window.glb.loggedIn, initializeLoad], (newVal, oldVal) => {
  if (window.glb.loggedIn) {
    console.log("connecting to socket");
  } else {
    console.log("disconnecting from socket");
  }
})

initializeLoad.value = true;

window.glb._serverSynced = {};

// const URL = "http://localhost:8080";
const socketURL = window.glb.socketUrl;
const socketOptions = computed(() => ({
  extraHeaders: {
    Authorization: `Bearer ${window.glb?.jwt || ''}`
  }
}));

const searchCollapsed = ref(true);
const searchText = ref("");

//ds dsa
///// rnerwqa's


if (!window.glb._nonPersistant.wordTranslationStream)
  window.glb._nonPersistant.wordTranslationStream = {}

window.glb.putTranslation = (kvp, w) => {
  return new Promise((resolve, reject) => {
    w.resolver = resolve
    window.glb._nonPersistant.wordTranslationStream[kvp][w.id] = w;
  })
}

let trslnterv = setInterval(async () => {

  for (let streamkey in window.glb._nonPersistant.wordTranslationStream) {
    let keys = Object.values(window.glb._nonPersistant.wordTranslationStream[streamkey]).map(e => e.id)
    if (keys.length <= 0) continue
    console.log(streamkey + ' ' + keys.length)
    let words = Object.values(window.glb._nonPersistant.wordTranslationStream[streamkey]).map(e => e.word)
    let translated = await window.glb.safeAuthedReq('/api/getTranslation', {
      words: words,
      sourceLang: streamkey.split('-')[0],
      targetLang: streamkey.split('-')[1]
    })
    translated.forEach((e, i) => {
      window.glb._nonPersistant.wordTranslationStream[streamkey][keys[i]].translatedWord = e;
      window.glb._nonPersistant.wordTranslationStream[streamkey][keys[i]].resolver(e);
      delete window.glb._nonPersistant.wordTranslationStream[streamkey][keys[i]]
    })
  }
}, 1000);
onUnmounted(() => {
  if (trslnterv)
    clearInterval(trslnterv)
})


const darkmode = ref(false);



</script>


<template>
  <div id="root-app"
    class="whole relative h-screen w-screen flex flex-nowrap flex-col font-sans overflow-hidden themed-bg-primary themed-text-primary"
    :class="window.glb?.dark && ' dark'">
    <NotificationStack />
    <SelectLang class="absolute z-10" />
    <div id="svgg" class="h-screen w-screen absolute -z-10"></div>
    <div id="svggblur" class="h-screen w-screen absolute -z-10 backdrop-blur-sm"></div>
    <div class="w-full h-12  shadow-md  shrink-0 relative backdrop-blur-lg z-0">
      <div
        class="nav text-xl themed-bg-secondary  flex justify-between h-full  transition-all duration-200  shadow flex-nowrap w-full z-50">

        <div class="nav-right px-4 flex items-stretch">
          <q-tooltip hint="dsfdaf" />
          <PopperComponent>
            <template #tohover>
              <RouterLink to="/" class="flex items-center justify-center  fa  self-stretch space-x-2 font-sans font-thin">
                <!-- loading if not connected -->
                <i v-if="!window.glb.con" class="">
                  <q-spinner-radio color="brown" />
                </i>
                <span class="relative flex h-3 w-3 center" v-else>
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3 bg-yellow-500">

                  </span>
                </span>
                <div class="font-Galada text-4xl p-1">
                  Lx{{ window.glb.syncerObj?.a }}
                </div>
              </RouterLink>
            </template>
            <template #popup>
              <div class="w-full h-full">
                <JsonViewer
                  :value="Object.fromEntries(Object.entries(window.glb).filter(([k, v]) => typeof v != 'function'))"
                  class=" " theme="my-awesome-json-theme">
                </JsonViewer>
              </div>
            </template>
          </PopperComponent>

          <div
            class="  rounded-full h-8 self-center mx-2 themed-bg-secondary flex focus-within:bg-gray-600 focus-within:ring-2 ring-blue-500 transition-all">
            <input class="h-full rounded-full without-ring bg-transparent transition-all " placeholder="Search ..."
              :class="searchCollapsed ? 'w-0 px-0 m-0' : 'px-4  w-52'" v-model="searchText" />
            <a href=""
              class="fa self-center hover:text-yellow-600 w-8 h-8 rounded-full flex center hover:bg-gray-500/50 hover-ripple"
              :class="searchCollapsed ? 'fa-search' : 'fa-times'"
              @click.prevent="searchCollapsed = !searchCollapsed; searchText = ''"></a>
          </div>
        </div>
        <div class="nav-center  items-center transition-all duration-150 flex-nowrap space-x-1 sm:flex hidden"
          v-if="window.glb.loggedIn">
          <RouterLink to="/" v-ripple
            class="hover-ripple transition-all duration-200 hover:duration-0 w-10 h-10 rounded flex items-center justify-center hover:bg-gray-500">
            <q-icon name="home" class=""></q-icon>
          </RouterLink>
          <RouterLink to="/profile" v-ripple
            class="hover-ripple transition-all duration-200 hover:duration-0 w-10 h-10 rounded flex items-center justify-center hover:bg-gray-500">
            <q-icon name="account_circle" class=""></q-icon>
          </RouterLink>
          <RouterLink to="/chat" v-ripple
            class="hover-ripple transition-all duration-200 hover:duration-0 w-10 h-10 rounded flex items-center justify-center hover:bg-gray-500">
            <q-icon name="chat" class=""></q-icon>
          </RouterLink>
          <RouterLink to="/uploadbase" v-ripple
            class="hover-ripple transition-all duration-200 hover:duration-0 w-10 h-10 rounded flex items-center justify-center hover:bg-gray-500">
            <q-icon name="cloud_circle" class=""></q-icon>
          </RouterLink>
          <div @click="router.push('/progress')" v-ripple
            class="hover-ripple transition-all duration-200 hover:duration-0 w-10 h-10 rounded flex items-center justify-center hover:bg-gray-500">
            <q-icon name="model_training" class=""></q-icon>
          </div>
          <RouterLink to="/admin" v-ripple v-if="window.glb.user?.admin"
          class="hover-ripple transition-all duration-200 hover:duration-0 w-10 h-10 rounded flex items-center justify-center hover:bg-gray-500">
          <q-icon name="admin_panel_settings" class=""></q-icon>
          </RouterLink>
        </div>
        <div class="nav-right px-1 flex items-stretch flex-nowrap">
          <div class="nav-right px-4 flex items-stretch flex-nowrap" v-if="window.glb.loggedIn">
            <RouterLink to="/" @click="" class="flex items-center justify-center  fa px-2 whitespace-pre-wrap	">
              {{ (window.glb.user && window.glb.user.lxt || 0) + ' ' }}
              <i class="fa fa-bolt"></i>
            </RouterLink>
            <RouterLink to="/" @click="e => window.glb.addNotf()"
              class="flex items-center justify-center  fa px-2 whitespace-pre-wrap	">
              {{ (window.glb.notifications?.length) || '0' }}
              <i class="fa-solid fa-comments "></i>
            </RouterLink>

          </div>
          <div class="nav-right px-4 flex items-stretch flex-nowrap" v-else>
            <div class="text-md flex center px-2">
              <i class="fa fa-book m-2"></i>
              Documentation
            </div>
            <div class="text-md flex center px-2">
              <i class="fa fa-question m-2"></i>
              Help
            </div>
            <div class="text-md flex center px-2">
              <i class="fa fa-envelope m-2"></i>
              Contact
            </div>
          </div>
          <PopperComponent>
            <template #tohover>
              <q-toggle v-model="window.glb.dark" checked-icon="dark_mode" color="" unchecked-icon="light_mode">
              </q-toggle>
            </template>
            <template #popup>
              <div class="w-full h-full p-2">
                Currrently {{ window.glb.dark ? 'Dark' : 'Light' }}
              </div>
            </template>
          </PopperComponent>
          <PopperComponent :mode="'click'">
            <template #tohover>
              <i
                class="flex items-center justify-center  fa fa-bars px-4 cursor-pointer hover:bg-gray-500 hover-ripple transition-all duration-200 hover:duration-0 w-10 h-10 rounded"></i>
            </template>
            <template #popup>
              <div class="w-full  h-full flex flex-col">
                <div class="w-full p-2 px-4 space-x-2 effects flex center-cross" @click="logout">
                  <q-icon name="power_settings_new" class=""></q-icon>
                  <div>
                    Logout
                  </div>
                </div>
                <div class="w-full p-2 px-4 space-x-2 effects flex center-cross" @click="router.push('/profile')">
                  <q-icon name="account_circle" class=""></q-icon>
                  <div>
                    Profile
                  </div>
                </div>
                <div class="w-full p-2 px-4 space-x-2 effects flex center-cross" @click="router.push('/settings')">
                  <q-icon name="settings" class=""></q-icon>
                  <div>
                    Settings
                  </div>
                </div>

              </div>
            </template>
          </PopperComponent>
        </div>
      </div>

    </div>
    <div class="bg-red-900 w-full h-[2px]" v-loading-bar="{ loading: true, height: '2px' }"></div>
    <Suspense class="w-full h-full flex flex-col overflow-auto">
      <div class="w-full h-full flex flex-col overflow-auto">
        <RouterView class="w-full h-full flex flex-col overflow-auto " />
      </div>
      <template #fallback>
        <div class="full center">

          Loading...
        </div>
      </template>
    </Suspense>

  </div>
</template>

<style lang="scss">
.my-awesome-json-theme {
  white-space: nowrap;
  color: var(--text-primary);
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
    color: var(--text-secondary)
  }

  .jv-key {
    color: var(--text-primary)
  }

  .jv-item {
    &.jv-array {
      color: var(--text-tertiary)
    }

    &.jv-boolean {
      color: var(--text-tertiary)
    }

    &.jv-function {
      color: var(--text-tertiary)
    }

    &.jv-number {
      color: var(--text-tertiary)
    }

    &.jv-number-float {
      color: var(--text-tertiary)
    }

    &.jv-number-integer {
      color: var(--text-tertiary)
    }

    &.jv-object {
      color: var(--text-tertiary)
    }

    &.jv-undefined {
      color: #ffb94e
    }

    &.jv-string {
      color: var(--text-tertiary);
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