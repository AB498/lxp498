
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

import "vue3-json-viewer/dist/index.css";
import { io } from "socket.io-client";

import { createProxy, rjwatch, rjmod } from '@/composables/ReactiveJSON'
import { makeSyncer } from '@/composables/Syncer'
const route = useRoute()
const router = useRouter()
const URL = "http://localhost:3000";

let syncer = makeSyncer(URL)
syncer.init()

window.glb.syncerObj = reactive(syncer.syncerObj);
rjwatch(syncer.syncerObj, null, (newVal, oldVal) => {
  // window.glb.syncerObj = { ...syncer.syncerObj };
  window.glb.syncerObj = syncer.syncerObj;
  console.log('syncerObj changed', newVal, oldVal)
})
watch(window.glb.syncerObj, (newVal, oldVal) => {
  console.log('watch: syncerObj changed', newVal, oldVal)
})
syncer.syncerObj.a = 324

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

</script>


<template>
    <div class="whole h-screen w-screen flex flex-nowrap flex-col text-white font-sans overflow-auto">
      <NotificationStack />
      <div class="w-full h-16  shrink-0 sticky top-0 backdrop-blur-lg z-50">
        <div class="nav flex justify-between h-full bg-gray-800 transition-all duration-200  shadow flex-nowrap
        overflow-x-auto w-full">
          <div class="nav-right px-4 flex items-stretch">
            <PopperComponent>
              <template #tohover>
                <RouterLink to="/"
                  class="flex items-center justify-center text-2xl fa  self-stretch space-x-2 font-sans font-thin">
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
                    class="bg-zinc-800" theme="my-awesome-json-theme">
                  </JsonViewer>
                </div>
              </template>
            </PopperComponent>

            <div
              class="  rounded-full h-8 self-center mx-2 bg-zinc-700 flex focus-within:bg-gray-600 focus-within:ring-2 ring-blue-500 transition-all">
              <input class="h-full rounded-full without-ring bg-transparent transition-all " placeholder="Search ..."
                :class="searchCollapsed ? 'w-0 px-0 m-0' : 'px-4  w-52'" v-model="searchText" />
              <a href=""
                class="fa  text-gray-300 self-center hover:text-yellow-600 w-8 h-8 rounded-full flex center hover:bg-gray-500/50 hover-ripple"
                :class="searchCollapsed ? 'fa-search' : 'fa-times'"
                @click.prevent="searchCollapsed = !searchCollapsed; searchText = ''"></a>
            </div>
          </div>
          <div class="nav-center flex items-center transition-all duration-150 flex-nowrap" v-if="window.glb.loggedIn">
            <RouterLink to="/" v-ripple
              class="hover-ripple transition-all duration-200 hover:duration-0 w-10 h-10 rounded mx-2 flex items-center justify-center hover:bg-gray-500 text-2xl fa fa-home">
            </RouterLink>
            <RouterLink to="/profile" v-ripple
              class="hover-ripple transition-all duration-200 hover:duration-0 w-10 h-10 rounded mx-2 flex items-center justify-center hover:bg-gray-500 text-2xl fa fa-user">
            </RouterLink>
            <RouterLink to="/chat" v-ripple
              class="hover-ripple transition-all duration-200 hover:duration-0 w-10 h-10 rounded mx-2 flex items-center justify-center hover:bg-gray-500 text-2xl fa fa-comments">
            </RouterLink>
            <RouterLink to="/uploadbase" v-ripple
              class="hover-ripple transition-all duration-200 hover:duration-0 w-10 h-10 rounded mx-2 flex items-center justify-center hover:bg-gray-500 text-2xl fa fa-underline">
            </RouterLink>
            <div @click="router.push('/progress')" v-ripple
              class="hover-ripple transition-all duration-200 hover:duration-0 w-10 h-10 rounded mx-2 flex items-center justify-center hover:bg-gray-500 text-2xl fa fa-rocket">
            </div>
            <RouterLink to="/settings" v-ripple
              class="hover-ripple transition-all duration-200 hover:duration-0 w-10 h-10 rounded mx-2 flex items-center justify-center hover:bg-gray-500 text-2xl fa fa-gear">
            </RouterLink>
            <RouterLink to="/admin" v-ripple
              class="hover-ripple transition-all duration-200 hover:duration-0 w-10 h-10 rounded mx-2 flex items-center justify-center hover:bg-gray-500 text-2xl fa fa-hashtag">
            </RouterLink>
          </div>
          <div class="nav-right px-4 flex items-stretch flex-nowrap" v-if="window.glb.loggedIn">
            <RouterLink to="/" @click="" class="flex items-center justify-center text-2xl fa px-4 whitespace-pre-wrap	">
              {{ (window.glb.user && window.glb.user.lxt || 0) + ' ' }}
              <i class="fa fa-bolt"></i>
            </RouterLink>
            <RouterLink to="/" @click="e => window.glb.addNotf()"
              class="flex items-center justify-center text-2xl fa px-4 whitespace-pre-wrap	">
              {{ (window.glb.notifications?.length) || '0' }}
              <i class="fa-solid fa-comments "></i>
            </RouterLink>
            <RouterLink to="/logout" @click="logout"
              class="flex items-center justify-center text-2xl fa px-4 font-sans font-thin">
              Logout
            </RouterLink>
            <RouterLink to="/chat" class="flex items-center justify-center text-2xl fa fa-bars px-4">
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
            <RouterLink to="/chat" class="flex items-center justify-center text-2xl fa fa-bars px-4">
            </RouterLink>
          </div>
        </div>

      </div>
      <div class="bg-red-900 w-full h-[2px]" v-loading-bar="{ loading: true, height: '2px' }"></div>
      <Suspense class="w-full h-full flex flex-col bg-gray-900 overflow-auto">
        <div class="w-full h-full flex flex-col bg-gray-900 overflow-auto">
          <RouterView class="w-full h-full flex flex-col bg-gray-900 overflow-auto " />
        </div>
      </Suspense>

  </div>
</template>
